const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.BOWLING_DATABASE_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
    } catch (e) {
        console.error(e)
    }
}

module.exports = connectDB