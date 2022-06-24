import { isValidObjectId } from 'mongoose'
import { Request, Response } from 'express'
import { Apps  } from '../../../models'
import { handleDealByApp } from '../../../services'

export const find = async (request: Request, response: Response) => {
    const { hookId } = request.params
    const { body } = request
    const query: any = request.query

    if (query && query['hub.challenge']) {
        return response.status(200).send(query['hub.challenge'])
    }
    return response.status(400).send()
}
