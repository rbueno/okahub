import { Schema, model, Document } from 'mongoose'

export interface IActivityLogs extends Document {
    type: string
    title: string
    description: string
    additionalEntity: string
    dealId: Schema.Types.ObjectId
    businessId: Schema.Types.ObjectId
    additionalEntityForeignKey: Schema.Types.ObjectId
}

const schema = new Schema({
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    dealId: {
        type: Schema.Types.ObjectId,
    },
    businessId: {
        type: Schema.Types.ObjectId,
    },
    additionalEntity: {
        type: String,
    },
    additionalEntityForeignKey: {
        type: Schema.Types.ObjectId,
    },
}, {
    timestamps: true
})

export const ActivityLogs = model<IActivityLogs>('ActivityLogs', schema)