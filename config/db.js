if(process.env.Node_env == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://Matheus:familia26@cluster0.gtg2mvd.mongodb.net/test'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/Blognode'}
}