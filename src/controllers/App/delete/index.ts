import { Response } from 'express'
import { Apps } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { apiReferences } from '../../../integrations/provi/settings'
import { createPlatformAPI } from '../../../utils'

const removeAppProvi = async (appInstance: any) => {
    try {
        appInstance.status = 'inactive'
        await appInstance.save()

        const platformAPI = createPlatformAPI['provi']({ apiToken: appInstance.options.apiToken }) 
        const webhookPreferencesId = 67 || appInstance.options.webhookPreferences.data.id
        await platformAPI.delete(`${apiReferences.v4.webhookPreferences.delete}/${webhookPreferencesId}`)
        
    } catch (error) {
        console.log(error)
        throw new Error('Erro inesperado')
    }
}
const removeApp: any = {
    provi: removeAppProvi
}
export const deleteApp = async (request: CustomRequest, response: Response) => {
    const { appId } = request.params

    try {
        const app = await Apps.findById(appId)
        if (!app) return response.status(500).json({ message: 'Erro inesperado' })


        await removeApp[app.source](app)
        app.active = false
        app.status = 'removed'
        await app.save()

        response.status(200).send()
    } catch (error) {
        response.status(400).send({ message: 'Erro inesperado' })
        console.log(error)
    }
}