/* eslint-disable camelcase */
import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
export async function ControllerValorantFeature(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { slug }: any = request.query

    if (slug) {
      const productSlug = await prisma.productValorant.findFirst({
        where: {
          slug,
        },
      })
      if (productSlug) {
        console.log(productSlug)
        return reply.status(200).send({ product: productSlug })
      } else {
        return reply.status(404).send({ message: 'Product not found' })
      }
    } else {
      const allProductsOriginals = await prisma.productValorant.findMany()
      return reply.status(200).send({ products: allProductsOriginals })
    }
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
}
