import { Response } from 'express'
import { Business, Workspaces, Users, IWorkspace } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { getWorkspaceSession } from '../../../services/workspaces'

export const create = async (request: CustomRequest, response: Response) => {
    const { email } = request.body
    const { workspaceId } = request
    const { userId } = request.authPayload
    
    if (!email) return response.status(400).json({ message: 'Nome do negócio é obrigatório' })

    try {
        const user = await Users.findOne({ email: email.trim() }).populate<{ workspaces: IWorkspace[]}>('workspaces')
        if (!user) return response.status(400).json({ message: 'Usuário não encontrado' })
        if (user._id.toString() === userId) return response.status(400).json({ message: 'Você já está adicionado a este negócio' })
    
        const workspace = await Workspaces.findById(workspaceId)
        if (!workspace) return response.status(500).json({ message: 'Erro inesperado' })
        console.log('user', user)
        if (user.workspaces.find(ws => ws.businessId.toString() === workspace?.businessId.toString())) return response.status(400).json({ message: 'Usuário já está adicionado a este negócio' })

        const business = await Business.findById(workspace?.businessId)
        if (!business) return response.status(500).json({ message: 'Erro inesperado' })

        const newWorkspace = await Workspaces.create({ userId: user._id, businessId: business._id, roles: ['manager'] })
        
        business.workspaces.push(newWorkspace._id)
        user.workspaces.push(newWorkspace._id)
        
        business.save()
        user.save()

        const workspaceSession = await getWorkspaceSession({ userId })

        response.status(200).json({ workspaceSession })
    } catch (error) {
        console.log(error)
    }
}