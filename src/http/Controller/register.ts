/* eslint-disable camelcase */

import { UserErrors } from '@/user-cases/errors/user-exist-errors'
import { registerUserCase } from '@/user-cases/factories/registerUserCase'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const typesUserBody = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  })
  const { name, email, password } = typesUserBody.parse(request.body)

  try {
    const registerUserCases = registerUserCase()

    await registerUserCases.execute({
      name,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof UserErrors) {
      return reply.status(409).send({ message: error.message })
    }
    throw error
  }

  return reply.status(201).send()
}
