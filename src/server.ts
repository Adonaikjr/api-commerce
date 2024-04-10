import { app } from './app'
import { env } from './env'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT || 3333,
  })
  .then(() => {
    console.log('server online')
  })
