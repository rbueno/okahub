import { Schema, model } from 'mongoose'

interface IHooks {
    businessId: Schema.Types.ObjectId
    active: boolean
}

const schema = new Schema<IHooks>({
    businessId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
})

export const Hooks = model<IHooks>('Hooks', schema)