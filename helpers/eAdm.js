// impedir q usuários normais façam besteira
// Gerenciar o acesso pelo nível de conta
module.exports = {
    eAdm: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdm == 1){// verificar se um usuário está autenticado ou não
            return next();
        }
        // caso um usuário comun tente acessar a parte administrativa
        req.flash('msg_error', 'Você precisa ser um admistrador')
        res.redirect('/')
    }
}