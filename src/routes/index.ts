import { Router } from 'express'
import { routerV1 } from './v1'
import { hook } from '../controllers'

const routes = Router()

routes.use('/v1', routerV1)
routes.post('/hooks/catch/:hookId', hook.createOrUpdate)

export { routes }