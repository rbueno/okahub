import { Schema, model } from 'mongoose'

interface IDeals {
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
  business: Schema.Types.ObjectId
  status: string
  // deal info
  tags: string[]
  owner: Schema.Types.ObjectId
  dealStatus: string
  activity: object[]
  notes: object[]
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
  business: {
    type: Schema.Types.ObjectId
  },
  status: {
    type: String
  },
  // deal info
  tags: {
    type: [String]
  },
  owner: {
    type: Schema.Types.ObjectId
  },
  dealStatus: {
    type: String
  },
  activity: {
    type: [Object]
  },
  notes: {
    type: [Object]
  },
}

const newSchema = new Schema<IDeals>(schema, {
  timestamps: true
})

export const Deals = model<IDeals>('Deals', newSchema)