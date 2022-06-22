import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Users } from '../../../models'
import { getWorkspaceSession } from '../../../services/workspaces'
export const create = async (request: Request, response: Response) => {
    const { email, password } = request.body
    if (!email || !password) return response.status(400).json({ message: 'All fields are required' })

    const user: any = await Users.findOne({ email: email.trim() }).populate({ path: 'workspaces', match: { active: true } })
    console.log('create session user', user)
    if (!user) return response.status(400).json({ message: 'Credenciais não estão corretas'})

    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    if (!isPasswordCorrect) return response.status(401).json({ message: 'Credenciais não estão corretas'})


    const workspaceSession = await getWorkspaceSession({ userId: user._id, userSession: user })

    try {
        const accessToken = jwt.sign({
            userId: user._id,
        },
            process.env.DECODEJWT || '',
        {
            algorithm: 'HS256'
        })
        response.status(201).json({ accessToken, workspaceSession })
    } catch (error) {
        console.log(error)
    }
}