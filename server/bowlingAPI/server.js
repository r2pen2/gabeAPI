require('dotenv').config()
const express = require('express')
const BowlingRouter = express.Router()

// middleware
const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
const connectDB = require('./config/dbConn')
const UserRouter = require('./api/User')

// INIT
// bodyParser
const bodyParser = require('express').json;
BowlingRouter.use(bodyParser())


//Routes
BowlingRouter.get('/', (req, res) => {
    res.send("Welcome to the Bowling API")
})

BowlingRouter.get('/hello', (req, res) => {
    res.json({
        status: "SUCCESS",
        message: "Hello"
    })
})

// Users route
BowlingRouter.use('/user', UserRouter)

// connect to database
connectDB();

const db = mongoose.connection
db.on('error', (error) => { console.error(error) })
db.once('open', () => {
    console.log("Connected to bowling database");
})


module.exports = BowlingRouter
// app.listen(3000, () => console.log('Server Started on Port 3000'));
