import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { isValidObjectId } from 'mongoose'


export interface CustomRequest extends Request {
    authPayload?: any
    workspaceId?: any
}

export const authMiddleware = async (request: CustomRequest, response: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> => {
    const { authorization } = request.headers
    const auth = authorization?.split(' ')[1]

    if (!auth) return response.status(401).json({ message: 'Forbidden' })

    const workspaceId = isValidObjectId(request.headers['x-workspaceid']) ? request.headers['x-workspaceid'] : null

    try {
        const userPayload = jwt.verify(auth || '', process.env.DECODEJWT || '')
        if (!userPayload) return response.status(401).json({ message: 'Forbidden' })
    
        request.authPayload = userPayload
        request.workspaceId = workspaceId
        return next()
        
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: 'Unknown error'})
    }
}