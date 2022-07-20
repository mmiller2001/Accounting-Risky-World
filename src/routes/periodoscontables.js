const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const assert = require('assert')
const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {
    const periodocontable = await pool.query('select * from periodocontable');

    // periodocontable[0].perconfechainicial = moment(periodocontable[0].perconfechainicial).format('MMMM Do YYYY');
    periodocontable.forEach(element => {
        element.perconfechainicial = moment(element.perconfechainicial).format('MMMM Do YYYY'),
        element.perconfechafinal = moment(element.perconfechafinal).format('MMMM Do YYYY'),
        console.log('element.perconfechainicial:',element.perconfechainicial)
        console.log('element.perconfechafinal:',element.perconfechafinal)
    })

    res.render('periodoscontables/periodoscontables', { periodocontable })
})

router.get('/mas', isLoggedIn, async (req, res) => {
    res.render('periodoscontables/mas')
})

router.post('/mas', isLoggedIn, async (req, res) => {
    const { perconanio, perconperiodo, perconfechainicial, perconfechafinal } = req.body;
    const user = req.user;
    const nuevoPeriodo = {
        perconanio: perconanio,
        perconperiodo: perconperiodo,
        perconfechainicial: perconfechainicial,
        perconfechafinal: perconfechafinal,
        perconestatus: 2,
        perconusrcreaid: user.usuarioid,
        perconfechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        perconusrmodid: user.usuarioid,
        perconfechamod: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    console.log(nuevoPeriodo)

    try {
        assert.equal(perconfechainicial <= perconfechafinal, true, 'Fecha Final Incorrecta')
        assert.equal(2000 <= perconanio && perconanio <= 2999, true, 'Ano Contable Incorrecto')
        assert.equal(1 <= perconperiodo && perconperiodo <= 52, true, 'Periodo Contable Incorrecto')
        assert.equal(perconfechainicial != '', true, 'Fecha Inicial Vacia')
        assert.equal(perconfechainicial != '', true, 'Fecha Final Vacia')
        const periodocontable = await pool.query('insert into periodocontable set ?', [nuevoPeriodo]);
        req.flash('success', 'Codigo de Referencia Creado.')
        res.redirect('/periodoscontables')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'Fecha Final Incorrecta') {
            req.flash('message', 'Fecha Final no puede ser antes que la Fecha Inicial.')
            res.redirect('/periodoscontables/mas')
        }
        if (error.message === 'Ano Contable Incorrecto') {
            req.flash('message', 'Año Contable Incorrecto. Limite: 2000 <= Año Contable <= 2999')
            res.redirect('/periodoscontables/mas')
        }
        if (error.message === 'Periodo Contable Incorrecto') {
            req.flash('message', 'Periodo Contable Incorrecto. Limite: 1 <= Periodo Contable <= 52')
            res.redirect('/periodoscontables/mas')
        }
        if (error.message === 'Fecha Inicial Vacia') {
            req.flash('message', 'Fecha Inicial debe contener fecha.')
            res.redirect('/periodoscontables/mas')
        }
        if (error.message === 'Fecha Final Vacia') {
            req.flash('message', 'Fecha Final debe contener fecha')
            res.redirect('/periodoscontables/mas')
        }
    }
})

module.exports = router;