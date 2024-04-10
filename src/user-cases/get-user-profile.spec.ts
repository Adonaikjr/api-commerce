import { MemoryUser } from '@/repositories/MemoryUser/in-memory-user-repository'
import { ResourceNotFoundError } from '@/user-cases/errors/erro-not-found'
import { GetUserProfileUseCase } from '@/user-cases/get-user-profile'
import { hash } from 'bcryptjs'
import { expect, describe, it, beforeEach } from 'vitest'

let usersRepository: MemoryUser
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
  beforeEach(() => {
    usersRepository = new MemoryUser()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  it('should be able to get user profile', async () => {
    const createdUser = await usersRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await sut.execute({
      userId: createdUser.id,
    })

    expect(user.name).toEqual('John Doe')
  })

  it('should not be able to get user profile with wrong id', async () => {
    await expect(() =>
      sut.execute({
        userId: 'n',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })
})
