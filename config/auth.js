// Autenticação
const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')// modulo q vai encriptar a senha

//model dos usuarios
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

// sistema de autenticação  
module.exports = function(passport){
        // Criptografia
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) =>{// chave para comparar
        Usuario.findOne({email: email}).lean().then((usuario) =>{// o email usado na autenticação
            if(!usuario){ // done é uma função de call back
                return done(null, false, {message: 'Essa conta não existe'})
            }
                // compara a senha com a senha do usuário encriptado
            bcrypt.compare(senha, usuario.senha, (erro, batem) =>{
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })
        }) 
    })) 

    passport.serializeUser((usuario, done) =>{// passar os dados de um usuário pra uma seção
        done(null, usuario)
    })


    passport.deserializeUser((id, done) =>{
        Usuario.findOne(id, (err, usuario) =>{
            done(err, usuario)
        })
    })
}