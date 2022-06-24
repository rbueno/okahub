import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { Apps  } from '../../../models'
import { handleDealByApp } from '../../../services'

export const createOrUpdate = async (request: Request, response: Response) => {
    const { hookId } = request.params
    const { body } = request
    const query: any = request.query

    if (query && query['hub.verify_token']) {
        return response.status(200).json({ 'hub.challenge': query['hub.challenge']})
    }

    if (!isValidObjectId(hookId)) return response.status(400).json({ message: 'Endereço inválido. Contate Okahub para ajuda' })
    
    const app = await Apps.findOne({ _id: hookId }).populate('businessId')
    // const app = await Apps.findOne({ _id: hookId, active: true })
    if (!app) return response.status(400).json({ message: 'Endereço inválido. Contate Okahub para ajuda' })
    
    await handleDealByApp[app.source](app, body)
    return response.status(200).send()
}
