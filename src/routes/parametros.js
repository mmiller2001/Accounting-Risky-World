const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const { custom_lookup, custom_unwind} = require('node-lookup-helper');

const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {

    const query = 'SELECT p.parid, p.parcodigo, p.parclasificacion, tp.tipoparcodigo, p.parvalor, p.pardescripcion, p.parfechacrea FROM parametro p join tipoparametro tp on p.tipoparid = tp.tipoparid ORDER BY p.parid DESC'
    const query2 = 'SELECT p.parid, p.parcodigo, p.parclasificacion, c.parletras, tp.tipoparcodigo, p.parvalor, p.pardescripcion, p.parfechacrea FROM parametro p join tipoparametro tp on p.tipoparid = tp.tipoparid join clasificacion c on p.parclasificacion = c.parclasificacion ORDER BY p.parid DESC'
    const parametro = await pool.query(query2);

    // console.log(parametro);

    // console.log(parametro);

    res.render('parametros/parametro', { parametro });
})

router.get('/mas', isLoggedIn, async (req,res) => {
    const tipoParametros = await pool.query('select distinct tipoparcodigo, tipoparid from tipoparametro order by tipoparid');
    console.log('add tipoParametros:', tipoParametros);
    res.render('parametros/mas', {tipoParametros});
})

router.post('/mas', isLoggedIn, async (req,res) => {
    const {parcodigo,tipoparid,pardescripcion,parexplicacion, parclasificacion, parvalor} = req.body;
    const user = req.user;
    const tipoParametros = await pool.query('select distinct tipoparcodigo, tipoparid from tipoparametro order by tipoparid');
    const nuevoParametro = {
       parcodigo: parcodigo,
       tipoparid: tipoparid,
       pardescripcion: pardescripcion,
       parexplicacion: parexplicacion,
       parclasificacion: parclasificacion,
       parvalor: parvalor,
       parusrcreaid: user.usuarioid,
       parfechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
       parusrmodid: user.usuarioid,
       parfechamod: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    console.log('Nuevo Parametro aqui:', nuevoParametro);
    const parameter = await pool.query('insert into parametro set ?', [nuevoParametro], function (err,result) {
        if(err) {
            if(err.code === 'ER_DATA_TOO_LONG') {
                req.flash('message', 'Parametro Codigo extensivo. Intenta otra vez.');
                res.render('parametros/mas', {tipoParametros});
            }
            else 
                res.redirect('/parametros');
        }
        else 
                res.redirect('/parametros');
    });
    res.redirect('/parametros');
})

router.get('/ver/:id', isLoggedIn, async (req,res) => {
    const parid = req.params.id;
    const parametro = await pool.query('select p.parid, p.parcodigo, p.tipoparid, p.pardescripcion, p.parexplicacion, p.parclasificacion, p.parvalor, p.parusrcreaid, p.parfechacrea, p.parusrmodid, p.parfechamod, c.parletras, u.usuarionombre, m.usuarionombre as usuarionombremod from parametro p join clasificacion c on p.parclasificacion = c.parclasificacion join usuario u on p.parusrcreaid = u.usuarioid join usuario m on p.parusrmodid = m.usuarioid where parid = ?', [parid]);
    const tipoParametro = await pool.query('select t.tipoparcodigo, t.tipodescripcion from tipoparametro t join parametro p on p.tipoparid = t.tipoparid where parid = ?', [parid])
    
    console.log(parametro)

    res.render('parametros/ver', {parametro, tipoParametro});
})

router.get('/modificar/:id', isLoggedIn, async (req,res) => {
    const parid = req.params.id;
    const parametro = await pool.query('select *, c.parletras, tp.tipoparcodigo from parametro p join clasificacion c on p.parclasificacion = c.parclasificacion join tipoparametro tp on p.tipoparid = tp.tipoparid where parid = ?', [parid]);
    const tipoParametros = await pool.query('select distinct tipoparcodigo, tipoparid from tipoparametro order by tipoparid');
     
    res.render('parametros/modificar', {parametro,tipoParametros});
})

router.post('/modificar/:id', isLoggedIn, async (req,res) => {
    const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const user = req.user;
    const parid = req.params.id;
    const {parcodigo, parclasificacion, tipoparid, pardescripcion, parexplicacion, parvalor} = req.body;
    
    const nuevoParametro = await pool.query('update parametro set parcodigo = ?, tipoparid = ?, pardescripcion = ?, parexplicacion = ?, parclasificacion = ?, parvalor = ?, parusrmodid = ?, parfechamod = ? where parid = ?',[parcodigo, tipoparid, pardescripcion, parexplicacion, parclasificacion, parvalor, user.usuarioid, date,parid]);
    res.redirect('/parametros');
})

router.get('/eliminar/:id', isLoggedIn, async (req,res) => {
    const parid = req.params.id;
    const parametro = await pool.query('delete from parametro where parid = ?', [parid]);
    res.redirect('/parametros');
})

module.exports = router;