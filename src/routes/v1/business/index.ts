import { Router } from 'express'
import { authMiddleware } from '../../../middlewares'
import { business } from '../../../controllers'

const businessRouter = Router()

businessRouter.post('/', authMiddleware, business.create)
businessRouter.put('/', authMiddleware, business.update)

export { businessRouter }