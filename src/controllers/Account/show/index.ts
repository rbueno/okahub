import { Response } from 'express'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { getWorkspaceSession } from '../../../services/workspaces'


export const show = async (request: CustomRequest, response: Response) => {
    const { workspaceId } = request
    const { userId } = request.authPayload
    
    const workspaceSession = await getWorkspaceSession({ userId, workspaceId })

    try {
        return response.status(200).json({ workspaceSession })
    } catch (error) {
        console.log(error)
    }
}