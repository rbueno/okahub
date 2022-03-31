import app from './src/app'
import mongoose from 'mongoose'

app.listen(process.env.PORT, () => console.log('live'))
mongoose.connect('mongodb+srv://okahubapp:rDhrsnWRNrtcwGUb@cluster0.m5dbh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(() => console.log('MongoDB is Connected'))
    .catch((error) => console.log(`Error connection MongoDB: ${error}`))