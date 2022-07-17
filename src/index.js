const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const MySqlStore = require('express-mysql-session')
const { database } = require('./keys')
const passport = require('passport')

// initializations
const app = express();
require('./lib/passport');

//settings
app.set('port',process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs',exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs', 
    helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

//Middlewares
app.use(session({
    secret: 'faztmysqlnodesession',
    resave: false,
    saveUninitialized: false,
    store: new MySqlStore(database)
}))
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


//Global Variables
app.use((req,res,next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.warning = req.flash('warning');
    app.locals.user  = req.user;
    next();
})

//Routes
app.use(require('./routes'))
app.use(require('./routes/tipoparametro'))
app.use(require('./routes/authentication'))

app.use('/links',require('./routes/links'))
app.use('/parametros',require('./routes/parametros'))
app.use('/codreferencia',require('./routes/codreferencia'))
app.use('/coddocumento',require('./routes/coddocumento'))
app.use('/estandar',require('./routes/estandar'))
app.use('/estandar',require('./routes/subcuentas1'))
app.use('/estandar',require('./routes/posteable'))

//Public
app.use(express.static(path.join(__dirname, 'public')));

//Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port',app.get('port'))
})