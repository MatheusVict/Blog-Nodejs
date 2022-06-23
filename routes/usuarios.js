const { application } = require('express')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) =>{
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) =>{// Validação de cadastro
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'Senha inválida'})
    }
    if(!req.body.repetir || typeof req.body.repetir == undefined || req.body.repetir == null){
        erros.push({texto: 'confirme sua senha'})
    }   
    if(req.body.senha != req.body.repetir){
        erros.push({texto: 'Digite senha iguais'})
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) =>{
            if(usuario){ // se ele achar um usuario
                req.flash('msg_error', 'Conta já existente')
                res.redirect('/usuarios/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                // Onde ocorre a incripitção da senha antes de salvar
                bcrypt.genSalt(10, (erro, salt) =>{ // biblioteca e parte q vai criptografar a senha
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{// transforma em hash(uma criptografia irreversivél)
                        if(erro){
                            req.flash('msg_error', 'Houve um erro no cadastro')
                            res.redirect('/')
                        }
                        // se der tudo certo ele incripta
                        novoUsuario.senha = hash
                        // e dps salva
                        novoUsuario.save().then(() =>{
                            req.flash('msg_success', 'Usuário registrado com sucesso')
                            res.redirect('/')
                        }).catch((err) =>{
                            req.flash('msg_error', 'Ocorreu um erro no cadastro, tente novamente '+err)
                            res.redirect('usuarios/registros')
                        })
                    })
                })

            }
        }).catch((err) =>{
            req.flash('msg_error', 'Erro ao registrar '+err)
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) =>{
    res.render('usuarios/login')
})

router.post('/login/receber', (req, res, next) =>{//autenticação

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)


})

router.get('/logout', (req,res, next) =>{// Fazer logout

    req.logout((err) =>{
        if(err){
            return next(err)
        }req.flash('msg_success', 'Deslogado com sucesso')
    })
    
    res.redirect('/')


    req.flash('msg_succes', 'Deslogado com sucesso')
    res.redirect('/')

})

module.exports = router