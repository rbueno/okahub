import { Response } from 'express'
import { Workspaces } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { getWorkspaceSession } from '../../../services/workspaces'

export const deleteWorkspace = async (request: CustomRequest, response: Response) => {
    const { workspaceId } = request.params
    const { userId } = request.authPayload

    try {
        const workspace = await Workspaces.findById(workspaceId)
        if (!workspace) return response.status(500).json({ message: 'Erro inesperado' })
        if (workspace.roles.includes('owner')) return response.status(400).json({ message: 'Você não pode remover este negócio' })

        workspace.active = false
        await workspace.save()

        const workspaceSession = await getWorkspaceSession({ userId })

        response.status(200).json({ workspaceSession })
    } catch (error) {
        console.log(error)
    }
}