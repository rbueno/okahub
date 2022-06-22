import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Users } from '../../../models'

export const create = async (request: Request, response: Response) => {
    const { firstName, lastName, email, password } = request.body
    if (!firstName || !lastName || !email || !password) return response.status(400).json({ message: 'All fields are required' })

    const user = await Users.findOne({ email: email.trim() })
    if (user) return response.status(400).json({ message: "A sua conta precisa ser única"})

    const salt = bcrypt.genSaltSync(10)
    const hashPW = bcrypt.hashSync(password.trim(), salt)

    try {
        const newUser = await Users.create({
            firstName,
            lastName,
            email,
            password: hashPW
        })

        const accessToken = jwt.sign({
            userId: newUser._id,
        },
            process.env.DECODEJWT || '',
        {
            algorithm: 'HS256'
        })

        const workspaceSession = {
            currentWorkspace: null,
            workspaces: null,
            user: newUser
        }
        return response.status(200).json({ accessToken, workspaceSession })
    } catch (error) {
        console.log(error)
    }
}