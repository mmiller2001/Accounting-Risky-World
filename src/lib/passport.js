const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const moment = require('moment');

const pool = require('../database')
const helpers = require('../lib/helpers')

//login
passport.use('local.signin', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'usuariopass',
    passReqToCallback: true,
}, async (req,username, password, done) => {
    console.log(req.body)
    const rows = await pool.query('select * from usuario where usuario = ?', [username])
    if(rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password,user.usuariopass);
        if(validPassword) {
            done(null,user,req.flash('Success','Welcome'+ user.usuario));
        } else {
            done(null, false, req.flash('message','Incorrect Password'));
        }
    } else {
        return done(null, false, req.flash('message','The Username does not exist'));
    }
}));


//signin
passport.use('local.signup', new LocalStrategy({
    usernameField: 'usuario',
    passwordField: 'usuariopass',
    passReqToCallback: true
}, async (req,usuario, usuariopass, done) => {
    const { usuarionombre, usuariocorreo } = req.body
    const date = console.log(moment().format('L'));

    const newUser = {
        usuario: usuario,
        usuarionombre: usuarionombre,
        usuariopass: usuariopass,
        usuarioestatus: 1,
        usuariocambiapass: 0,
        usuariocorreo: usuariocorreo,
        usuariousrcreaid: null,
        usuariofechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        usuariousrmodid: null,
        usuariofechamod: null
    };

    console.log(newUser);
    console.log('usuarionombre: ',usuarionombre);

    newUser.usuariopass = await helpers.encryptPassword(usuariopass);
    const result = await pool.query('insert into usuario set ?', [newUser]);
    newUser.usuarioid = result.insertId;
    return done(null,newUser);
}));

passport.serializeUser((user, done) => {
    done(null,user.usuarioid);
})

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('select * from usuario where usuarioid = ?', [id]);
    done(null,rows[0]);
})