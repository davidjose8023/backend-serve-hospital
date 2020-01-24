var express = require('express');
var app = express();

var mdAutenticacion = require('../middelware/autenticacion');

var Hospital = require('../models/hospital');

// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({

                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospitalcon ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
    })

//==========================================
//  Metodo get para obtener los
//  los hospitales
//==========================================

app.get('/',(req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)// salta los primeros desde
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales)=>{
            
            if( err ) 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
                });


            Hospital.count({}, (err, total) => {

                if( err ) 
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error count Hospital',
                    errors: err
                });
                
                res.status(200).json({
                    ok: true,
                    hospitales,
                    total
                });
            });
        }); 

});

//==========================================
//  Metodo post para ingresar
//  los Hospitales
//==========================================

app.post('/',mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id

    });

    hospital.save( (err, hospitalGuardado) => {
        
        if( err ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'Error crear hospital',
            errors: err
        });

            
        return res.status(201).json({
            ok: true,
            hospital:hospitalGuardado
        });

    });

    
});

//==========================================
//  Metodo PUT para actualizar
//  los hospitales
//==========================================


app.put('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id , (err, hospital) => {

        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar hospital',
            errors: err
        });
        
        if( !hospital ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'El hospital con el id: '+ id+' no exite',
            errors: { message : 'No existe un hospital con ese id'}
        });

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalActualzado) => {
            
            if( err ) 
            return res.status(301).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
                errors: { message : err}
            });

           
            return res.status(200).json({
                ok: true,
                hospital:hospitalActualzado
            });


        });


        
    });


});

//==========================================
//  Metodo DELETE para ELIMINAR
//  los usuarios
//==========================================
app.delete('/:id',mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al BORRAR Hospital',
            errors: { message : err}
        });
        if( !hospitalBorrado ) 
        return res.status(400).json({
            ok: false,
            mensaje: 'El Hospital no existe',
            errors: { message : 'No existe un Hospital con ese id'}
        });

       
        return res.status(200).json({
            ok: true,
            hospital:hospitalBorrado
        });


    });
});


module.exports= app;