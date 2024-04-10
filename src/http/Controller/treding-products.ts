import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'
import puppeteer from 'puppeteer'

interface Product {
  title: string
  price: number
  link: string
  image: string
  slug: string
  description: string
  featured: boolean
}

export async function TrendingController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // const trendingProducts = await getTrendingProducts()
    const trendingProducts: Product[] = []
    for (let i = 1; i <= 2; i++) {
      console.log('loop: ', `${i}`)
      const products = await getTrendingProducts(i)
      trendingProducts.push(...products)
    }
    reply.send(trendingProducts)
  } catch (error) {
    console.error('An error occurred:', error)
    reply
      .status(500)
      .send({ error: 'An error occurred while fetching trending products' })
  }
}

async function getTrendingProducts(i: number): Promise<Product[]> {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(
      `https://pt.aliexpress.com/w/wholesale-trending.html?page=${i}&g=y&SearchText=trending`,
      // 'https://pt.aliexpress.com/w/wholesale-trending-products-2024-dropshipping.html?spm=a2g0o.productlist.auto_suggest.3.2a5duQtauQtagM',
      // 'https://pt.aliexpress.com/w/wholesale-trending.html?spm=a2g0o.productlist.search.0',
      { waitUntil: 'networkidle2' },
    )

    const productElements = await page.$$('.card--out-wrapper')
    const products: Product[] = []

    for (const element of productElements) {
      const productName = await element.$eval(
        '.multi--titleText--nXeOvyr',
        (el) => el.textContent?.trim() || '',
      )
      const slugName = await element.$eval(
        '.multi--titleText--nXeOvyr',
        (el) => el.textContent?.trim() || '',
      )
      const productPriceText = await element.$eval(
        '.multi--price-original--1zEQqOK',
        (el) => el.textContent?.trim() || '',
      )
      const productPrice = parseFloat(
        productPriceText.replace('R$', '').replace(',', '.'),
      ) // Remove 'R$' e substitui ',' por '.'

      const productLink = await element.$eval(
        'a[href]',
        (el) => el.getAttribute('href') || '',
      )
      const productImage = await element.$eval(
        'img',
        (el) => el.getAttribute('src') || '',
      )
      // Verifica se a URL da imagem contém "data:image/png;base64"
      if (
        productImage?.includes('data:image/png;base64') ||
        productImage?.includes('https')
      ) {
        console.log(
          `imagem fudida "${productName}" é um base64. Pulando a inserção.`,
        )
        continue // Pula para o próximo produto
      }

      if (
        productName &&
        productPrice &&
        productLink &&
        productImage &&
        slugName
      ) {
        const existingProducts = await prisma.productTrand.findMany({
          where: { title: productName },
        })

        // Verifica se já existe algum produto com o mesmo título
        if (existingProducts.length === 0) {
          // Se não houver nenhum produto com o mesmo título, insere-o no banco de dados
          await prisma.productTrand.create({
            data: {
              description: '',
              title: productName,
              slug: slugName.replace(/\s+/g, '-'),
              price: productPrice,
              link: productLink,
              image: `https:${productImage}`,
              featured: true,
            },
          })

          // Adiciona o produto à lista de produtos apenas se não existir no banco de dados
          products.push({
            description: '',
            title: productName,
            slug: slugName.replace(/\s+/g, '-'),
            price: productPrice,
            link: productLink,
            image: `https:${productImage}`,
            featured: true,
          })
        } else {
          console.log(`PRODUTO EXISTENTE "${productName}".`)
        }
      }
    }

    await browser.close()
    console.log('produtos adicionados: ', products.length)
    return products
  } catch (error) {
    console.error('An error occurred:', error)
    return []
  }
}
