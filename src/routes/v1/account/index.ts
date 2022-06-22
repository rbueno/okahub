import { Router } from 'express'
import { show } from '../../../controllers/Account'
import { authMiddleware } from '../../../middlewares'

const accountRouter = Router()

accountRouter.get('/', authMiddleware, show)

export { accountRouter }