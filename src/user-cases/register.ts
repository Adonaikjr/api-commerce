/* eslint-disable no-useless-constructor */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { UsersRepository } from '@/repositories/user-repository'
import { hash } from 'bcryptjs'
import { UserErrors } from './errors/user-exist-errors'
import { User } from '@prisma/client'

interface PropsRegister {
  name: string
  email: string
  password: string
}
interface PropsUser {
  user: User
}
export class RegisterUseCases {
  constructor(private userRepository: UsersRepository) {}

  async execute({ name, email, password }: PropsRegister): Promise<PropsUser> {
    const checkUserEmail = await this.userRepository.findByEmail(email)

    if (checkUserEmail) {
      throw new UserErrors()
    }
    const password_hash = await hash(password, 6)

    const user = await this.userRepository.create({
      name,
      email,
      password,
    })
    console.log(user)
    return { user }
  }
}
