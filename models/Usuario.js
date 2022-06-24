const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    eAdm:{
        type:Number,
        default: 1
    },
    senha:{
        type: String,
        required: true
    }

})

mongoose.model('usuarios', Usuario)

module.exports = Usuario