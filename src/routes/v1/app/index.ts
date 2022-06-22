import { Router } from 'express'
import { authMiddleware } from '../../../middlewares'
import { app } from '../../../controllers'

const appRouter = Router()

appRouter.post('/', authMiddleware, app.create)
appRouter.get('/', authMiddleware, app.find)
appRouter.delete('/:appId', authMiddleware, app.deleteApp)

export { appRouter }