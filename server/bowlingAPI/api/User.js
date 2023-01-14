const express = require('express')
const userRouter = express.Router()


//mongodb user model
const User = require('../models/User')

// Password handler
const argon2 = require('argon2')

//Routes
// Signup
userRouter.post('/signup', (req, res) => {

    let { username, password } = req.body;
    username = username.trim()
    password = password.trim()
    // Checks for valid user/pass
    if (username == "" || password == "") { //make sure fields aren't empty
        res.json({
            status: "FAILED",
            message: "One or more fields are empty"
        })
    } else if (!/^[0-9a-zA-Z]+$/.test(username)) { //make sure only certain symbols allowed
        res.json({
            status: "FAILED",
            message: "No symbols or spaces allowed in username. Only characters A-Z & numbers"
        })
    } else if (username.length > 32) { //make sure user isn't too long
        res.json({
            status: "FAILED",
            message: "Please keep username under 32 characters"
        })
    } else if (password.length < 8) { //make sure password isn't too short
        res.json({
            status: "FAILED",
            message: "Password too short, please create a password with at least 8 characters"
        })
    } else { // User & Pass are ok!!
        User.find({ username }).then(result => { //Check if user already exists
            if (result.length) { // If a result is returned that isn't empty, it means it found the user ie they already exist
                res.json({
                    status: "FAILED",
                    message: "User already exists"
                })
            } else { // Passed all checks, this is a new user
                argon2.hash(password).then(hashedPassword => { // hash the password using argon2
                    const newUser = new User({ //create a new user (mongoose.model)
                        username,
                        password: hashedPassword,
                        data: JSON.stringify({ data: "" }),
                        gameData: JSON.stringify([])
                    })

                    newUser.save().then(result => { //saves to database using mongoose
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result
                        })
                    }).catch(e => { // error catching
                        res.json({
                            status: "FAILED",
                            message: "Error saving user account"
                        })
                    })
                }).catch(e => { // more error catching
                    res.json({
                        status: "FAILED",
                        message: "Error while hashing password"
                    })
                })
            }
        }).catch(e => { // even more error catching
            console.error(e);
            res.json({
                status: "FAILED",
                message: "Error creating user"
            })
        })
    }
})

// Signin
userRouter.post('/signin', (req, res) => {
    let { username, password } = req.body;
    username = username.trim()
    password = password.trim()

    if (username == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty user or password field"
        })
    } else {
        User.find({ username })
            .then(data => {
                if (data.length) {
                    //User exists
                    const hashedPassword = data[0].password;
                    argon2.verify(hashedPassword, password)
                        .then(result => {
                            if (result) {
                                res.json({
                                    status: "SUCCESS",
                                    message: "Logged in",
                                    username: data[0].username,
                                })
                            } else {
                                console.error("invalid password")
                                res.json({
                                    status: "FAILED",
                                    message: "Invalid password entered!"
                                })
                            }
                        }).catch(e => {
                            console.error("error comparing password")
                            res.json({
                                status: "FAILED",
                                message: "An error occured while comparing passwords"
                            })

                        })
                } else {
                    res.json({
                        status: "FAILED",
                        message: "Invalid credentials entered"
                    })
                }
            })
            .catch(e => {
                res.json({
                    status: "FAILED",
                    message: "An error occured while checking for existing user"
                })
            })
    }
})

// Save a bowling score
userRouter.post('/saveScore', (req, res) => {
    // console.log(req.body)
    let { username, bowlingGame } = req.body;
    username = username.trim()
    // console.log(username)
    // console.log(bowlingGame)
    User.find({ username })
        .then(data => {

            if (data.length) {
                //User exists
                let bowlingGameList = []
                const id = data[0]._id

                if ("gameData" in data[0]) {
                    bowlingGameList = JSON.parse(data[0].gameData)
                    bowlingGameList.push(bowlingGame)
                }

                // update Game List
                User.findByIdAndUpdate(id, { gameData: JSON.stringify(bowlingGameList) }).then(data => {
                    res.json({
                        status: "SUCCESS",
                        message: "Saved Game"
                    })
                }).catch(e => {
                    res.json({
                        status: "FAILED",
                        message: `Could not save game: ${e}`
                    })
                })


            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(e => {
            res.json({
                status: "FAILED",
                message: `An error occured while checking for existing user: ${e}`
            })
        })
})


// Get matches
userRouter.post('/getMatches', (req, res) => {
    // console.log(req.body)
    let { username } = req.body;
    username = username.trim()
    // console.log(username)
    // console.log(bowlingGame)
    User.find({ username })
        .then(data => {

            if (data.length) {
                //User exists

                if ("gameData" in data[0]) {
                    JSON.parse(data[0].gameData)
                    res.json({
                        status: "SUCCESS",
                        message: "Retrieved this user's games",
                        gameData: data[0].gameData
                    })
                } else {
                    res.json({
                        status: "SUCCESS",
                        message: "This user doesn't have any saved games",
                        gameData: JSON.stringify([])
                    })
                }

            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(e => {
            res.json({
                status: "FAILED",
                message: `An error occured while checking for existing user: ${e}`
            })
        })
})

// Delete a match
userRouter.post('/deleteMatch', (req, res) => {
    let { username, gameIndex } = req.body;
    username = username.trim()
    username = username.trim()
    // console.log(username)
    // console.log(bowlingGame)
    User.find({ username })
        .then(data => {

            if (data.length) {
                //User exists
                const id = data[0]._id

                if ("gameData" in data[0]) {
                    gameList = JSON.parse(data[0].gameData)
                    try {
                        gameList.splice(gameIndex, 1)

                    } catch (e) {
                        res.json({
                            status: "FAILED",
                            message: `Error deleting game: ${e}`
                        })
                    }

                }

                // update Game List
                User.findByIdAndUpdate(id, { gameData: JSON.stringify(gameList) }).then(data => {
                    res.json({
                        status: "SUCCESS",
                        message: "Saved Game"
                    })
                }).catch(e => {
                    res.json({
                        status: "FAILED",
                        message: `Error deleting game: ${e}`
                    })
                })


            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(e => {
            res.json({
                status: "FAILED",
                message: `An error occured while checking for existing user: ${e}`
            })
        })
})

module.exports = userRouter;