import { Schema, model, Document } from 'mongoose'

export interface IProductResume extends Document {
  name?: string
  price?: number
  detail?: string
}
export interface IDeals extends Document {
  // customer info
  name: string
  mobilePhone: string
  email: string
  birthDate: Date
  cpf: string
  products: object
  orderPrice: number
  address: object
  order: string
  description: string
  originDataSnapshots: object
  businessId: Schema.Types.ObjectId
  status: string
  // deal info
  tags: string[]
  ownerUserId: Schema.Types.ObjectId
  dealStatus: string
  customerStatus: string
  activity: object[]
  notes: object[]
  latestAction: object
  isCustomer: boolean
  productsResume: IProductResume[]
}



const schema = {
  // customer info
  name: {
    type: String
  },
  mobilePhone: {
    type: String
  },
  email: {
    type: String
  },
  birthDate: {
    type: Date
  },
  cpf: {
    type: String
  },
  products: {
    type: [Object]
  },
  productsResume: {
    type: [Object]
  },
  orderPrice: {
    type: Number
  },
  address: {
    type: Object
  },
  order: {
    type: String
  },
  description: {
    type: String
  },
  originDataSnapshots: {
    type: [Object]
  },
  businessId: {
    type: Schema.Types.ObjectId
  },
  status: {
    type: String
  },
  // deal info
  tags: {
    type: [String]
  },
  ownerUserId: {
    type: Schema.Types.ObjectId
  },
  dealStatus: {
    type: String
  },
  customerStatus: {
    type: String
  },
  isCustomer: {
    type: Boolean
  },
  activity: {
    type: [Object]
  },
  latestAction: {
    type: Object
  },
  notes: {
    type: [Object]
  },
  appId: {
    type: Schema.Types.ObjectId
  }
}

const newSchema = new Schema<IDeals>(schema, {
  timestamps: true
})

export const Deals = model<IDeals>('Deals', newSchema)