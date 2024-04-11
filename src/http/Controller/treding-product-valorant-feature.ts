/* eslint-disable camelcase */
import { prisma } from '@/lib/prisma';
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Define schema for pagination query parameters
const paginationSchema = z.object({
  skip: z.number().nonnegative().optional(),
  take: z.number().positive().optional(),
});

export async function ControllerValorantFeature(
  request: FastifyRequest<{ Querystring: z.infer<typeof paginationSchema> }>,
  reply: FastifyReply,
) {
  try {
    const { slug } = request.query;
    const { skip = 0, take = 10 } = paginationSchema.safeParse(request.query); // Validate and get defaults

    if (slug) {
      const productSlug = await prisma.productValorant.findFirst({
        where: {
          slug,
        },
      });
      if (productSlug) {
        console.log(productSlug);
        return reply.status(200).send({ product: productSlug });
      } else {
        return reply.status(404).send({ message: 'Product not found' });
      }
    } else {
      const allProducts = await prisma.productValorant.findMany({
        skip, // Apply skip for pagination
        take, // Apply take for pagination
      });
      const totalProducts = await prisma.productValorant.count(); // Count total products
      return reply.status(200).send({ products: allProducts, total: totalProducts });
    }
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
}
