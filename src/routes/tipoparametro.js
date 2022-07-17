const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

// Parametro
router.get('/tipoparametro', isLoggedIn, async (req, res) => {
    const tipoparametro = await pool.query('select *, u.usuarionombre from tipoparametro tp join usuario u on tp.tipoparusrcreaid = u.usuarioid')
    const user = req.user;

    res.render('tipoparametro', { tipoparametro, user })
})

router.get('/tipoparametromas', isLoggedIn, async (req, res) => {
    res.render('tipoparametromas');
})

router.post('/tipoparametromas', isLoggedIn, async (req, res) => {
    const { tipoparcodigo, tipodescripcion } = req.body;
    const user = req.user;
    const time = req.body.params;

    const nuevoTipoParametro = {
        tipoparcodigo: tipoparcodigo,
        tipodescripcion: tipodescripcion,
        tipoparfechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        tipoparfechamod: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        tipoparusrcreaid: user.usuarioid,
        tipoparusrmodid: user.usuarioid
    };

    try {
        const tipoparametromas = await pool.query('insert into tipoparametro set ?', [nuevoTipoParametro]);
        res.redirect('/tipoparametro');
    } catch (error) {
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'tipoparcodigo\' at row 1') {
            console.log('\n------------------ERROR----------------------\n')
            req.flash('message', 'Tipo Codigo muy extenso. Limite de 10 caracteres')
            res.redirect('/tipoparametromas')
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'tipodescripcion\' at row 1') {
            console.log('\n------------------ERROR----------------------\n')
            req.flash('message', 'Tipo Descripcion muy extenso. Limite de 120 caracteres')
            res.redirect('/tipoparametromas')
        }
    }
})

router.get('/viewuser/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const tipoparametro = await pool.query('select tp.tipoparid, tp.tipoparcodigo, tp.tipodescripcion, tp.tipoparfechacrea, tp.tipoparfechamod, tp.tipoparusrcreaid, tp.tipoparusrmodid, u.usuarionombre, m.usuarionombre as usuarionombremodifica from tipoparametro tp join usuario u on tp.tipoparusrcreaid = u.usuarioid join usuario m on tp.tipoparusrmodid = m.usuarioid where tp.tipoparid = ?', [id]);

    console.log(tipoparametro)

    res.render('viewuser', { tipoparametro });
})

router.get('/edituser/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const tipoparametro = await pool.query('select * from tipoparametro where tipoparid = ?', [id]);
    res.render('edituser', { tipoparametro });
})

router.post('/edituser/:id', isLoggedIn, async (req, res) => {
    const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const tipoparid = req.params.id;
    const { tipoparcodigo, tipodescripcion } = req.body;
    const user = req.user;

    try {
        const tipoparametro = await pool.query('update tipoparametro set tipoparcodigo = ?, tipodescripcion = ?, tipoparfechamod = ?, tipoparusrmodid = ? where tipoparid = ?', [tipoparcodigo, tipodescripcion, date, user.usuarioid, tipoparid]);
        res.redirect('/tipoparametro');
    } catch (error) {
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'tipoparcodigo\' at row 1') {
            console.log('\n------------------ERROR----------------------\n')
            req.flash('message', 'Tipo Codigo muy extenso. Limite de 10 caracteres')
            res.redirect(`/edituser/${tipoparid}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'tipodescripcion\' at row 1') {
            console.log('\n------------------ERROR----------------------\n')
            req.flash('message', 'Tipo Descripcion muy extenso. Limite de 120 caracteres')
            res.redirect(`/edituser/${tipoparid}`)
        }
    }

})

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const tipoparid = req.params.id;

    try {
        const erase = await pool.query('delete from tipoparametro where tipoparid = ?', [tipoparid]);
        req.flash('success', 'Tipo Parametro ha sido eliminado');
        res.redirect('/tipoparametro');
    } catch (error) {
        console.log(error.code)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            console.log('\n----------------------ERROR-----------------------\n')
            req.flash('message', 'Accion Invalida. Parametros dependen del Tipo de Parametro seleccionado.')
            res.redirect('/tipoparametro')
        }
    }
})

module.exports = router;

