const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database')
const helpers = require('../lib/helpers')

//login
passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req,username, password, done) => {
    console.log(req.body)
    const rows = await pool.query('select * from users where username = ?', [username])
    if(rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password,user.password);
        if(validPassword) {
            done(null,user,req.flash('Success','Welcome'+ user.username));
        } else {
            done(null, false, req.flash('message','Incorrect Password'));
        }
    } else {
        return done(null, false, req.flash('message','The Username does not exist'));
    }
}));


//signin
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req,username, password, done) => {
    const { fullname } = req.body
    const newUser = {
        username: username,
        fullname: fullname,
        password: password
    };

    console.log(newUser);
    console.log('fullname: ',fullname);

    newUser.password = await helpers.encryptPassword(password);
    const result = await pool.query('insert into users set ?', [newUser]);
    newUser.id = result.insertId;
    return done(null,newUser);
}));

passport.serializeUser((user, done) => {
    done(null,user.id);
})

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('select * from users where id = ?', [id]);
    done(null,rows[0]);
})