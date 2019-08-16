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
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imgRoutes = require('./routes/imagenes');

//Rutas

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);
app.use('/', appRoutes);




//Escuchar Petición

app.listen(3000, () => {
    console.log('Corriendo Express en el puerto 3000');
});