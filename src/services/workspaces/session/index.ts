import { Users, Workspaces, Business } from '../../../models'

interface DTOWorkspace {
    userId: any
    workspaceId?: any
    userSession?: any
    businessWorkspaces?: any
}
export const getWorkspaceSession = async ({ userId, workspaceId, userSession }:DTOWorkspace) => {
    const workspaces = await Workspaces.find({ userId, active: true }).sort({ _id: -1 }).populate('businessId').populate('userId').lean()

    const [currentWorkspace]: any = workspaceId ? workspaces.filter(item => item._id.toString() === workspaceId.toString()) : workspaces
    if(currentWorkspace) {
        currentWorkspace.businessWorkspaces = await Workspaces.find({ businessId: currentWorkspace?.businessId, active: true }).populate('businessId').populate('userId')
    }

    const authUser = currentWorkspace?.userId || userSession || await Users.findById(userId).populate('workspaces')

    return {
        workspaces,
        currentWorkspace,
        user: authUser
    }
}