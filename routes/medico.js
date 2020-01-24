var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();

var mdAutenticacion = require('../middelware/autenticacion');

var Medico = require('../models/medico');

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
                });
            }
            if (!medico) {
                return res.status(400).json({

                    ok: false,
                    mensaje: 'El medico con el id ' + id + 'no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                medico
            });
        })
    })

//==========================================
//  Metodo get para obtener los
//  los Medicos
//==========================================

app.get('/',(req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)// salta los primeros desde
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos)=>{
            
            if( err ) 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando medicos',
                errors: err
                });

            Medico.count({}, (err, total) => {

                if( err ) 
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error count Medico',
                    errors: err
                });
                
                res.status(200).json({
                    ok: true,
                    medicos,
                    total
                });
            });
        }); 

});


//==========================================
//  Metodo post para ingresar
//  los medicos
//==========================================

app.post('/',mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital

    });

    medico.save( (err, medicoGuardado) => {
        
        if( err ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'Error crear medico',
            errors: err
        });

            
        return res.status(201).json({
            ok: true,
            medico:medicoGuardado
        });

    });

    
});

//==========================================
//  Metodo PUT para actualizar
//  los usuarios
//==========================================


app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id , (err, medico) => {

        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar medico',
            errors: err
        });
        
        if( !medico ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'El medico con el id: '+ id+' no exite',
            errors: { message : 'No existe un medico con ese id'}
        });

        medico.nombre = body.nombre;
        medico.hospital   = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save( (err, medicoActualzado) => {
            
            if( err ) 
            return res.status(301).json({
                ok: false,
                mensaje: 'Error al actualizar medico',
                errors: { message : err}
            });

            
            return res.status(200).json({
                ok: true,
                medico:medicoActualzado
            });


        });


        
    });


});

//==========================================
//  Metodo DELETE para ELIMINAR
//  los medicos
//==========================================
app.delete('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al BORRAR medico',
            errors: { message : err}
        });
        if( !medicoBorrado ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'El medico no existe',
            errors: { message : 'No existe un medico con ese id'}
        });

     
        return res.status(200).json({
            ok: true,
            medico:medicoBorrado
        });


    });
});


module.exports= app;