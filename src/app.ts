import fastify from 'fastify'
import { ZodError } from 'zod'
import { appRoutes } from './http/routes'
import cron from 'node-cron'

export const app = fastify()

// app.post('/users', register)
app.register(appRoutes)
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     // Simule uma requisição GET para '/api/trending-products' passando null como request e reply
//     await app.inject({
//       method: 'GET',
//       url: '/api/trending-products',
//     })
//     console.log('Rota /api/trending-products chamada com sucesso!')
//   } catch (error) {
//     console.error('Erro ao chamar a rota /api/trending-products:', error)
//   }
// })
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Erro na validação!', issues: error.format() })
  }

  return reply.status(500).send({ message: 'erro interno' })
})
