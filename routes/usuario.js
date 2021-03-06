var express = require('express');
var bcrypt = require('bcryptjs');
var usuario = express();

var mdAutenticacion = require('../middelware/autenticacion');

var Usuario = require('../models/usuario');


//==========================================
//  Metodo get para obtener un usuario
//==========================================

usuario.get('/userId/:id',(req, res) => {

    var id = req.params.id;
    
    //console.log(id);
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
        return res.status(200).json({
            ok: true,
            usuario
        });
    }); 

});
//==========================================
//  Metodo get para obtener los
//  los usuarios
//==========================================

usuario.get('/',(req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    console.log(desde);

    Usuario.find({},'_id nombre email img role google')
        .skip(desde)// salta los primeros desde
        .limit(5)
        .exec((err, usuarios)=>{
            
            if( err ) 
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
                });
            Usuario.count({}, (err, total) => {

                if( err ) 
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error count usuario',
                    errors: err
                });
                
                res.status(200).json({
                    ok: true,
                    usuarios,
                    total
                });
            });
        }); 

});


//==========================================
//  Metodo post para ingresar
//  los usuarios
//==========================================

usuario.post('/', (req, res, next) => {

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
            usuario:usuarioGuardado,
            menu: obtenerMenu(usuarioActualzado.role)
        });

    });

    
});

//==========================================
//  Metodo PUT para actualizar
//  los usuarios
//==========================================


usuario.put('/:id',[mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminRoleOMismoUsuario], (req, res) => {

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
                usuario:usuarioActualzado,
                menu: obtenerMenu(usuarioActualzado.role)
            });


        });


        
    });


});

//==========================================
//  Metodo DELETE para ELIMINAR
//  los usuarios
//==========================================
usuario.delete('/:id',[mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminRole], (req, res) => {

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


module.exports= usuario;