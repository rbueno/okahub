import { Router } from 'express'
import { authMiddleware } from '../../../middlewares'
import { activitylog } from '../../../controllers'

const activitylogRouter = Router()

activitylogRouter.get('/', authMiddleware, activitylog.findByDeal)

export { activitylogRouter }