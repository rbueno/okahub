import { Router } from 'express'
import { routerV1 } from './v1'
import { hook } from '../controllers'

const routes = Router()

routes.use('/v1', routerV1)
routes.post('/hooks/catch/:hookId', hook.createOrUpdate)
routes.get('/health', async (request, response) => {
    response.status(200).json({ message: `Live - ${new Date()}` })
})

export { routes }