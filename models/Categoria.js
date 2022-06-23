const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Categoria = new Schema({ // Aqui dentro define o model Criar campo no banco de dados e o seu tipo igual o mysql
    nome: {
        type: String,
        required: true,
        default: 'Blog'
    },
    slug: {
        type: String,
        required: true
    }, 
    data: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('categorias', Categoria)
