import { Response } from 'express'
import { Business, Workspaces, Users } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { getWorkspaceSession } from '../../../services/workspaces'

export const create = async (request: CustomRequest, response: Response) => {
    const { company, email, phoneNumber, whatsapp } = request.body
    const { userId } = request.authPayload
    console.log('company, email, phoneNumber, whatsapp', company, email, phoneNumber, whatsapp)
    if (!company) return response.status(400).json({ message: 'Nome do negócio é obrigatório' })

    const slug = company.trim().toLowerCase().replace(' ', '-')
    const business = await Business.findOne({ slug })
    if (business) return response.status(400).json({ message: "Nome de negócio não está disponível"})


    try {
        const newBusiness = await Business.create({
            name: company.trim(),
            slug,
            email: email?.trim(),
            phoneNumber: phoneNumber?.trim(),
            whatsapp: whatsapp?.trim()
        })

        const newWorkspace = await Workspaces.create({ userId, businessId: newBusiness._id, roles: ['owner'] })
        newBusiness.workspaces.push(newWorkspace._id)
        newBusiness.save()
        await Users.updateOne({ _id: userId }, { $push: { workspaces: newWorkspace._id }})

        const workspaceSession = await getWorkspaceSession({ userId })

        response.status(200).json({ workspaceSession })
    } catch (error) {
        console.log(error)
    }
}