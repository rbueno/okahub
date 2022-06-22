import { Router } from 'express'
import { authMiddleware } from '../../../middlewares'
import { workspace } from '../../../controllers'

const workspaceRouter = Router()

workspaceRouter.post('/', authMiddleware, workspace.create)
workspaceRouter.get('/:workspaceId', authMiddleware, workspace.find)
workspaceRouter.delete('/:workspaceId', authMiddleware, workspace.deleteWorkspace)

export { workspaceRouter }