import { Schema, model, Document } from 'mongoose'

export interface IUsers extends Document {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  workspaces: Schema.Types.ObjectId[],
}

const schema = new Schema<IUsers>({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  workspaces: [{
    type: Schema.Types.ObjectId,
    ref: 'Workspaces'
  }]
}, {
  timestamps: true
})

export const Users = model<IUsers>('Users', schema)