import { handleDealFromProvi } from './handleDealFromProvi'

const handleDealByApp: any = {
    provi: handleDealFromProvi,
    whatsapp: async (app: any, body: any) => {
        console.log('==> body <==')
        console.log(body)
    }
}

export { handleDealByApp }