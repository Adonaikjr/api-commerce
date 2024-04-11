import { FastifyInstance } from 'fastify'
import { register } from './Controller/register'
import { authenticate } from './Controller/autenticar'
import { TrendingController } from './Controller/treding-products'
import { user } from './Controller/user'
import { TradingFirstMany } from './Controller/trading-product-first'
import { TredingFeatures } from './Controller/treding-product-features'
import { TrendingControllerEletronic } from './Controller/treding-product-eletronic'
import { ControllerValorant } from './Controller/buscar-produto'
import { ControllerValorantFeature } from './Controller/treding-product-valorant-feature'
import { ControllerProductVencedor } from './Controller/product-vencedor'
import { ControllerMe } from './Controller/me'

export async function appRoutes(app: FastifyInstance) {
  app.post('/api/users', register)
  app.post('/api/sessions', authenticate)
  app.get('/api/me', ControllerMe)

  app.post('/user', user)
  app.get('/api/trending-products', TrendingController)
  app.get('/api/products:slug', TradingFirstMany)
  app.get('/api/feature', TredingFeatures)
  app.get('/api/TrendingControllerEletronic', TrendingControllerEletronic)
  app.get('/api/valorant', ControllerValorant)
  app.get('/api/feature/valorant', ControllerValorantFeature)
  app.get('/api/feature/valorant:slug', ControllerValorantFeature)
  app.get('/api/v1/product-vencedor', ControllerProductVencedor)
}
