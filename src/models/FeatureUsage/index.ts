import { Schema, Document, model } from 'mongoose'

type UsageType = 'click'
export interface IFeatureUsage extends Document {
    name: string
    type: UsageType
    businessId: Schema.Types.ObjectId
}

const schema = new Schema<IFeatureUsage>({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    businessId: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true })

export const FeatureUsage = model<IFeatureUsage>('FeatureUsage', schema)