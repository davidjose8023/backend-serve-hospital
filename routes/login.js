var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var login = express();

var Usuario = require('../models/usuario');

var mdAutenticacion = require('../middelware/autenticacion');

//====================================================
// Renovar el token
//====================================================

login.get('/renuevatoken',mdAutenticacion.verificaToken,(req, res) =>{

    var token = jwt.sign({usuario: req.usuario}, SEED, { expiresIn: 14400}); // 4 horas


    return res.status(200).json({
        ok: false,
        token
    });


});

//====================================================
// Autenticación de Google
//====================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

login.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
    .catch( e => {
        return res.status(400).json({
            ok: false,
            mensaje: 'token no valido',
            error: e.error
        });
    });

    Usuario.findOne({email : googleUser.email }, (err, usuarioBD) => {
        
        if( err ) 
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al buscar usuario',
            errors: err
        });

        if(usuarioBD){
            if(!usuarioBD.google){

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe autenticarse normal'
                });

            }else{
                var usuario =  new Usuario();

                usuario.email = googleUser.email;
                usuario.nombre = googleUser.nombre;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario._id = usuarioBD._id;
                usuario.password = ':)';
                var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400}); // 4 horas
                return res.status(200).json({
                    ok: true,
                    token,
                    usuario:usuarioBD,
                    id: usuarioBD._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            }
            
        }else{// el usuario no exite hay que crearlo
            
            var usuario =  new Usuario();

            usuario.email = googleUser.email;
            usuario.nombre = googleUser.nombre;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) =>{
          
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400}); // 4 horas
                if( err ) 
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error crear usuario',
                    errors: err
                });
                return res.status(200).json({
                    ok: true,
                    token,
                    usuario:usuarioDB,
                    id: usuarioDB._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            });

        }

        

        
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'exitoo',
    //     googleUser

    // });
    

});

//====================================================
// Autenticación Normal
//====================================================


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
            usuario:usuarioBD,
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)
        });
    });

    

});


function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo : 'Principal',
          icono : 'mdi mdi-gauge',
          submenu : [
            {titulo : 'Dashboard', url : '/dashboard'},
            {titulo : 'ProgressBar', url : '/progress'},
            {titulo : 'Gráficas', url : '/graficas1'},
            {titulo : 'Promesas', url : '/promesas'},
            {titulo : 'Rxjs', url : '/rxjs'}
          ]
    
        },
        {
          titulo: 'Mantenimiento',
          icono : 'mdi mdi-folder-lock-open',
          submenu : [
            
            {titulo : 'Hospitales', url : '/hospitales'},
            {titulo : 'Medicos', url : '/medicos'}
          ]
        }
      ];
      //console.log(ROLE);
      if( ROLE == "ADMIN_ROLE" ){

        menu[1].submenu.unshift({titulo : 'Usuarios', url : '/usuarios'});
      }
      //console.log(menu[1].submenu);
      return menu;

}











module.exports= login;