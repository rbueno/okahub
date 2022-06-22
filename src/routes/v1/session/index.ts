import { Router } from 'express'
import { create } from '../../../controllers/Session'

const sessionRouter = Router()

sessionRouter.post('/', create)

export { sessionRouter }