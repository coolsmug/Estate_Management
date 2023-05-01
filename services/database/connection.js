if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const mongoose = require('mongoose');

const URI = process.env.MONGO_URI ;

const connectDB = async() => {
    try {
        const con = await mongoose
            .connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        console.log(`MongoDb connect ${con.connection.host}`)
    } catch (err) {
        console.log(err)
        process.exit()
    }
}

module.exports = connectDB