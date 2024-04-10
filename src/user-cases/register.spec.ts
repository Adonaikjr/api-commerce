// import { PrismaUserRepositories } from '@/repositories/prisma/prisma-user-repositories'
import { describe, expect, it } from 'vitest'
import { RegisterUseCases } from './register'
import { compare } from 'bcryptjs'
import { MemoryUser } from '@/repositories/MemoryUser/in-memory-user-repository'
import { UserErrors } from './errors/user-exist-errors'
import { registerUserCase } from './factories/registerUserCase'

describe('registro de user-cases', () => {
  const registroUseCase = registerUserCase()

  it('espero que o usuario seja criado', async () => {
    const { user } = await registroUseCase.execute({
      name: 'john doe',
      email: 'johndoe@john.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('espero que a senha do usuario seja um hash', async () => {
    const userMemoryRepository = new MemoryUser()
    const registroUseCase = new RegisterUseCases(userMemoryRepository)

    const { user } = await registroUseCase.execute({
      name: 'john doe',
      email: 'johndoe@john.com',
      password: '123456',
    })

    console.log(user.password_hash)

    const isPasswordHash = await compare('123456', user.password_hash)
    expect(isPasswordHash)
  })

  it('espero que não seja possivel cadastrar um usuario com um email já existente', async () => {
    const userMemoryRepository = new MemoryUser()
    const registroUseCase = new RegisterUseCases(userMemoryRepository)

    const email = 'johndoe@john.com'

    await registroUseCase.execute({
      name: 'john doe',
      email,
      password: '123456',
    })

    // reject -> espero que ocorra um erro
    await expect(() =>
      registroUseCase.execute({
        name: 'john doe',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserErrors)
  })
})
