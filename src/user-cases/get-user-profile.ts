/* eslint-disable no-useless-constructor */
import { UsersRepository } from '@/repositories/user-repository'
import { User } from '@prisma/client'
import { ResourceNotFoundError } from './errors/erro-not-found'

interface PropsRequest {
  userId: string
}
interface PropsResponse {
  user: User
}

export class GetUserProfileUseCase {
  constructor(private userRepository: UsersRepository) {}

  async execute({ userId }: PropsRequest): Promise<PropsResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return { user }
  }
}
