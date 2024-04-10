import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function TradingFirstMany(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const typesUserBody = z.object({
    filtro: z.string(),
  })
  const { filtro } = typesUserBody.parse(request.query)
  try {
    // Obtendo todos os produtos do banco de dados
    const allProducts = await prisma.product.findMany()

    const filteredProducts = allProducts.filter((product) =>
      product.slug.toLowerCase().includes(slug.toLowerCase()),
    )
    return reply.status(200).send(filteredProducts)
  } catch (error) {
    console.log(error)
    return reply.status(500).send({ message: 'erro connect db' })
  }
}
