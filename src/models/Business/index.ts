import { Schema, model } from 'mongoose'

interface IBusiness {
  name: string,
  slug: string,
}

const schema = new Schema<IBusiness>({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

export const Business = model<IBusiness>('Business', schema)