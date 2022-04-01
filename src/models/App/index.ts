import { model, Schema } from 'mongoose'

const schema = new Schema({
    businessId: Schema.Types.ObjectId,
    name: {
        type: String
    },
    active: {
        type: Boolean
    }
})

export const App = model('App', schema)