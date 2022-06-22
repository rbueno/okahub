import { Response } from 'express'
import { Workspaces } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'

export const find = async (request: CustomRequest, response: Response) => {
    const { workspaceId } = request.params

    try {
        const workspace = await Workspaces.findById(workspaceId).populate('userId').lean()
        if (!workspace) return response.status(500).json({ message: 'Erro inesperado' })

        response.status(200).json(workspace)
    } catch (error) {
        console.log(error)
    }
}