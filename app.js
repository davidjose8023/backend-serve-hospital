//Requires

var express = require('express');

var mongoose = require('mongoose');

var bodyParser = require('body-parser');


mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res)=>{

    if(err) throw err;
    
    console.log('Base de Datos Online');
});



//Inicializar Variables

var app = express();

//Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar Rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//Rutas

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);




//Escuchar Petición

app.listen(3000, () => {
    console.log('Corriendo Express en el puerto 3000');
});