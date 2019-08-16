var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuarios = require('../models/usuario');

//==================================
// Busqueda General
//==================================
app.get('/todo/:busqueda',(req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');// se crea una expresion regular para poder hacer sensible la busqueda 
    //para que funciones como un like en sql

    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(respuesta =>{

        res.status(200).json({
            ok: true,
            mensaje: 'Operación Satisfactoria busqueda',
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });

    });
    
    // buscarHospitales(regex)
    //     .then((hospitales)=>{
    //         res.status(200).json({
    //             ok: true,
    //             mensaje: 'Operación Satisfactoria busqueda',
    //             hospitales
    //         });

    //     });

});

//==================================
// Busqueda por coleccion
//==================================
app.get('/coleccion/:tabla/:busqueda',(req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');// se crea una expresion regular para poder hacer sensible la busqueda 
    //para que funciones como un like en sql
    switch (tabla) {
        case 'medico':

            var promesa = buscarMedicos(regex);
            
            
            break;
        case 'hospital':
        
            var promesa = buscarHospitales(regex);
            break;
        

        case 'usuario':
            var promesa = buscarUsuarios(regex);
            break;
        
        default:
            return res.status(400).json({
                ok: true,
                mensaje: 'Operación fallida'
                
            });
           

            
    }

    promesa.then((resultado)=>{
        res.status(200).json({
            ok: false,
            mensaje: 'Operación Satisfactoria busqueda',
            [tabla]:resultado
        });

    });
    

});

function buscarHospitales(regex){

    

    return new Promise((resolve, reject)=>{
        

        Hospital.find({nombre: regex})
                .populate('usuario', 'nombre email role')
                .exec( (err, hospitales) => {
    
            
                    if( err ){
                        reject('Error al buscar hospitales', err);
                    }else{
                        resolve(hospitales); 
                    }
                });
    });
}

function buscarMedicos(regex){

    

    return new Promise((resolve, reject)=>{
        

        Medicos.find({nombre: regex})
            .populate('usuario', 'nombre email role')
            .exec( (err, medicos) => {

        
                if( err ){
                    reject('Error al buscar Medicos', err);
                }else{
                    resolve(medicos); 
                }
    

            });
    });
}

function buscarUsuarios(regex){

    

    return new Promise((resolve, reject)=>{
        

        Usuarios.find({}, 'nombre email role')
                .or([{nombre: regex}, {email: regex}])
                .exec( (err, usuarios)=>{

                    if( err ){
                        reject('Error al buscar Usuarios', err);
                    }else{
                        resolve(usuarios); 
                    }

                });
    });
}
module.exports= app;