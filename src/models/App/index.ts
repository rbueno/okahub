import { model, Schema } from 'mongoose'

const schema = new Schema({
    businessId: {
        type: Schema.Types.ObjectId,
        ref: 'Business'
    },
    title: {
        type: String
    },
    source: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String
    },
    options: {
        type: Object
    }
}, { timestamps: true })

export const Apps = model('Apps', schema)