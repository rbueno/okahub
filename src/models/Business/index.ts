import { Schema, model, Document } from 'mongoose'

export interface IBusiness extends Document {
  name: string,
  slug: string,
  email: string,
  phoneNumber: string,
  whatsapp: string,
  workspaces: Schema.Types.ObjectId[]
}

const schema = new Schema<IBusiness>({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  whatsapp: {
    type: String,
  },
  workspaces: [{
    type: Schema.Types.ObjectId,
    ref: 'Workspaces',
  }]
}, {
  timestamps: true
})

export const Business = model<IBusiness>('Business', schema)