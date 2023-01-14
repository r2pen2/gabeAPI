const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    password: String,
    data: String,
    gameData: String
})

const User = mongoose.model('User', UserSchema)

module.exports = User;

// gameData is a list of games 
/* 

[
    {
        scorecard: number[][],
        frameScores: number[],
    }
]

*/