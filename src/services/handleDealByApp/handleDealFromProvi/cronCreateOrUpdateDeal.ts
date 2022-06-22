import axios from 'axios'
import { createOrUpdateDeal } from './createOrUpdateDeal'
import { apiReferences, proviStatus } from '../../../integrations/provi/settings'
const updateProviStudents = async (proviApiToken: string, businessId: string): Promise<void> => {
    const appApi = axios.create({ baseURL: apiReferences.baseURL.development, timeout: 20000, headers: { 'api-token': proviApiToken } })
    
    // const stage: any = {
    //     regular: [],
    //     irregular: [],
    //     concluded: [],
    //     churn: [],
    // }
    try {
        async function recursivilyFetch(page = 1) {
            const { data: { content, paging } } = await appApi.get(`/v4/receipts?page=${page}&limit=500`)
            const totalPages = paging.totalPages
            console.log(`========> page ${page} de ${totalPages}`)

            // content.forEach((item: any) => {
            //     const dealStage = proviStatus[item.status].group
            //     stage[dealStage].push(item)
            // })

            for(const data of content) {

                const dealStatus = proviStatus[data.status].group

                const deal: any = {
                    // customer info
                    name: data.name,
                    mobilePhone: data.phone?.replace(/[^\d]+/g, '') || null,
                    email: data.email,
                    products: data.courses,
                    address: data.address,
                    order: data.crid,
                    orderPrice: data.saleValue,
                    cpf: data.cpf,
                    status: data.status,
                    // // deal info
                    customerStatus: dealStatus,
                    businessId
                };
                // console.log('====> data', data)
                // enviar deal para updateOrCreateDeal
                await createOrUpdateDeal(businessId, deal)
            }

            // console.log('regular', stage.regular.length)
            // console.log('irregular', stage.irregular.length)
            // console.log('concluded', stage.concluded.length)
            // console.log('churn', stage.churn.length)
            // console.log(`total items `, stage.regular.length + stage.irregular.length + stage.concluded.length + stage.churn.length)
            
            if (page < totalPages) {
                page += 1
                await recursivilyFetch(page)
            }
        }
        await recursivilyFetch()
        // console.log('===================== FIM =================')
        // console.log('regular', stage.regular.length)
        // console.log('irregular', stage.irregular.length)
        // console.log('concluded', stage.concluded.length)
        // console.log('churn', stage.churn.length)
        // console.log(`total items `, stage.regular.length + stage.irregular.length + stage.concluded.length + stage.churn.length)
    } catch (error) {
        console.log('deu ruim', error)
    }
}

const cronCreateOrUpdateDeal = async () => {
     // pegar tokens
    // for no array de tokens atualizando
    // const appProfiles = await Apps.find({ name: 'provi' })

    // for (const appProfile of appProfiles) {
    //     try {
    //         console.log('=========> appProfile', appProfile)
    //         updateProviStudents(appProfile.options.apiToken, appProfile.businessId)
    //         response.status(200).send()
    //     } catch (error) {
    //         console.log(error)
    //         response.status(500).send()
            
    //     }
    // }
}