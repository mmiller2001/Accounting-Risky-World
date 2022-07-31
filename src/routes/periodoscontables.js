const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const assert = require('assert')
const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {
    const periodocontable = await pool.query('select pc.perconid, pc.perconanio, pc.perconperiodo, pc.perconfechainicial, pc.perconfechafinal, pc.perconestatus, pc.perconusrcreaid, pc.perconfechacrea, pc.perconusrmodid, pc.perconfechamod, u.usuarionombre, m.usuarionombre as usuarionombremod from periodocontable pc join usuario u on pc.perconusrcreaid = u.usuarioid join usuario m on pc.perconusrmodid = m.usuarioid order by pc.perconanio,pc.perconperiodo');

    // periodocontable[0].perconfechainicial = moment(periodocontable[0].perconfechainicial).format('MMMM Do YYYY');
    periodocontable.forEach(element => {
        element.perconfechainicial = moment(element.perconfechainicial).format('MMMM Do YYYY'),
            element.perconfechafinal = moment(element.perconfechafinal).format('MMMM Do YYYY');
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
        req.flash('success', 'Periodo Contable Creado.')
        res.redirect('/periodoscontables')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'Fecha Final Incorrecta') req.flash('message', 'Fecha Final no puede ser antes que la Fecha Inicial.')
        if (error.message === 'Ano Contable Incorrecto') req.flash('message', 'Año Contable Incorrecto. Limite: 2000 <= Año Contable <= 2999')
        if (error.message === 'Periodo Contable Incorrecto') req.flash('message', 'Periodo Contable Incorrecto. Limite: 1 <= Periodo Contable <= 52')
        if (error.message === 'Fecha Inicial Vacia') req.flash('message', 'Fecha Inicial debe contener fecha.')
        if (error.message === 'Fecha Final Vacia') req.flash('message', 'Fecha Final debe contener fecha')

        res.redirect('/periodoscontables/mas')
    }
})

router.get('/ver/:id', isLoggedIn, async (req, res) => {
    const perconid = req.params.id;

    const periodocontable = await pool.query('select pc.perconid, pc.perconanio, pc.perconperiodo, pc.perconfechainicial, pc.perconfechafinal, pc.perconestatus, pc.perconusrcreaid, pc.perconfechacrea, pc.perconusrmodid, pc.perconfechamod, u.usuarionombre, m.usuarionombre as usuarionombremod from periodocontable pc join usuario u on pc.perconusrcreaid = u.usuarioid join usuario m on pc.perconusrmodid = m.usuarioid where pc.perconid = ?', [perconid])

    periodocontable[0].perconfechainicial = moment(periodocontable[0].perconfechainicial).format('MMMM Do YYYY');
    periodocontable[0].perconfechafinal = moment(periodocontable[0].perconfechafinal).format('MMMM Do YYYY');
    periodocontable[0].perconfechacrea = moment(periodocontable[0].perconfechacrea).format('MMMM Do YYYY');
    periodocontable[0].perconfechamod = moment(periodocontable[0].perconfechamod).format('MMMM Do YYYY');

    res.render('periodoscontables/ver', { periodocontable })
})

router.get('/modificar/:id', isLoggedIn, async (req, res) => {
    const perconid = req.params.id;
    const periodocontable = await pool.query('select * from periodocontable where perconid = ?', [perconid]);
    periodocontable[0].perconfechainicial = moment(periodocontable[0].perconfechainicial).format('YYYY-MM-DD');
    periodocontable[0].perconfechafinal = moment(periodocontable[0].perconfechafinal).format('YYYY-MM-DD');

    // console.log(periodocontable)
    res.render('periodoscontables/modificar', { periodocontable })
})

router.post('/modificar/:id', isLoggedIn, async (req, res) => {
    const perconid = req.params.id;
    const user = req.user;
    const { perconanio, perconperiodo, perconfechainicial, perconfechafinal } = req.body;
    const perconfechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")

    try {
        assert.equal(perconfechainicial <= perconfechafinal, true, 'Fecha Final Incorrecta')
        assert.equal(2000 <= perconanio && perconanio <= 2999, true, 'Ano Contable Incorrecto')
        assert.equal(1 <= perconperiodo && perconperiodo <= 52, true, 'Periodo Contable Incorrecto')
        assert.equal(perconfechainicial != '', true, 'Fecha Inicial Vacia')
        assert.equal(perconfechainicial != '', true, 'Fecha Final Vacia')
        const periodocontable = await pool.query('update periodocontable set perconanio = ?, perconperiodo = ?, perconfechainicial = ?, perconfechafinal = ?, perconusrmodid = ?, perconfechamod = ? where perconid = ?', [perconanio, perconperiodo, perconfechainicial, perconfechafinal, user.usuarioid, perconfechamod, perconid])
        req.flash('success', 'Periodo Contable Modificado.')
        res.redirect('/periodoscontables')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'Fecha Final Incorrecta') req.flash('message', 'Fecha Final no puede ser antes que la Fecha Inicial.')
        if (error.message === 'Ano Contable Incorrecto') req.flash('message', 'Año Contable Incorrecto. Limite: 2000 <= Año Contable <= 2999')
        if (error.message === 'Periodo Contable Incorrecto') req.flash('message', 'Periodo Contable Incorrecto. Limite: 1 <= Periodo Contable <= 52')
        if (error.message === 'Fecha Inicial Vacia') req.flash('message', 'Fecha Inicial debe contener fecha.')
        if (error.message === 'Fecha Final Vacia') req.flash('message', 'Fecha Final debe contener fecha')

        res.redirect(`/periodoscontables/modificar/${perconid}`)
    }
})

router.get('/eliminar/:id', isLoggedIn, async (req, res) => {
    const perconid = req.params.id;

    try {
        const periodocontable = await pool.query('delete from periodocontable where perconid = ?', [perconid])
        req.flash('success', 'Periodo Contable Eliminado.')
        res.redirect('/periodoscontables')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        req.flash('message', 'Accion Invalida. Periodo Contable no puede ser eliminado')
        res.redirect('/periodoscontables')
    }
})

module.exports = router;