// chamando as funções necessarias 
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express();
    const adm = require('./routes/adm')
    const router = require('./routes/adm')
    const path = require('path');
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash');
    const { populate } = require('./models/Categoria');
    require('./models/Postagem')// importar o model postagem
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios  = require('./routes/usuarios');
    const passport = require('passport');
    require('./config/auth')(passport)
// CONFIGURAÇÕES
    // Sessão
        app.use(session({ // entre a definição da sessão e do flash coloca a função
            secret: 'Projectnode',             // secret chave pra gerar uma sessão
            resave: true,                      // app.use criação de middlewares
            saveUninitialized: true                     
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())                        // flash tem q ficar abaixo da sessão
    //Middleware
        app.use((req, res, next) => {
            res.locals.msg_success = req.flash('msg_success')// flash é um tipo de sessão q só aparece uma vez
            res.locals.msg_error = req.flash('msg_error')//locals permite criar qualquer variavéis globais
            next()                     // Não esquecer do next
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null; // passport armazena dados de um usuário e o null é se não tiver nenhum usuário o valor é nulo 
        })                               
    // modulo Body parser
        app.use(express.urlencoded({extended:true}))
        app.use(express.json())
    // modulo handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');
    // modulo Momgoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/Blognode').then(() =>{
            console.log('conectado')
        }).catch((err) => {
            console.log('ERRO: '+err)
        })

    //public
        app.use(express.static(path.join(__dirname +'/public')))

        app.use((req, res, next) => {  //Middlewares usa o next, não só o req e o res
            //console.log('Olá')          // requisição deo tipo de carregar página ou qualquer outra coisa
            next()                    // coloca o next se não fica preso na requisição e não passa
        })

// ROTAS
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).lean().then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash('msg_error', 'Ops... parece que houve um erro')
            res.redirect('/404')

        })
        
    })

    app.get('/postagens/:slug', (req, res) =>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{ // função postagem == achou postagem
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('msg_error', 'Essa postagem não existe')
                res.redirect('/')
            }
        }).catch((err) =>{
            req.flash('msg_error', 'Houve um erro ao carregar postagem '+err)
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) =>{
        res.render('erro')
    })
    
app.get('/categorias', (req, res) =>{
    Categoria.find().lean().then((categorias) => {
        res.render('categorias/index', {categorias: categorias})
    }).catch((err) => {
        req.flash('msg_error', 'Houve um erro a lista as categorias '+err)
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) =>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{// req.params pq é ´ra buscar de acordo com o parametro
        if(categoria){ // se ele achou pq veio do findone //todo find tem q ter uma condição
            
            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                res.render('categorias/postagens', {postagens: postagens, categoria: categoria}) // pra exibir no handle
            }).catch((err) =>{
                req.flash('msg_error', 'Houve um erro ao carregar categoria')
                res.redirect('/categorias')
            })

        }else{
            req.flash('msg_error', 'Categoria inexistente')
            res.redirect('/categorias')
        }
        
    }).catch((err) =>{
        req.flash('msg_error', 'Erro ao carregar categoria '+err)
        res.redirect('/')
    })
})

app.use('/usuarios', usuarios)
// Da pra padronizar templates na partials
    app.use('/adm', adm)

//OUTROS
const PORT = process.env.PORT || 5500
app.listen(PORT, () =>{
    console.log('Servidor iniciado no: http://127.0.0.1:5500') 
})
// se o local host der problema utilize o ip do servidor, se não souber inicie um arquivo html pelo live server e mostrará na url