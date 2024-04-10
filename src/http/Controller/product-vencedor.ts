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

export async function ControllerProductVencedor(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // const trendingProducts = await getTrendingProducts()
    const trendingProducts: Product[] = []
    for (let i = 1; i <= 58; i++) {
      console.log('loop: ', `${i}`)
      const products = await getTrendingProducts(i)
      trendingProducts.push(...products)
      await new Promise((resolve) => setTimeout(resolve, 8000))
    }
    reply.send(trendingProducts)
  } catch (error) {
    console.error('An error occurred:', error)
    reply
      .status(500)
      .send({ error: 'An error occurred while fetching trending products' })
  }
}
function generateRandomIp() {
  // Gerar quatro números aleatórios entre 0 e 255
  const part1 = Math.floor(Math.random() * 256)
  const part2 = Math.floor(Math.random() * 256)
  const part3 = Math.floor(Math.random() * 256)
  const part4 = Math.floor(Math.random() * 256)

  // Concatenar os números para formar o endereço IP
  const ipAddress = `${part1}.${part2}.${part3}.${part4}`

  return ipAddress
}
async function getTrendingProducts(i: number): Promise<Product[]> {
  try {
    const ip = generateRandomIp()
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': ip })
    await page.goto(
      `https://pt.aliexpress.com/w/wholesale-lampada.html?page=${i}&g=y&SearchText=lampada`,
      { waitUntil: 'networkidle2' },
    )

    const productElements = await page.$$('.card--out-wrapper')
    const products: any[] = []

    for (const element of productElements) {
      // const productName = await element.$eval(
      //   '.multi--titleText--nXeOvyr',
      //   (el) => el.textContent?.trim() || '',
      // )
      // const slugName = await element.$eval(
      //   '.multi--titleText--nXeOvyr',
      //   (el) => el.textContent?.trim() || '',
      // )
      // const productPriceText = await element.$eval(
      //   '.multi--price-original--1zEQqOK',
      //   (el) => el.textContent?.trim() || '',
      // )

      // const soldText = await element.$eval(
      //   '.multi--trade--Ktbl2jB',
      //   (el) => el.textContent?.trim() || '',
      // )
      // console.log(soldText)
      // const productLink = await element.$eval(
      //   'a[href]',
      //   (el) => el.getAttribute('href') || '',
      // )
      const [
        productNameElement,
        slugNameElement,
        productPriceElement,
        soldTextElement,
        productLinkElement,
      ] = await Promise.all([
        element.$('.multi--titleText--nXeOvyr'),
        element.$('.multi--titleText--nXeOvyr'),
        element.$('.multi--price-original--1zEQqOK'),
        element.$('.multi--trade--Ktbl2jB'),
        element.$('a[href]'),
      ])

      const productName = productNameElement
        ? await productNameElement.evaluate((el: any) => el.textContent.trim())
        : ''
      const slugName = slugNameElement
        ? await slugNameElement.evaluate((el: any) => el.textContent.trim())
        : ''
      const productPriceText = productPriceElement
        ? await productPriceElement.evaluate((el: any) => el.textContent.trim())
        : ''
      const productPrice = parseFloat(
        productPriceText.replace('R$', '').replace(',', '.'),
      ) // Remove 'R$' e substitui ',' por '.'
      const soldText = soldTextElement
        ? await soldTextElement.evaluate((el: any) => el.textContent.trim())
        : ''
      console.log('sold ==>', soldText)
      const productLink = productLinkElement
        ? await productLinkElement.evaluate((el: any) =>
            el.getAttribute('href'),
          )
        : ''
      const productImages = await element.$$eval(
        '.images--imageWindow--1Z-J9gn .images--item--3XZa6xf',
        (imgs) =>
          imgs.map((img) => {
            let src = img.getAttribute('src') || ''
            if (!src.startsWith('https://')) {
              src = 'https:' + src
            }
            return src
          }),
      )

      // Verifica se alguma URL da imagem contém "data:image/png;base64"
      if (productImages.some((src) => src.includes('data:image/png;base64'))) {
        console.log(
          `Imagem inválida para "${productName}". Pulando a inserção.`,
        )
        continue // Pula para o próximo produto
      }

      if (
        productName &&
        productPrice &&
        productLink &&
        productImages.length > 0 && // Verifica se há pelo menos uma imagem
        slugName
      ) {
        const existingProducts = await prisma.productVencedor.findMany({
          where: { title: productName },
        })

        // Verifica se já existe algum produto com o mesmo título
        if (existingProducts.length === 0) {
          // Se não houver nenhum produto com o mesmo título, insere-o no banco de dados
          await prisma.productVencedor.create({
            data: {
              description: '',
              title: productName,
              slug: slugName.replace(/\s+/g, '-'),
              price: productPrice,
              link: productLink,
              sold: soldText,
              images: productImages, // Insere todas as URLs de imagem
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
            image: productImages,
            sold: soldText,
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
