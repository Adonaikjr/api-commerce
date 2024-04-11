/* eslint-disable camelcase */

import { PrismaUserRepositories } from '@/repositories/prisma/prisma-user-repositories'
import { AutenticarUser } from '@/user-cases/autenticarUser'
import { UserCheckErrors } from '@/user-cases/errors/user-check-errors'
import { autenticarUserCase } from '@/user-cases/factories/autenticarUserCase'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function ControllerMe(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
    const authenticateUseCase = autenticarUserCase()
    const { user } = await authenticateUseCase.executeUserFirst(
      request.user.sub,
    )

    return reply.status(200).send({
      user: {
        ...user,
        password: undefined,
      },
    })
  } catch (error) {
    return reply.status(404).send({ message: 'not authenticate' })
  }
}
