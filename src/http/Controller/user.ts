/* eslint-disable camelcase */

import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function user(request: FastifyRequest, reply: FastifyReply) {
  const typesUserBody = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  })
  const { name, email, password } = typesUserBody.parse(request.body)
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    })
    return reply.status(201).send(user)
  } catch (error) {
    console.log(error)
    return reply.status(500).send({ message: 'erro connect db' })
  }
}
