//Requires

var express = require('express');

var mongoose = require('mongoose');

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res)=>{

    if(err) throw err;
    
    console.log('Base de Datos Online');
});



//Inicializar Variables

var app = express();

//Rutas

app.get('/',(req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Operación Satisfactoria Bien'
    });


});

//Escuchar Petición

app.listen(3000, () => {
    console.log('Corriendo Express en el puerto 3000');
});