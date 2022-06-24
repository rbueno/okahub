import { handleDealFromProvi } from './handleDealFromProvi'

const handleWhatAppMessage = async (app: any, body: any) => {
    console.log('==> body <==')
    console.log(body)

    body.entry.forEach((item: any) => {
        console.log('item', item)
        item.changes.forEach((change: any) => {
            console.log('change =>', change)
        })
    })
}

const handleDealByApp: any = {
    provi: handleDealFromProvi,
    whatsapp: handleWhatAppMessage
}
export { handleDealByApp }