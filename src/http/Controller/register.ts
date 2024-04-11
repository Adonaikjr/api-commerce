/* eslint-disable camelcase */

import { UserErrors } from '@/user-cases/errors/user-exist-errors'
import { registerUserCase } from '@/user-cases/factories/registerUserCase'
import { hash } from 'bcryptjs'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const typesUserBody = z.object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
  })
  const { name, email, password } = typesUserBody.parse(request.body)
  console.log(name, email, password)
  try {
    const registerUserCases = registerUserCase()

    const pass_hash = await hash(password, 6)
    const user = await registerUserCases.execute({
      name,
      email,
      password: pass_hash,
    })
    return reply.status(201).send({ user })
  } catch (error) {
    if (error instanceof UserErrors) {
      return reply.status(409).send({ message: error.message })
    }
    throw error
  }
}
