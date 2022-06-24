import axios from 'axios'
import { Response } from 'express'
import { v4 } from 'uuid'
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
    provi: validateProviData,
    whatsapp: () => true
}

const createPlatformAPI: any = {
    provi: (settingsData: SettingsDataDTO) => {
        console.log('==== createPlatformAPI settingsData.apiToken', settingsData.apiToken)
        return axios.create({ baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api-token': settingsData.apiToken } })
    },
    whatsapp: () => ({})
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
    },
    whatsapp: async (settingsData: SettingsDataDTO, workspace: any) => {
        const iniciateNewAppData = {
            businessId: workspace.businessId,
            title: 'Whatsapp',
            source: 'whatsapp',
            active: false,
            status: 'pending_configuration',
            options: {
                verifyToken: v4()
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

const handleProviAppInstance = async (appInstance: any, platformAPI: any) => {
    const okahubHook = `${process.env.API_BASE_URL}/hooks/catch/${appInstance._id}`
    const { data: webhookPreferencesCreated } = await platformAPI.post(apiReferences.v4.webhookPreferences.create, { url: okahubHook })
    console.log('webhookPreferencesCreated =>', webhookPreferencesCreated)

    // create app with plataform configuration
    appInstance.options = {
        ...appInstance.options,
        webhookPreferences: { ...webhookPreferencesCreated }
    }
    appInstance.active = true
    appInstance.status = 'live'
    await appInstance.save()
    return appInstance
}
const handleAppInstance: any = {
    provi: handleProviAppInstance,
    whatsapp: async (appInstance: any, platformAPI: any) => {
        const okahubHook = `${process.env.API_BASE_URL}/hooks/catch/${appInstance._id}`
       
    
        // create app with plataform configuration
        appInstance.options = {
            ...appInstance.options,
            webhookPreferences: { url: okahubHook }
        }
        appInstance.active = true
        appInstance.status = 'live'
        await appInstance.save()
        return appInstance
    }
}

export const create = async (request: RequestDTO, response: Response) => {
    const { source, settingsData } = request.body
    const { workspaceId } = request
    console.log('workspaceId, source, settingsData => ', workspaceId, source, settingsData)
    if (!workspaceId) return response.status(400).json({ message: 'Você precisa criar um negócio primeiro' })
    if (!source) return response.status(400).json({ message: 'Ocorreu um erro inesperado' })
    if (!['provi', 'whatsapp'].includes(source?.trim())) return response.status(400).json({ message: 'App não identificado' })

    const workspace = await Workspaces.findById(workspaceId)
    console.log('workspace => ', workspace)
    if (!workspace) return response.status(400).json({ message: 'Ocorreu um erro inesperado' })

    const app = await Apps.findOne({ source, businessId: workspace.businessId })
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
    const appInstance = hasAppIniciate ? app : await iniciateNewAppInstance[source](settingsData, workspace)
    
    console.log('appInstance => ', appInstance)
    try {
        // config plataform

        const output = await handleAppInstance[source](appInstance, platformAPI)
        response.status(200).json(output)
    } catch (error) {
        console.log(error)
    }
}