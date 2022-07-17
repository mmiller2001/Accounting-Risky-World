const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {
    const codreferencia = await pool.query('select cr.codrefid, cr.codrefcodigo, cr.codrefdescripcion, cr.codrefexplicacion, cr.codrefusrcreaid, cr.codreffechacrea, cr.codrefusrmodid, cr.codreffechamod, u.usuarionombre from codreferencia cr join usuario u on cr.codrefusrcreaid = u.usuarioid');
    // console.log(codreferencia)
    res.render('codreferencia/codreferencia', { codreferencia });
})

router.get('/mas', isLoggedIn, async (req, res) => {
    res.render('codreferencia/mas');
})

router.post('/mas', isLoggedIn, async (req, res) => {
    const { codrefcodigo, codrefdescripcion, codrefexplicacion } = req.body;
    const user = req.user;
    const nuevoCodReferencia = {
        codrefcodigo: codrefcodigo,
        codrefdescripcion: codrefdescripcion,
        codrefexplicacion: codrefexplicacion,
        codrefusrcreaid: user.usuarioid,
        codreffechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        codrefusrmodid: user.usuarioid,
        codreffechamod: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    try {
        const codreferencia = await pool.query('insert into codreferencia set ?', [nuevoCodReferencia]);
        req.flash('success', 'Codigo de Referencia Creado.')
        res.redirect('/codreferencia')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'codrefcodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 5 caracteres')
            res.redirect('/codreferencia/mas')
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'codrefdescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect('/codreferencia/mas')
        }
    }
})

router.get('/ver/:id', isLoggedIn, async (req, res) => {
    const codrefid = req.params.id;
    const query = 'select cr.codrefid, cr.codrefcodigo, cr.codrefdescripcion, cr.codrefexplicacion, cr.codrefusrcreaid, cr.codreffechacrea, cr.codrefusrmodid, cr.codreffechamod, u.usuarionombre, m.usuarionombre as usuarionombremod from codreferencia cr join usuario u on cr.codrefusrcreaid = u.usuarioid join usuario m on cr.codrefusrmodid = m.usuarioid where cr.codrefid = ?';

    const codreferencia = await pool.query(query, [codrefid])

    console.log(codreferencia)
    res.render('codreferencia/ver', { codreferencia });
})

router.get('/modificar/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const codreferencia = await pool.query('select * from codreferencia where codrefid = ?', [id]);
    res.render('codreferencia/modificar', { codreferencia })
})

router.post('/modificar/:id', isLoggedIn, async (req, res) => {
    const { codrefcodigo, codrefdescripcion, codrefexplicacion } = req.body;
    const codreffechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const id = req.params.id;
    const user = req.user;

    try {
        const codreferencia = await pool.query('update codreferencia set codrefcodigo = ?, codrefdescripcion = ?, codrefexplicacion = ?, codrefusrmodid = ?, codreffechamod = ? where codrefid = ?', [codrefcodigo, codrefdescripcion, codrefexplicacion, user.usuarioid, codreffechamod, id]);
        req.flash('success', 'Codigo de Referencia Modificado.')
        res.redirect('/codreferencia');
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'codrefcodigo\' at row 1') {
            console.log('wtff????????????????????')
            req.flash('message', 'Codigo muy extenso. Limite de 10 caracteres')
            res.redirect(`/codreferencia/modificar/${id}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'codrefdescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect(`/codreferencia/modificar/${id}`)
        }
    }
})

router.get('/eliminar/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;

    try {
        const codreferencia = await pool.query('delete from codreferencia where codrefid = ?', [id]);
        req.flash('success', 'Codigo de Referencia Eliminado.')
        res.redirect('/codreferencia')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        req.flash('message', 'Accion Invalida. Codigo de Referencia esta vinculado a Catalogo de Bases')
        res.redirect('/codreferencia')
    }
})

module.exports = router;