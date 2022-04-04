import 'dotenv/config'
import express from 'express'
import axios from 'axios'
import cors from 'cors'
import { salesStatus, apiReferences } from './integrations/provi/settings'
import { Deals, Business, Hooks, App } from './models'
import { createPagination } from './utils'
const app = express()

app.use(express.json({}))
app.use(cors())

// provi app test
const envProvi = 'development'

app.put('/v1/app/profile', async (request, response) => {
    const businessId = request.headers['authorization']
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
    if (!appProfile) {
        const appCreated = await App.create(newAppProfile)
        return response.status(200).json(appCreated)
    }

    appProfile.oprions.apiToken = appToken
    await appProfile.save()
    response.status(200).json({ message: 'App atualizado'})

})

app.get('/v1/app/profile', async (request, response) => {
    const businessId = request.headers['authorization']
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

app.put('/v1/app/profile/options/settings', async (request, response) => {
    // criar ou atualizar endpoint
    const businessId = request.headers['authorization']
    const { appname } = request.body
    
    try {
        const appProfile = await App.findOne({ name: appname, businessId })

    async function getWebhookEndpoint() {
        const result = await Hooks.findOne({ businessId }).sort({ _id: -1 })
        const webhookPrefixURL = `${process.env.API_BASE_URL}/v1/hooks/catch`
        return `${webhookPrefixURL}/${result?.businessId}`
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

app.get('/v1/sales', async (request, response) => {
    // app filtrar deals com businessID = app
    // filtrar deals por user owner
    // filtar deal por admin (mostrar todos por exemplo sem limitação de owner)

    const token = request.headers['authorization']
    if (!token) return response.status(401).json({ message: 'token não encontrado' })

    const deals = await Deals.find({ businessId: token })
    const paging = createPagination({ totalItems: deals.length })
    
    response.status(200).json({ deals, paging })
})

app.post('/v1/hooks', async (request, response) => {
    const { businessId } = request.body
    const created = await Hooks.create({ businessId })
    response.status(200).json(created)
})

app.get('/v1/hooks', async (request, response) => {
    const token = request.headers['authorization']
    if (!token) return response.status(401).json({ message: 'token não encontrado' })

    const result = await Hooks.find({ businessId: token })
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
        mobilePhone: mobilePhone.replace(/[^\d]+/g, ''),
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
          return response.status(200).json({ message: 'Deal atualizado'})
      }

      console.log('Criando novo deal')
      const createdDeal = await Deals.create(newDeal)
      console.log('Criado')
      
      response.status(200).json(createdDeal)
    
})

app.post('/v1/business', async (request, response) => {
    const { name } = request.body
    const business = await Business.findOne({ name })
    if (business) return response.status(401).json({ message: 'Negócio já existe' })
    const createdBusiness = await Business.create({ name, slug: name })
    response.status(200).json(createdBusiness)
})

app.get('/v1/business', async (request, response) => {

    const business = await Business.find()
    const paging = createPagination({ totalItems: business.length })
    response.status(200).json({ business, paging })
})

app.put('/v1/business/:businessId', async (request, response) => {

    const business = await Business.findByIdAndUpdate(request.params.businessId, { name: request.body.name, slug: request.body.name })

    response.status(200).json(business)
})

export default app
