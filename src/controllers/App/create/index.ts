import axios from 'axios'
import { Response } from 'express'
import { Business, Workspaces, Users, IWorkspace, Apps } from '../../../models'
import { CustomRequest } from '../../../middlewares/authMiddleware'
import { getWorkspaceSession } from '../../../services/workspaces'
import { apiReferences } from '../../../integrations/provi/settings'

interface SettingsDataDTO {
    apiToken: string
}

interface RequestDTO extends CustomRequest {
    body: {
        source: string | undefined
        settingsData: SettingsDataDTO | undefined
    }
}
const validateProviData = async (_: any, platformAPI: any): Promise<boolean | undefined> => {
    try {
        const data = await platformAPI.get(apiReferences.v4.sales.get)
        console.log('==data.status', data.status)
        console.log('== data.status > 199 && data.status < 400', data.status > 199 && data.status < 400)
         return data.status > 199 && data.status < 400
    } catch (error: any) {
        console.log(error.response.data)
        return false
    }
}

const settingsDataValidation: any = {
    provi: validateProviData
}
const createPlatformAPI: any = {
    provi: (settingsData: SettingsDataDTO) => {
        console.log('==== createPlatformAPI settingsData.apiToken', settingsData.apiToken)
        return axios.create({ baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api-token': settingsData.apiToken } })
    }
}
const iniciateNewAppInstance: any = {
    provi: async (settingsData: SettingsDataDTO, workspace: any) => {
        const iniciateNewAppData = {
            businessId: workspace.businessId,
            title: 'Provi',
            source: 'provi',
            active: false,
            status: 'pending_configuration',
            options: {
                apiToken: settingsData?.apiToken
            }
        }
        try {
            return Apps.create(iniciateNewAppData)
        } catch (error) {
            console.log(error)
            throw new Error('erro inesperado')
        }
    }
}

export const create = async (request: RequestDTO, response: Response) => {
    const { source, settingsData } = request.body
    const { workspaceId } = request
    console.log('workspaceId, source, settingsData => ', workspaceId, source, settingsData)
    if (!workspaceId) return response.status(400).json({ message: 'Você precisa criar um negócio primeiro' })
    if (!source) return response.status(400).json({ message: 'Ocorreu um erro inesperado' })
    if (!['provi'].includes(source?.trim())) return response.status(400).json({ message: 'App não identificado' })

    const workspace = await Workspaces.findById(workspaceId)
    console.log('workspace => ', workspace)
    if (!workspace) return response.status(400).json({ message: 'Ocorreu um erro inesperado' })

    const app = await Apps.findOne({ source: 'inexistente', businessId: workspace.businessId })
    console.log('existing app => ', app)
    if (app && app.active === true && app.status === 'live') return response.status(400).json({ message: `Você pode criar apenas um app ${source}` })

    // create platform endpoint
    const platformAPI = await createPlatformAPI[source](settingsData)

    // validate data
    const isValid = await settingsDataValidation[source](settingsData, platformAPI)
    console.log('isValid token => ', isValid)
    if (!isValid) return response.status(400).json({ message: `Dados invlálidos. Entre em contato conosco!`})

    const hasAppIniciate = app && app.status === 'pending_configuration'
    console.log('hasAppIniciate => ', hasAppIniciate)
    const newAppInstance = hasAppIniciate ? app : await iniciateNewAppInstance[source](settingsData, workspace)
    
    console.log('newAppInstance => ', newAppInstance)
    try {
        // config plataform
        const okahubHook = `${process.env.API_BASE_URL}/hooks/catch/${newAppInstance._id}`
        const { data: webhookPreferencesCreated } = await platformAPI.post(apiReferences.v4.webhookPreferences.create, { url: okahubHook })
        console.log('webhookPreferencesCreated =>', webhookPreferencesCreated)

        // create app with plataform configuration
        newAppInstance.options = {
            ...newAppInstance.options,
            webhookPreferences: { ...webhookPreferencesCreated }
        }
        newAppInstance.active = true
        newAppInstance.status = 'live'
        await newAppInstance.save()
        response.status(200).json(newAppInstance)
    } catch (error) {
        console.log(error)
    }
}