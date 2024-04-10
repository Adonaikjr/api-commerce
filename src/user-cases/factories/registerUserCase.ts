import { MemoryUser } from '@/repositories/MemoryUser/in-memory-user-repository'
import { RegisterUseCases } from '../register'
import { PrismaUserRepositories } from '@/repositories/prisma/prisma-user-repositories'
export function registerUserCase() {
  const userMemoryRepository = new PrismaUserRepositories()
  const registroUseCase = new RegisterUseCases(userMemoryRepository)
  return registroUseCase
}
