require('dotenv').config()
const express = require('express')
const app = express()
let cors = require('cors')
const path = require('path')
app.use(cors())
// middleware
const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
const BowlingRouter = require('./bowlingAPI/server')

// INIT
// bodyParser
const bodyParser = require('express').json;
app.use(bodyParser())
app.use(express.static('public'))
app.use(express.json())

//Routes
app.get('/', (req, res) => {
    res.send("Hello There")
})
app.get('/hello/:name', (req, res) => {
    var name = req.params.name
    res.send(`Hello ${name}`)
})
app.get("/info", (req, res) => {
    res.sendFile('info.html', { root: path.join(__dirname, 'public') })
})

// Users route
app.use('/bowling', BowlingRouter)

// connect to database
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server Started on Port ${process.env.PORT || 3000}`)
});

module.exports = app