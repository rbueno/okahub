import { Response } from 'express'
import { Workspaces, Deals } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'


export const find = async (request: CustomRequest, response: Response) => {
       // app filtrar deals com businessID = app
    // filtrar deals por user owner
    // filtar deal por admin (mostrar todos por exemplo sem limitação de owner)
    const { dealId } = request.params

    console.log('=========== dealId', dealId)
    try {
        
        const deal = await Deals.findById(dealId)
        console.log('=========== find deal', deal)
        
        response.status(200).json(deal)
    } catch (error) {
        console.log(error)
    }

   
}