import { Router } from 'express'
import { user } from '../../../controllers'
const userRouter = Router()

userRouter.post('/', user.create)

export { userRouter }