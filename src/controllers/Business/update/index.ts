import { Response } from 'express'
import { Types } from 'mongoose'
import { Business, Workspaces, Users } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { getWorkspaceSession } from '../../../services/workspaces'

export const update = async (request: CustomRequest, response: Response) => {
    const { company, email, phoneNumber, whatsapp } = request.body
    const { userId } = request.authPayload
    const { editingWorkspaceId } = request.body
    console.log('company, email, phoneNumber, whatsapp', company, email, phoneNumber, whatsapp)
    console.log('workspaceId', editingWorkspaceId)
    if (!company) return response.status(400).json({ message: 'Nome do negócio é obrigatório' })
    const workspace = await Workspaces.findById(editingWorkspaceId)
    if (workspace?.userId.toString() !== userId) return response.status(401).json({ message: 'Ação não permitida' })



    const slug = company.trim().toLowerCase().replace(' ', '-')
    const businessToEdit = await Business.findById(workspace?.businessId)
    if (!businessToEdit) return response.status(400).json({ message: "Algo saiu errado"})
    console.log('businessToEdit', businessToEdit)
    const business = await Business.findOne({ slug, _id: { $ne: businessToEdit._id } })
    console.log('business', business)
    if (business && business?._id.toString() !== businessToEdit?._id.toString()) return response.status(400).json({ message: "Nome de negócio não está disponível"})

    if (company) businessToEdit.name = company.trim()
    if (businessToEdit.slug !== slug) businessToEdit.slug = slug
    if (email) businessToEdit.email = email.trim()
    if (phoneNumber) businessToEdit.phoneNumber = phoneNumber.trim()
    if (whatsapp) businessToEdit.whatsapp = whatsapp.trim()
    
    try {
        await businessToEdit.save()

        // const newWorkspace = await Workspaces.create({ userId, businessId: newBusiness._id, roles: ['owner'] })
        // newBusiness.workspaces.push(newWorkspace._id)
        // newBusiness.save()
        // await Users.updateOne({ _id: userId }, { $push: { workspaces: newWorkspace._id }})

        const workspaceSession = await getWorkspaceSession({ userId })

        response.status(200).json({ workspaceSession })
    } catch (error) {
        console.log(error)
    }
}