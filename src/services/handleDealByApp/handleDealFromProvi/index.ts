import { createOrUpdateDeal } from './createOrUpdateDeal'
import { proviStatus } from '../../../integrations/provi/settings'
const handleDealFromProvi = async (app: any, body: any) => {
    const {
        userInfo: { name, phone: mobilePhone, email, birthDate, address },
        courses: products,
        id: order,
        webhook: status,
        comment,
        cpf,
        checkout_price_in_cents: orderPrice
    } = body

    const productsResume = products.map((product: any) => {
        if (product.courseClass) {
            return {
                name: product.courseClass.name,
                price: product.courseClass.priceInCents
            }
        }
        return {
            name: product.name,
            price: product.price_in_cents
        }
    })
    
    const dealStatus = proviStatus[status].group
    const [dd, mm, yyyy] = birthDate?.split('/') || null

    const deal: any = {
        // customer info
        name,
        mobilePhone: mobilePhone?.replace(/[^\d]+/g, '') || null,
        email,
        products,
        productsResume,
        birthDate: `${mm}/${dd}/${yyyy}`,
        address,
        order,
        orderPrice,
        description: comment.pt,
        cpf,
        originDataSnapshots: [body],
        business: null,
        status,
        // // deal info
        tags: null,
        owner: null,
        dealStatus,
        activity: null,
        notes: null,
        businessId: app.businessId._id
      };

    try {
        await createOrUpdateDeal(app.businessId._id, deal)
        console.log('handleDealFromProvi Success')
    } catch(error) {
        console.log('handleDealFromProvi error', error)
    }
}

export { handleDealFromProvi }