import { Schema, Document, model } from 'mongoose'

export interface INotes extends Document {
    dealId: Schema.Types.ObjectId
    businessId: Schema.Types.ObjectId
    title: string
    text: string
}

const schema = new Schema<INotes>({
    dealId: {
        type: Schema.Types.ObjectId
    },
    businessId: {
        type: Schema.Types.ObjectId
    },
    title: {
        type: String
    },
    text: {
        type: String
    }
}, {
    timestamps: true
})

export const Notes = model<INotes>('Notes', schema)