const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {
    const coddocumento = await pool.query('select cd.coddocid, cd.coddoccodigo, cd.coddocdescripcion, cd.coddocexplicacion, cd.coddocusrcreaid, cd.coddocfechacrea, cd.coddocusrmodid, cd.coddocfechamod, u.usuarionombre from coddocumento cd join usuario u on cd.coddocusrcreaid = u.usuarioid order by cd.coddoccodigo');
    // console.log(coddocumento)
    res.render('coddocumento/coddocumento', { coddocumento })
})

router.get('/mas', isLoggedIn, async (req, res) => {
    res.render('coddocumento/mas')
})

router.post('/mas', isLoggedIn, async (req, res) => {
    const { coddoccodigo, coddocdescripcion, coddocexplicacion } = req.body;
    const user = req.user;
    const nuevoCodDocumento = {
        coddoccodigo: coddoccodigo,
        coddocdescripcion: coddocdescripcion,
        coddocexplicacion: coddocexplicacion,
        coddocusrcreaid: user.usuarioid,
        coddocfechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        coddocusrmodid: user.usuarioid,
        coddocfechamod: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    try {
        const coddocumento = await pool.query('insert into coddocumento set ?', [nuevoCodDocumento]);
        req.flash('success', 'Codigo de Documento Creado.')
        res.redirect('/coddocumento')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'coddoccodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 5 caracteres')
            res.redirect('/coddocumento/mas')
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'coddocdescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect('/coddocumento/mas')
        }
    }

})

router.get('/ver/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const coddocumento = await pool.query('select cd.coddocid, cd.coddoccodigo, cd.coddocdescripcion, cd.coddocexplicacion, cd.coddocusrcreaid, cd.coddocfechacrea, cd.coddocusrmodid, cd.coddocfechamod, u.usuarionombre, m.usuarionombre as usuarionombremod from coddocumento cd join usuario u on cd.coddocusrcreaid = u.usuarioid join usuario m on cd.coddocusrmodid = m.usuarioid where cd.coddocid = ?', [id]);

    res.render('coddocumento/ver', { coddocumento });
})

router.get('/modificar/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const coddocumento = await pool.query('select * from coddocumento where coddocid = ?', [id]);
    res.render('coddocumento/modificar', { coddocumento });
})

router.post('/modificar/:id', isLoggedIn, async (req, res) => {
    const { coddoccodigo, coddocdescripcion, coddocexplicacion } = req.body;
    const coddocfechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const coddocid = req.params.id;
    const user = req.user;

    try {
        const coddocumento = await pool.query('update coddocumento set coddoccodigo = ?, coddocdescripcion = ?, coddocexplicacion = ?, coddocusrmodid = ?, coddocfechamod = ? where coddocid = ?', [coddoccodigo, coddocdescripcion, coddocexplicacion, user.usuarioid, coddocfechamod, coddocid]);
        req.flash('success', 'Codigo de Documento Modificado.')
        res.redirect('/coddocumento')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'coddoccodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 5 caracteres')
            res.redirect(`/coddocumento/modificar/${coddocid}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'coddocdescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect(`/coddocumento/modificar/${coddocid}`)
        }
    }
})

router.get('/eliminar/:id', isLoggedIn, async (req, res) => {
    const id = req.params.id;

    try {
        const coddocumento = await pool.query('delete from coddocumento where coddocid = ?', [id]);
        req.flash('success', 'Codigo de Referencia Eliminado.')
        res.redirect('/coddocumento')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        req.flash('message', 'Accion Invalida. Codigo de Documento esta vinculado a Catalogo de Bases')
        res.redirect('/coddocumento')
    }

})

module.exports = router;