import { Schema, model, Document } from 'mongoose'

export interface IBusiness extends Document {
  name: string,
  slug: string,
  email: string,
  password: string,
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
    required: true,
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

export const Business = model<IBusiness>('Business', schema)