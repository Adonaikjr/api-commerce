/* eslint-disable no-useless-constructor */
import { UsersRepository } from '@/repositories/user-repository'
import { UserCheckErrors } from './errors/user-check-errors'
import { compare, hash } from 'bcryptjs'
import { User } from '@prisma/client'

interface PropsAutenticRequest {
  email: string
  password: string
}
interface PropsAutenticResponse {
  user: User
}

export class AutenticarUser {
  constructor(private userRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: PropsAutenticRequest): Promise<PropsAutenticResponse> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new UserCheckErrors()
    }
    const isPasswordCheck = await compare(password, user.password)
    if (!isPasswordCheck) {
      throw new UserCheckErrors()
    }
    return { user }
  }

  async executeUserFirst(userId: string) {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserCheckErrors()
    }
    return { user }
  }
}
