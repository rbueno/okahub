import { Response } from 'express'
import { Apps, Workspaces } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'

export const find = async (request: CustomRequest, response: Response) => {
    const { workspaceId } = request
    const workspace = await Workspaces.findById(workspaceId)
    if (!workspace) return response.status(500).json({ message: 'Ocorreu um erro inesperado' })
    
    const apps = await Apps.find({ businessId: workspace.businessId, active: true })

    console.log('== apps', apps)
    if (!apps.length) {
        return response.status(400).json({ message: 'Nenhum app encontrado' })
    }

    response.status(200).json({ apps })
}