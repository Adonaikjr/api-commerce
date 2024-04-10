/* eslint-disable camelcase */

import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function TredingFeatures(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const allProducts = await prisma.productTrand.findMany()
    const allProductsOriginals = await prisma.product.findMany()
    const mergedProducts = [...allProducts, ...allProductsOriginals]
    return reply.status(201).send({ products: mergedProducts })
  } catch (error) {
    console.log(error)
    return reply.status(500).send({ message: 'erro connect db' })
  }
}
