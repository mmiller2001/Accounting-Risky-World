const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const { custom_lookup, custom_unwind } = require('node-lookup-helper');

const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {

    const query = 'SELECT p.parid, p.parcodigo, p.parclasificacion, tp.tipoparcodigo, p.parvalor, p.pardescripcion, p.parfechacrea FROM parametro p join tipoparametro tp on p.tipoparid = tp.tipoparid ORDER BY p.parid DESC'
    const query2 = 'SELECT p.parid, p.parcodigo, p.parclasificacion, c.parletras, tp.tipoparcodigo, p.parvalor, p.pardescripcion, p.parfechacrea, u.usuarionombre FROM parametro p join tipoparametro tp on p.tipoparid = tp.tipoparid join clasificacion c on p.parclasificacion = c.parclasificacion join usuario u on p.parusrcreaid = u.usuarioid ORDER BY p.parid DESC'
    const parametro = await pool.query(query2);

    res.render('parametros/parametro', { parametro });
})

router.get('/mas', isLoggedIn, async (req, res) => {
    const tipoParametros = await pool.query('select distinct tipoparcodigo, tipoparid from tipoparametro order by tipoparid');
    // console.log('add tipoParametros:', tipoParametros);
    res.render('parametros/mas', { tipoParametros });
})

router.post('/mas', isLoggedIn, async (req, res) => {
    const { parcodigo, tipoparid, pardescripcion, parexplicacion, parclasificacion, parvalor } = req.body;
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

    try {
        const parameter = await pool.query('insert into parametro set ?', [nuevoParametro])
        req.flash('success', 'Parametro ha sido insertado');
        res.redirect('/parametros');
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`)
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'parcodigo\' at row 1') {
            req.flash('message', 'Parametro Codigo muy extenso. Limite de 10 caracteres')
            res.redirect('/parametros/mas')
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'pardescripcion\' at row 1') {
            req.flash('message', 'Parametro Descripcion muy extenso. Limite de 120 caracteres')
            res.redirect('/parametros/mas')
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'parvalor\' at row 1') {
            req.flash('message', 'Parametro Valor muy extenso. Limite de 255 caracteres')
            res.redirect('/parametros/mas')
        }
    }
})

router.get('/ver/:id', isLoggedIn, async (req, res) => {
    const parid = req.params.id;
    const parametro = await pool.query('select p.parid, p.parcodigo, p.tipoparid, p.pardescripcion, p.parexplicacion, p.parclasificacion, p.parvalor, p.parusrcreaid, p.parfechacrea, p.parusrmodid, p.parfechamod, c.parletras, u.usuarionombre, m.usuarionombre as usuarionombremod from parametro p join clasificacion c on p.parclasificacion = c.parclasificacion join usuario u on p.parusrcreaid = u.usuarioid join usuario m on p.parusrmodid = m.usuarioid where parid = ?', [parid]);
    const tipoParametro = await pool.query('select t.tipoparcodigo, t.tipodescripcion from tipoparametro t join parametro p on p.tipoparid = t.tipoparid where parid = ?', [parid])

    console.log(parametro)

    res.render('parametros/ver', { parametro, tipoParametro });
})

router.get('/modificar/:id', isLoggedIn, async (req, res) => {
    const parid = req.params.id;
    const parametro = await pool.query('select *, c.parletras, tp.tipoparcodigo from parametro p join clasificacion c on p.parclasificacion = c.parclasificacion join tipoparametro tp on p.tipoparid = tp.tipoparid where parid = ?', [parid]);
    const tipoParametros = await pool.query('select distinct tipoparcodigo, tipoparid from tipoparametro order by tipoparid');

    res.render('parametros/modificar', { parametro, tipoParametros });
})

router.post('/modificar/:id', isLoggedIn, async (req, res) => {
    const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const user = req.user;
    const parid = req.params.id;
    const { parcodigo, parclasificacion, tipoparid, pardescripcion, parexplicacion, parvalor } = req.body;

    try {
        const nuevoParametro = await pool.query('update parametro set parcodigo = ?, tipoparid = ?, pardescripcion = ?, parexplicacion = ?, parclasificacion = ?, parvalor = ?, parusrmodid = ?, parfechamod = ? where parid = ?', [parcodigo, tipoparid, pardescripcion, parexplicacion, parclasificacion, parvalor, user.usuarioid, date, parid]);
        req.flash('success', 'Parametro ha sido modificado');
        res.redirect('/parametros');
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`)
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'parcodigo\' at row 1') {
            req.flash('message', 'Parametro Codigo muy extenso. Limite de 10 caracteres')
            res.redirect(`/parametros/modificar/${parid}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'pardescripcion\' at row 1') {
            req.flash('message', 'Parametro Descripcion muy extenso. Limite de 120 caracteres')
            res.redirect(`/parametros/modificar/${parid}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'parvalor\' at row 1') {
            req.flash('message', 'Parametro Valor muy extenso. Limite de 255 caracteres')
            res.redirect(`/parametros/modificar/${parid}`)
        }
    }
})

router.get('/eliminar/:id', isLoggedIn, async (req, res) => {
    const parid = req.params.id;
    try {
        const parametro = await pool.query('delete from parametro where parid = ?', [parid]);
        req.flash('success', 'Tipo Parametro ha sido eliminado');
        res.redirect('/parametros');
    } catch (error) {
        console.log(error.code);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            console.log('\n----------------------ERROR-----------------------\n')
            req.flash('message', 'Accion Invalida. Parametros dependen del Tipo de Parametro seleccionado.')
            res.redirect('/tipoparametro')
        }
    }

})

module.exports = router;