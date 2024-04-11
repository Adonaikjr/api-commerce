/* eslint-disable camelcase */

import { PrismaUserRepositories } from '@/repositories/prisma/prisma-user-repositories'
import { AutenticarUser } from '@/user-cases/autenticarUser'
import { UserCheckErrors } from '@/user-cases/errors/user-check-errors'
import { autenticarUserCase } from '@/user-cases/factories/autenticarUserCase'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)
  try {
    const authenticateUseCase = autenticarUserCase()
    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user.id,
        },
      },
    )

    return reply.status(200).send({
      token,
    })
  } catch (err) {
    if (err instanceof UserCheckErrors) {
      return reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
