var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var login = express();

var Usuario = require('../models/usuario');



login.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({email : body.email }, (err, usuarioBD) => {
        
        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario',
            errors: err
        });

        if( !usuarioBD ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas -email',
            errors: { message : 'Credenciales incorrectas'}
        });

        if( !bcrypt.compareSync( body.password, usuarioBD.password ) )
        return res.status(400).json({
            ok: false,
            mensaje: 'Credenciales incorrectas -password',
            errors: { message : 'Credenciales incorrectas'}
        });

        //crear token
        usuarioBD.password = ';)';
        var token = jwt.sign({usuario: usuarioBD}, SEED, { expiresIn: 14400}); // 4 horas


        return res.status(200).json({
            ok: true,
            token,
            usuarioBD
        });
    });

    

});














module.exports= login;