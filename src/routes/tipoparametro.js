const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

// Parametro
router.get('/tipoparametro', isLoggedIn, async (req, res) => {
    const tipoparametro = await pool.query('select * from tipoparametro')
    const user = req.user;
    //console.log('User: ', user);
    //console.log('Tipo Parametro: ', tipoparametro);

    res.render('tipoparametro', { tipoparametro, user })
})

router.get('/tipoparametromas', isLoggedIn, async (req, res) => {
    res.render('tipoparametromas');
})

router.post('/tipoparametromas', isLoggedIn, async (req, res) => {
    const { tipoparcodigo, tipodescripcion } = req.body;
    const user = req.user;
    const time = req.body.params;
    console.log('time: ', time);

    const nuevoTipoParametro = {
        tipoparcodigo: tipoparcodigo,
        tipodescripcion: tipodescripcion,
        tipoparfechacrea: null,
        tipoparfechamod: null,
        tipoparusrcreaid: user.id
    };

    const tipoparametromas = await pool.query('insert into tipoparametro set ?', [nuevoTipoParametro]);
    res.redirect('tipoparametro');
})

router.get('/viewuser/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const tipoparametro = await pool.query('select * from tipoparametro where tipoparid = ?', [id]);
    res.render('viewuser', { tipoparametro });
})

router.get('/edituser/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const tipoparametro = await pool.query('select * from tipoparametro where tipoparid = ?', [id]);
    res.render('edituser', { tipoparametro });
})

router.post('/edituser/:id', isLoggedIn, async (req, res) => {
    const tipoparid = req.params.id;
    const { tipoparcodigo, tipodescripcion } = req.body;
    const tipoparametro = await pool.query('update tipoparametro set tipoparcodigo = ?, tipodescripcion = ? where tipoparid = ?', [tipoparcodigo, tipodescripcion, tipoparid]);
    res.redirect('/tipoparametro');
})

module.exports = router;

