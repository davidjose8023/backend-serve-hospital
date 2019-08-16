var express = require('express');
var app = express();

const path = require('path');// esto para resolver las rutas a los archivos
var fs = require('fs'); // trabajar con archivos

app.get('/:tipo/:img',(req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
  
    var pathtImagen = path.resolve(__dirname, `../upload/${tipo}/${img}`);

    if(fs.existsSync(pathtImagen)){
        res.sendFile(pathtImagen);
    }else{
        var pathNoImage = path.resolve(__dirname,'../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Operación Satisfactoria img'
    // });


});

module.exports= app;