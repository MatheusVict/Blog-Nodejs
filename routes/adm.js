const express = require('express')
const { default: mongoose } = require('mongoose')
const router = express.Router()
const Categoria = require('../models/Categoria')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const  {eAdm} = require('../helpers/eAdm') // pra delimitar quem pode acessar oq só colocar eAdm

router.get('/', eAdm, (req, res) => {
    res.render('adm/index')
})


router.get('/post',eAdm, (req, res) =>{
    res.send('Página dos posts')
})

router.get('/categorias', eAdm, (req, res) =>{
    Categoria.find().lean().then((categorias) => {
        res.render('adm/categoria', {categorias: categorias})
    }).catch((err) =>{
        req.flash('msg_error', "Ocorreu um erro ao listar categorias")
        res.redirect('/adm')
    }) // todo model tem uma função find q lista todos os documentos existentes
    
})

router.get('/categorias/add', eAdm, (req, res) => {
    res.render('adm/categoriaadd')
})

router.post('/categorias/new', eAdm, (req, res) => { // add no banco de dados parecido com o sequelize
    
    var erros = []    //declara um array
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){       // ! == se não foi enviado
        erros.push({texto: 'Nome inválido'})                                                                  // || == ou todo array tem o push serve pra por novo dado dentro do array
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'O nome da categoria é muito pequeno'})
    }

    if(erros.length > 0){  // se o tamnho do array for maior do q 0 pq a cada erro o array vazio recebe um item
        res.render('adm/categoriaadd', {erros: erros})  // da pra passar dados para view através do render
    }else{
        // cria a categoria no banco
        const novaCatego = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCatego).save().then(() => {
            req.flash('msg_success', 'Categoria registrada')
            res.redirect('/adm/categorias')
    
        }).catch((err) => {
            req.flash('msg_error', 'Ops.. Erro ao salvar, tente novamente')
            res.redirect('/adm')
        })

        }

})
// edita os dados da categoria salvando os antigos e ainda verifica se existe se colocar um id inválido ele avisa
router.get('/categorias/edit/:id', eAdm,(req, res) => { // como muda de acordo com o parametro use o params não o body
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => { // findOne pra achar só um no caso o parametro do id e vai renderizar a função categoria no then
       res.render('adm/categoriasedit', {categoria: categoria}) 
    }).catch((err) =>{
        req.flash('msg_error', 'Categoria inexistente') // não esqucer q sempre q quiser exibir um valor por no html para exibir para o usuário
        res.redirect('/adm/categorias')
    })
    

})

// enviar mudanças da ediçao
router.post('/categorias/edit', eAdm, (req, res)=>{


    
    var erros = []    //declara um array
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){       // ! == se não foi enviado
        erros.push({texto: 'Nome inválido'})                                                                  // || == ou todo array tem o push serve pra por novo dado dentro do array
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'O nome da categoria é muito pequeno'})
    }

    if(erros.length > 0){  // se o tamnho do array for maior do q 0 pq a cada erro o array vazio recebe um item
       Categoria.findOne({_id: req.body.id}).lean().then((categoria) =>{
        res.render('adm/categoriasedit', {categoria: categoria})
        req.flash('msg_success', 'Categoria alterada')
       }).catch((err) => {
        req.flash('msg_error', 'Erro ao pegar dados: '+err)
        res.redirect('/adm/categorias')
       }) // se os erros forem maiores do q 0 ele vai redirecionar pra como tva antes
    }else{
            Categoria.findOne({_id: req.body.id}).then((categoria) => {
                req.flash('msg_success', 'salvo ')
                
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug

                categoria.save().then(() => {
                    req.flash('msg_success', ' Categoria editada com sucesso!')
                    res.redirect('/adm/categorias')
                }).catch(() => {
                    req.flash('msg_success', 'Erro ao salvar a edição da categoria')
                    res.redirect('/adm/categorias')
                })
            }).catch((err) => {
                req.flash('msg_error', 'Erro ao editar' +err)
                res.redirect('/adm/categorias')
            })
        }
})

router.post('/categorias/delet', eAdm,  (req, res) => { 
    Categoria.remove({_id: req.body.id}).then(() => { // o Categoria é oq registra no banco e a funçãao remove ja fala oa faz
        req.flash('msg_success', 'Categoria deletada com sucesso')// vai remover o id requisitado pelo input do tipo hidden por isso aquele parametro do _id
        res.redirect('/adm/categorias')
    }).catch((err) => {
        req.flash('msg_error', 'Houve um erro ao deletar categoria: '+ err)
        res.redirect('/adm/categorias')
    })
})

router.get('/postagens', eAdm, (req,res) => {
    
    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) =>{ // não esquecer de botar o {função:função} pra exibir no render
        res.render('adm/postagens', {postagens: postagens})
    }).catch((err) =>{
        req.flash('msg_error', 'Erro ao carregar postagens '+err)
        res.redirect('/adm')
    })
})

router.get('/postagens/add', eAdm, (req, res) => { 
    Categoria.find().lean().then((categorias) => { //pra mostrar as categorias no select
        res.render('adm/postagemadd', {categorias: categorias}) // passar todas as viwes para o arquivo renderizado
    }).catch((err) => {
        req.flash('msg_error', 'Houve um erro ao carregar o formulario')
        res.redirect('/adm')
    })
    
})

router.post('/postagens/new', eAdm, (req, res) => {
    
    var erros = []    //declara um array
    
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null ) {       // ! == se não foi enviado
        erros.push({texto: 'Nome inválido'})                                                                  // || == ou todo array tem o push serve pra por novo dado dentro do array
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }

    if(req.body.categoria == '0'){
        erros.push({texto: 'categoria inválida, registre uma'})
    }
    if(erros.length > 0){  // se o tamnho do array for maior do q 0 pq a cada erro o array vazio recebe um item
       res.render('adm/postagemadd', {erros: erros})
        // se os erros forem maiores do q 0 ele vai redirecionar pra como tva antes
    }else{
        const newPostagem = {  // parecido com as categorias e o sequelize
            titulo: req.body.titulo,
            slug: req.body.slug,
            descrição: req.body.descrição,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(newPostagem).save().then(() => { //salvar
            req.flash('msg_success', 'Postagem salva com sucesso')
            res.redirect('/adm/postagens')
        }).catch((err) =>{
            req.flash('msg_error', 'Erro ao salvar postagem'+err)
            res.redirect('/adm/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdm, (req, res) =>{  // params pq o id já é paramtro   

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{ // Pesquisando qual a postagem
        Categoria.find().lean().then((categorias) =>{ // E pesquisando sua categoria
            res.render('adm/postagensedit', {categorias: categorias, postagem: postagem}) // Depois renderizando na minha view           // manda o formulario d edição q vem do botão editar q manda pra ca de acordo com o id
        }).catch((err) =>{
            req.flash('msg_error', 'Erro ao exibir categorias '+err)
            res.redirect('/amd/postagens')
        })


    }).catch((err) => {
        req.flash('msg_error', 'Erro ao editar postagem '+err)
        res.redirect('/adm/postagens')
    })

   
})

router.post('/postagens/edit', (req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null ) {       // ! == se não foi enviado
        erros.push({texto: 'titulo inválido'})                                                                  // || == ou todo array tem o push serve pra por novo dado dentro do array
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: 'Preencha o conteúdo'})
    }
    if(req.body.categoria == '0'){
        erros.push({texto: 'categoria inválida, registre uma'})
    }
    if(erros.length > 0){  // se o tamnho do array for maior do q 0 pq a cada erro o array vazio recebe um item
       res.render('adm/postagemadd', {erros: erros})
        // se os erros forem maiores do q 0 ele vai redirecionar pra como tva antes
    }else{
             Postagem.findOne({_id: req.body.id}).then((postagem) => { //parecido com as categorias
            
            postagem.titulo = req.body.titulo // faço a associação
            postagem.slug = req.body.slug
            postagem.descrição = req.body.descrição
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => { // e salvo o lean() não pode estar aqui nem na hora da associação
                req.flash('msg_success', 'Alterção realizada com sucesso')
                res.redirect('/adm/postagens')
            }).catch((err) =>{
                req.flash('msg-error', 'Houve um erro ao editar a postagem '+err)
                res.redirect('/adm/postagens')
            })

        }).catch((err) =>{
            req.flash('msg_error', 'Houve um erro ao editar postagem '+err)
            res.redirect('/adm/postagens')
        })
        }
})

router.get('/postagens/delet/:id', (req, res) =>{
    Postagem.remove({_id: req.params.id}).then(() =>{
        req.flash('msg_success', 'Deletado com sucesso')
        res.redirect('/adm/postagens')
    }).catch((err) =>{
        req.flash('msg_error', 'Erro ao deletar '+err)
        res.redirect('/adm/postagens')
    })
})

module.exports = router