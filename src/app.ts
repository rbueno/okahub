import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { proviStatus, apiReferences } from './integrations/provi/settings'
import { Deals, Business, Hooks, Apps, ActivityLogs, Notes, FeatureUsage } from './models'
import { IProductResume} from './models/Deals'
import { createPagination } from './utils'
import { routes } from './routes'
const app = express()

app.use(express.json({}))
app.use(cors())
app.use(morgan('dev'))
app.use(routes)

// provi app config
const activityLogType = {
    dealCreated: 'dealCreated',
    dealUpdated: 'dealUpdated',
    noteCreated: 'noteCreated'
}
export interface CustomRequest extends Request {
    business?: any
    dealId?: string
}

const authMiddleware = async (request: CustomRequest, response: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> => {
    const { authorization } = request.headers
    
    try {
        const businessPayload = jwt.verify(authorization || '', process.env.DECODEJWT || '')
    
        request.business = businessPayload
        if (!businessPayload) return response.status(401).json({ message: 'Forbidden' })
        return next()
        
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: 'Unknown error'})
    }
}





// app.put('/v1/app/profile', authMiddleware, async (request: CustomRequest, response: Response) => {
//     const { businessId } = request.business
//     const { appname, appToken } = request.body
//     const appProfile = await Apps.findOne({ name: appname, businessId })
    
//     // test apitoken
//     console.log('options', { baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api_token': appToken } })
//     const apiTest = axios.create({ baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api-token': appToken } })
    

//     try {
//         const data = await apiTest.get(apiReferences.v4.sales.get)
//         console.log(`ApiToken verificada - status: ${data.status}`)
//     } catch (error: any) {
//         return response.status(error.response?.status || 500).json({ message: error.response?.statusText || 'Erro desconhecido' })
//     }

//     // if app is provi
//     const newAppProfile = {
//         businessId,
//         name: 'provi',
//         options: {
//             apiToken: appToken
//         }
//     }
    
//     try {
//         if (!appProfile) {
//             const appCreated = await Apps.create(newAppProfile)
//             return response.status(200).json(appCreated)
//         }
    
//         appProfile.oprions.apiToken = appToken
//         await appProfile.save()
//         response.status(200).json({ message: 'App atualizado', appProfile})
//     } catch (error) {
//         console.log(error)
//     }

// })

app.get('/v1/app/profile', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const { appinstance  } = request.query
    console.log('{ name: appinstance, businessId }', { name: appinstance, businessId })
    const whereClause = {
        ...(appinstance ? { name: appinstance, businessId } : { businessId })
    }
    const appProfile = await Apps.find(whereClause)

    if (!appProfile.length) {
        return response.status(404).json({ message: 'Nenhum app encontrado' })
    }

    response.status(200).json(appProfile)

})

// app.put('/v1/app/profile/options/settings', authMiddleware, async (request: CustomRequest, response) => {
//     // criar ou atualizar endpoint
//     const { businessId } = request.business
//     const { appname } = request.body
    
//     try {
//         const appProfile = await Apps.findOne({ name: appname, businessId })

//     function getWebhookEndpoint() {
//         // const result = await Hooks.findOne({ businessId }).sort({ _id: -1 })
//         const webhookPrefixURL = `${process.env.API_BASE_URL}/v1/hooks/catch`
//         // return `${webhookPrefixURL}/${result?.businessId}`
//         return `${webhookPrefixURL}/${businessId}`
//     }

//     const appApi = axios.create({ baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api-token': appProfile.options.apiToken } })

//     if (appProfile.options.webhookPreferences) {
//         const bodyToUpdate = {
//             id: appProfile.options.webhookPreferences.id,
//             url: await getWebhookEndpoint
//         }
//         const updateEndpoint = apiReferences.v4.webhookPreferences.update
//         const { data: webhookPreferencesUpdated } = await appApi.patch(updateEndpoint, bodyToUpdate)
//         appProfile.options.webhookPreferences.url = bodyToUpdate.url
//         await appProfile.save()
//         return response.status(200).json(webhookPreferencesUpdated)
//     }

//     const bodyToCreate = {
//         url: await getWebhookEndpoint()
//     }
//     const createEndpoint = apiReferences.v4.webhookPreferences.create
//     const { data: webhookPreferencesCreated } = await appApi.post(createEndpoint, bodyToCreate)

//     appProfile.options.webhookPreferences = {
//         url: bodyToCreate.url
//     }
//     appProfile.save()
//     response.status(200).json(webhookPreferencesCreated)
//     } catch (error: any) {
//         console.log('=====================> deu ruim: ', error)
//         console.log('=====================> deu ruim: ', error.response)
        
//     }
// })


app.get('/v1/sales', async (request: CustomRequest, response) => {
    
    const deals = await Deals.find()
    const paging = createPagination({ totalItems: deals.length })
    
    response.status(200).json({ paging, deals })
})

app.post('/v1/hooks', async (request, response) => {
    const { businessId } = request.body
    const created = await Hooks.create({ businessId })
    response.status(200).json(created)
})

app.get('/v1/hooks', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    if (!businessId) return response.status(401).json({ message: 'token não encontrado' })

    const result = await Hooks.find({ businessId })
    const webhookPrefixURL = `${process.env.API_BASE_URL}/v1/hooks/catch`
    const resultUpdated = result.map((item: any) => ({
        item,
        webhookURL: `${webhookPrefixURL}/${item.businessId}`
    }))
    response.status(200).json(resultUpdated)
})

app.patch('/v1/business/profile', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const { name } = request.body
    if (!name) return response.status(400).json({ message: 'All fields are required' })

    const business = await Business.findById(businessId)
    if (!business) return response.status(400).json({ message: "Business is not available "})

    try {
     business.name = name
     await business.save()
    response.status(200).json(business)
    } catch (error) {
        console.log(error)
    }
})

app.get('/v1/business', async (request, response) => {
    const business = await Business.find()
    const paging = createPagination({ totalItems: business.length })
    response.status(200).json({ business, paging })
})

app.get('/v1/business/profile', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business

    const business = await Business.findById(businessId)
    response.status(200).json({ business })
})

app.put('/v1/business/:businessId', async (request, response) => {

    const business = await Business.findByIdAndUpdate(request.params.businessId, { name: request.body.name, slug: request.body.name })

    response.status(200).json(business)
})

app.post('/v1/note', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const dealId = request.headers['x-deal-id']
    const { text, title } = request.body

    if (!dealId || !text) return response.status(400).json({ message: 'É preciso informar uma nota' })
    
    const deal = await Deals.findById(dealId)
    if (!deal) return response.status(400).json({ message: 'Deal não encontrado' })

    const newNote = {
        dealId,
        businessId,
        title: title?.trim(),
        text: text.trim()
    }

    try {
        const createdNotes = await Notes.create(newNote)
        const activityLogCreated = await ActivityLogs.create({
            type: activityLogType.noteCreated,
            title: 'Nota criada',
            description: 'Uma nova nota foi criada',
            dealId,
            businessId,
            additionalEntity: 'Notes',
            additionalEntityForeignKey: createdNotes._id
          })
          deal.latestAction = activityLogCreated
          await deal.save()
          console.log(deal)
        response.status(200).json(createdNotes)
    } catch (error) {
        console.log(error)
    }
})
app.get('/v1/note', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const { dealId = null } = request

    const whereClause = { businessId }
    if (dealId) Object.assign('whereClause', { dealId })

    try {
        const notes = await Notes.find(whereClause)
        response.status(200).json(notes)
    } catch (error) {
        console.log(error)
    }
})
app.get('/v1/activitylogs', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const dealId = request.query.c

    const whereClause = {
        ...(dealId ? { dealId, businessId } : { businessId })
    }

    try {
        const activityLogs = await ActivityLogs.find(whereClause).sort({ createdAt: -1 })
        response.status(200).json(activityLogs)
    } catch (error) {
        console.log(error)
    }
})

app.post('/v1/featureusage', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const { title, type, description, logDealActivity, dealId } = request.body

    if(!title || !type) return response.status(400).send()

    try {
        const featureUsageCreated = await FeatureUsage.create({
            title,
            type,
            businessId
        })

        if (logDealActivity && dealId) {
            const deal = await Deals.findById(dealId)
            if (!deal) return response.status(400).json({ message: 'Deal não encontrado' })
            const activityLogCreated = await ActivityLogs.create({
                type,
                title,
                description,
                dealId,
                businessId,
                additionalEntity: 'FeatureUsage',
                additionalEntityForeignKey: featureUsageCreated._id
              })
            deal.latestAction = activityLogCreated
            await deal.save()
        }
        response.status(200).send()
    } catch (error) {
        console.log(error)
    }
})
export default app
