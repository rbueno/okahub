import { Schema, Document, model } from 'mongoose'

export interface IWorkspace extends Document {
    userId: Schema.Types.ObjectId,
    businessId: Schema.Types.ObjectId
    roles: string[]
    active: boolean
}

export const schema = new Schema<IWorkspace>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    businessId: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    roles: {
        type: [String],
        required: false
    },
    active: {
        type: Boolean,
        default: true
    }
})

export const Workspaces = model<IWorkspace>('Workspaces', schema)