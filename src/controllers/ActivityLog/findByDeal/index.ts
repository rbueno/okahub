import { Response } from 'express'
import { Workspaces, ActivityLogs } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'


export const findByDeal = async (request: CustomRequest, response: Response) => {
    const { workspaceId } = request
    const dealId = request.query.c

    if(!dealId) return response.status(400).json({ message: 'Deal não encontrado' })

    const workspace = await Workspaces.findById(workspaceId)
    if (!workspace) return response.status(500).json({ message: 'Ocorreu um erro inesperado' })

    const whereClause = { dealId, businessId: workspace.businessId }

    try {
        const activityLogs = await ActivityLogs.find(whereClause).sort({ createdAt: -1 })
        response.status(200).json(activityLogs)
    } catch (error) {
        console.log(error)
    }

   
}