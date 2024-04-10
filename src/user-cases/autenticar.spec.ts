// import { PrismaUserRepositories } from '@/repositories/prisma/prisma-user-repositories'
import { beforeEach, describe, expect, it } from 'vitest'
import { hash } from 'bcryptjs'
import { MemoryUser } from '@/repositories/MemoryUser/in-memory-user-repository'
import { AutenticarUser } from './autenticarUser'
import { UserCheckErrors } from './errors/user-check-errors'

let userMemoryRepository: MemoryUser
let autenticarUser: AutenticarUser

describe('autenticação de user-cases', () => {
  beforeEach(() => {
    userMemoryRepository = new MemoryUser()
    autenticarUser = new AutenticarUser(userMemoryRepository)
  })

  it('espero que o usuario seja autenticado', async () => {
    // primeiro crie o usuario
    await userMemoryRepository.create({
      name: 'john doe',
      email: 'johndoe@exemple.com',
      password_hash: await hash('123456', 6),
    })
    // verifique se ele está autenticado
    const { user } = await autenticarUser.execute({
      email: 'johndoe@exemple.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('espero que o usuario receba a mensagem de email invalido', async () => {
    // verifique se o email é valido
    expect(() =>
      autenticarUser.execute({
        email: 'johndoe@exemple.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserCheckErrors)
  })

  it('espero que o usuario receba a mensagem de password invalido', async () => {
    // primeiro crie o usuario
    await userMemoryRepository.create({
      name: 'john doe',
      email: 'johndoe@exemple.com',
      password_hash: await hash('123456', 6),
    })
    // verifique se o email é valido
    expect(() =>
      autenticarUser.execute({
        email: 'johndoe@exemple.com',
        password: '1234567',
      }),
    ).rejects.toBeInstanceOf(UserCheckErrors)
  })
})
