import { PrismaUserRepositories } from '@/repositories/prisma/prisma-user-repositories'
import { AutenticarUser } from '../autenticarUser'

export function autenticarUserCase() {
  const useRepository = new PrismaUserRepositories()
  const autenticarUseCase = new AutenticarUser(useRepository)
  return autenticarUseCase
}
