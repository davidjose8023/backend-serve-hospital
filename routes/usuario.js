var express = require('express');
var bcrypt = require('bcryptjs');
var usuario = express();

var mdAutenticacion = require('../middelware/autenticacion');

var Usuario = require('../models/usuario');

//==========================================
//  Metodo get para obtener los
//  los usuarios
//==========================================

usuario.get('/',(req, res, next) => {

    Usuario.find({},'_id nombre email img role').exec((err, usuarios)=>{
        
        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error cargando usuarios',
            errors: err
            });

        res.status(200).json({
            ok: true,
            usuarios
        });
    }); 

});


//==========================================
//  Metodo post para ingresar
//  los usuarios
//==========================================

usuario.post('/',mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });

    usuario.save( (err, usuarioGuardado) => {
        
        if( err ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'Error crear usuario',
            errors: err
        });

            
        return res.status(201).json({
            ok: true,
            usuario:usuarioGuardado
        });

    });

    
});

//==========================================
//  Metodo PUT para actualizar
//  los usuarios
//==========================================


usuario.put('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id , (err, usuario) => {

        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario',
            errors: err
        });
        
        if( !usuario ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'El usuario con el id: '+ id+' no exite',
            errors: { message : 'No existe un usuario con ese id'}
        });

        usuario.nombre = body.nombre;
        usuario.email  = body.email;
        usuario.role   = body.role;

        usuario.save( (err, usuarioActualzado) => {
            
            if( err ) 
            return res.status(301).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                errors: { message : err}
            });

            usuarioActualzado.password = ";)";
            return res.status(200).json({
                ok: true,
                usuario:usuarioActualzado
            });


        });


        
    });


});

//==========================================
//  Metodo PUT para actualizar
//  los usuarios
//==========================================
usuario.delete('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al BORRAR usuario',
            errors: { message : err}
        });
        if( !usuarioBorrado ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'El Usuario no existe',
            errors: { message : 'No existe un usuario con ese id'}
        });

        usuarioBorrado.password = ";)";
        return res.status(200).json({
            ok: true,
            usuario:usuarioBorrado
        });


    });
});


module.exports= usuario;