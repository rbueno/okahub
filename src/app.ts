import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { salesStatus, apiReferences } from './integrations/provi/settings'
import { Deals, Business, Hooks, App, ActivityLogs, Notes, FeatureUsage } from './models'
import { createPagination } from './utils'
const app = express()

app.use(express.json({}))
app.use(cors())

// provi app test
const envProvi = 'development'
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

app.put('/v1/app/profile', authMiddleware, async (request: CustomRequest, response: Response) => {
    const { businessId } = request.business
    const { appname, appToken } = request.body
    const appProfile = await App.findOne({ name: appname, businessId })
    
    // test apitoken
    console.log('options', { baseURL: apiReferences.baseURL[envProvi], timeout: 20000, headers: { 'api_token': appToken } })
    const apiTest = axios.create({ baseURL: apiReferences.baseURL[envProvi], timeout: 20000, headers: { 'api-token': appToken } })
    

    try {
        const data = await apiTest.get(`/${apiReferences.apiVersionIdentifier}/sales`)
        console.log(`ApiToken verificada - status: ${data.status}`)
    } catch (error: any) {
        return response.status(error.response?.status || 500).json({ message: error.response?.statusText || 'Erro desconhecido' })
    }

    // if app is provi
    const newAppProfile = {
        businessId,
        name: 'provi',
        options: {
            apiToken: appToken
        }
    }
    
    try {
        if (!appProfile) {
            const appCreated = await App.create(newAppProfile)
            return response.status(200).json(appCreated)
        }
    
        appProfile.oprions.apiToken = appToken
        await appProfile.save()
        response.status(200).json({ message: 'App atualizado', appProfile})
    } catch (error) {
        console.log(error)
    }

})

app.get('/v1/app/profile', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const { appinstance  } = request.query
    console.log('{ name: appinstance, businessId }', { name: appinstance, businessId })
    const whereClause = {
        ...(appinstance ? { name: appinstance, businessId } : { businessId })
    }
    const appProfile = await App.find(whereClause)

    if (!appProfile.length) {
        return response.status(404).json({ message: 'Nenhum app encontrado' })
    }

    response.status(200).json(appProfile)

})

app.put('/v1/app/profile/options/settings', authMiddleware, async (request: CustomRequest, response) => {
    // criar ou atualizar endpoint
    const { businessId } = request.business
    const { appname } = request.body
    
    try {
        const appProfile = await App.findOne({ name: appname, businessId })

    function getWebhookEndpoint() {
        // const result = await Hooks.findOne({ businessId }).sort({ _id: -1 })
        const webhookPrefixURL = `${process.env.API_BASE_URL}/v1/hooks/catch`
        // return `${webhookPrefixURL}/${result?.businessId}`
        return `${webhookPrefixURL}/${businessId}`
    }

    const appApi = axios.create({ baseURL: apiReferences.baseURL[envProvi], timeout: 20000, headers: { 'api-token': appProfile.options.apiToken } })

    if (appProfile.options.webhookPreferences) {
        const bodyToUpdate = {
            id: appProfile.options.webhookPreferences.id,
            url: await getWebhookEndpoint
        }
        const updateEndpoint = '/' + apiReferences.apiVersionIdentifier + apiReferences.endpoints.webhookPreferences.update
        const { data: webhookPreferencesUpdated } = await appApi.patch(updateEndpoint, bodyToUpdate)
        appProfile.options.webhookPreferences.url = bodyToUpdate.url
        await appProfile.save()
        return response.status(200).json(webhookPreferencesUpdated)
    }

    const bodyToCreate = {
        url: await getWebhookEndpoint()
    }
    const createEndpoint = '/' + apiReferences.apiVersionIdentifier + apiReferences.endpoints.webhookPreferences.create
    const { data: webhookPreferencesCreated } = await appApi.post(createEndpoint, bodyToCreate)

    appProfile.options.webhookPreferences = {
        url: bodyToCreate.url
    }
    appProfile.save()
    response.status(200).json(webhookPreferencesCreated)
    } catch (error: any) {
        console.log('=====================> deu ruim: ', error)
        console.log('=====================> deu ruim: ', error.response)
        
    }
})

app.get('/v1/app/native-resources/:appId/sales', async (request, response) => {
    const api = axios.create({ baseURL: 'https://ms-checkout-staging.provi.com.br', timeout: 20000, headers: { 'authorization': process.env.DEV_API_TOKEN || '' } })
    
    const pipe: any = {
        open: [],
        won: [],
        lost: []
    }
    try {
        async function recursivilyFetch(page = 1) {
            const { data: { content, paging } } = await api.get(`/v4/sales?page=${page}&limit=500&PartnerId=188`)
            console.log('=============== content', content)
            content.forEach((item: any) => {
                const dealPipe = salesStatus[item.resumeStatus].group
                pipe[dealPipe].push(item)
            })
            const totalPages = paging.totalPages

            console.log(`page ${page} de ${totalPages}`)
            // if (page < totalPages) {
            //     page += 1
            //     await recursivilyFetch(page)
            // }
        }
        await recursivilyFetch()
        console.log('open', pipe.open.length)
        console.log('won', pipe.won.length)
        console.log('lost', pipe.lost.length)
    response.json(pipe)
    } catch (error) {
        console.log('deu ruim', error)
    }
})

app.get('/v1/sales', authMiddleware, async (request: CustomRequest, response) => {
    // app filtrar deals com businessID = app
    // filtrar deals por user owner
    // filtar deal por admin (mostrar todos por exemplo sem limitação de owner)

    const { businessId } = request.business
    if (!businessId) return response.status(401).json({ message: 'token não encontrado' })

    const deals = await Deals.find({ businessId })
    const paging = createPagination({ totalItems: deals.length })
    
    response.status(200).json({ deals, paging })
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

app.post('/v1/hooks/catch/:hookId', async (request, response) => {
    const { hookId } = request.params
    
    // verificar business e outros dados com o businessID (pendente)

    // verificar se existe deal já criado com este webhook

    // criar ou atualizar deal
    const {
        userInfo: { name, phone: mobilePhone, email, birthDate, address },
        courses: products,
        id: order,
        webhook: status,
        comment,
        cpf,
        checkout_price_in_cents: orderPrice
    } = request.body

    

    const currentDeal: any = await Deals.findOne({ order, businessId: hookId })

    const dealOwnerConfig = {
        // deal chegar sem dono, usuário clica e vira dono do deal
        // deal chegar sem dono, apenas admin pode vincular deal com usuários
        // 
        // deal chegar e de acordo com certa propriedade buscar uma conexão da propriedade com um usuário.
    }

    const dealStatus = salesStatus[status].group
    const [dd, mm, yyyy] = birthDate?.split('/') || null

    const newDeal: any = {
        // customer info
        name,
        mobilePhone: mobilePhone?.replace(/[^\d]+/g, '') || null,
        email,
        products,
        birthDate: `${mm}/${dd}/${yyyy}`,
        address,
        order,
        orderPrice,
        description: comment.pt,
        cpf,
        originDataSnapshots: [request.body],
        business: null,
        status,
        // // deal info
        tags: null,
        owner: null,
        dealStatus,
        activity: null,
        notes: null,
        businessId: hookId
      };

      if (currentDeal) {
          console.log('atualizando current deal')
          for (const key in newDeal) {
              if (currentDeal[key] !== newDeal[key]) {
                  console.log('novo dado ',  currentDeal[key], newDeal[key])
                  currentDeal[key] = newDeal[key]
              } else {
                  console.log('nenhum dado novo',  currentDeal[key], newDeal[key])
              }
          }
          await currentDeal.save()
          console.log('atualizado')
          await ActivityLogs.create({
            type: activityLogType.dealUpdated,
            title: 'Deal atualizado',
            description: 'O deal foi atualizado',
            dealId: currentDeal._id,
            businessId: hookId
          })
          return response.status(200).json({ message: 'Deal atualizado'})
      }

      console.log('Criando novo deal')
      const createdDeal = await Deals.create(newDeal)
      console.log('Criado')
      await ActivityLogs.create({
        type: activityLogType.dealCreated,
        title: 'Deal criado',
        description: 'Um novo deal foi criado',
        dealId: createdDeal._id,
        businessId: hookId
      })
      
      response.status(200).json(createdDeal)
    
})

app.post('/v1/business/profile', async (request, response) => {
    const { name, slug, email, password } = request.body
    if (!name || !email || !password) return response.status(400).json({ message: 'All fields are required' })

    const business = await Business.findOne({ email: email.trim() })
    if (business) return response.status(400).json({ message: "Business is not available "})

    const salt = bcrypt.genSaltSync(10)
    const hashPW = bcrypt.hashSync(password, salt)

    try {
        const newBusiness = await Business.create({
            name,
            slug,
            email,
            password: hashPW
        })

        const token = jwt.sign({
            businessId: newBusiness._id,
        },
            process.env.DECODEJWT || '',
        {
            algorithm: 'HS256'
        })
        response.status(200).json({ token, newBusiness })
    } catch (error) {
        console.log(error)
    }
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
app.post('/v1/session', async (request: Request, response: Response) => {
    const { email, password } = request.body
    if (!email || !password) return response.status(400).json({ message: 'All fields are required' })

    const business: any = await Business.findOne({ email: email.trim() })
    if (!business) return response.status(400).json({ message: 'Credentials are not correctly'})

    const isPasswordCorrect = bcrypt.compareSync(password, business.password)
    if (!isPasswordCorrect) return response.status(401).json({ message: 'Credentials are not correctly'})

    try {
        const token = jwt.sign({
            businessId: business._id,
        },
            process.env.DECODEJWT || '',
        {
            algorithm: 'HS256'
        })
        response.status(201).json({ token, business })
    } catch (error) {
        console.log(error)
    }
})

app.post('/v1/note', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const dealId = request.headers['x-deal-id']
    const { text, title } = request.body

    if (!dealId || !text) return response.status(400).json({ message: 'É preciso informar uma nota' })

    const newNote = {
        dealId,
        businessId,
        title: title?.trim(),
        text: text.trim()
    }

    try {
        const createdNotes = await Notes.create(newNote)
        await ActivityLogs.create({
            type: activityLogType.noteCreated,
            title: 'Criação de nota',
            description: 'Uma nova nota foi criada',
            dealId,
            businessId
          })
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

    const whereClause = { businessId }

    try {
        const activityLogs = await ActivityLogs.find(whereClause)
        response.status(200).json(activityLogs)
    } catch (error) {
        console.log(error)
    }
})

app.post('/v1/featureusage', authMiddleware, async (request: CustomRequest, response) => {
    const { businessId } = request.business
    const { name, type } = request.body

    if(!name || !type) return response.status(400).send()

    try {
        await FeatureUsage.create({
            name,
            type,
            businessId
        })
        response.status(200).send()
    } catch (error) {
        console.log(error)
    }
})
export default app
