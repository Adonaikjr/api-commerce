import { PrismaClient } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()

interface Product {
  title: string
  price: number
  link: string
  image: string
  slug: string
  description: string
  featured: boolean
}

export async function TrendingControllerEletronic(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const trendingProducts: Product[] = []
    for (let i = 1; i <= 3; i++) {
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
      // `https://pt.aliexpress.com/w/wholesale-Consoles-De-Videogame.html?page=${i}&g=y&SearchText=Consoles+De+Videogame`,
      `https://pt.aliexpress.com/w/wholesale-valorant.html?page=${i}&g=y&SearchText=valorant`,
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
      )

      const productLink = await element.$eval(
        'a[href]',
        (el) => el.getAttribute('href') || '',
      )
      const productImage = await element.$eval(
        'img',
        (el) => el.getAttribute('src') || '',
      )

      if (
        productName &&
        productPrice &&
        productLink &&
        productImage &&
        slugName
      ) {
        const existingProduct = await prisma.eletronicos.findFirst({
          where: { title: productName },
        })

        if (!existingProduct) {
          const createdProduct = await prisma.eletronicos.create({
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

          products.push(createdProduct)
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
