import { Response } from 'express'
import { Workspaces, Deals } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { createPagination } from '../../../utils'


export const findAll = async (request: CustomRequest, response: Response) => {
       // app filtrar deals com businessID = app
    // filtrar deals por user owner
    // filtar deal por admin (mostrar todos por exemplo sem limitação de owner)
    const { workspaceId } = request
    const { dealPipe } = request.query

    try {
        const workspace = await Workspaces.findById(workspaceId).populate('userId').lean()
        if (!workspace) return response.status(500).json({ message: 'Erro inesperado' })

   
        const whereClause = {
            businessId: workspace.businessId,
            ...(dealPipe === 'customers' ? { isCustomer: true } : {})
         }
        
        console.log('whereClause', whereClause)
        // const deals = await Deals.find(whereClause)
        const deals = await Deals.find()
        const paging = createPagination({ totalItems: deals.length })
        
        response.status(200).json({ paging, deals })
    } catch (error) {
        console.log(error)
    }

   
}