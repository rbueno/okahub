import { Router } from 'express'
import { authMiddleware } from '../../../middlewares'
import { deal } from '../../../controllers'

const dealRouter = Router()

dealRouter.get('/', authMiddleware, deal.findAll)
dealRouter.get('/:dealId', authMiddleware, deal.find)

export { dealRouter }