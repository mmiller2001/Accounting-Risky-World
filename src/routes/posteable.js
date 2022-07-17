const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/subcuentas/:id/posteable/:id2', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;

    const subcatalogo = await pool.query('SELECT cc3.cc3id, cc3.cc2id, cc2.cc1id, cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre FROM catalogobase cb,catalogocuentas3 cc3, usuario u join catalogocuentas2 cc2 on cc2.cc2id = ? WHERE cb.catbaseid = cc3.cc3id AND cb.catbaseusrcreaid = u.usuarioid and cc3.cc2id = ?', [cc2id, cc2id]);
    // console.log(subcatalogo)

    res.render('estandar/subcuentas/posteable/posteable', { cc1id, cc2id, subcatalogo })
})

router.get('/subcuentas/:id/posteable/:id2/mas', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;

    // console.log('cc1id:', cc1id);
    // console.log('cc2id:', cc2id);

    const coddocid = await pool.query('select distinct coddocid, coddocdescripcion from coddocumento');
    const codrefid = await pool.query('select distinct codrefid, codrefdescripcion from codreferencia');
    const nivel = 3;

    res.render('estandar/subcuentas/posteable/mas', { cc1id, cc2id, coddocid, codrefid, nivel })
})

router.post('/subcuentas/:id/posteable/:id2/mas', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;
    const { catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid } = req.body;
    const user = req.user;
    const catalogo = {
        catbasenivel: 3,
        catbasecodigo: catbasecodigo,
        catbasedescripcion: catbasedescripcion,
        catbaseexplicacion: catbaseexplicacion,
        codrefid: codrefid,
        coddocid: coddocid,
        catbaseusrcreaid: user.usuarioid,
        catbasefechacrea: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        catbaseusrmodid: user.usuarioid,
        catbasefechamod: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };

    // console.log('catalogo:',catalogo)
    // console.log('cc1id:',cc1id);
    // console.log('cc2id:',cc2id);

    try {
        const subcuenta = await pool.query('insert into catalogobase set ?', [catalogo]);
        const nuevoCatalogo = await pool.query('select max(catbaseid) as catbaseid from catalogobase where catbasenivel = 3');
        const cc3id = nuevoCatalogo[0].catbaseid;
        const catalogocuentas3 = await pool.query('insert into catalogocuentas3 set cc3id = ?, cc2id = ?', [cc3id, cc2id])
        req.flash('success', 'Catalogo de Cuenta Creado.')
        res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}`)
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasecodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 20 caracteres')
            res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}/mas`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasedescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}/mas`)
        }
    }
})

router.get('/subcuentas/:id/posteable/:id2/ver/:id3', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;
    const cc3id = req.params.id3;

    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre, m.usuarionombre as usuarionombremod, cr.codrefdescripcion, cd.coddocdescripcion, cc3.cc3id, cc3.cc2id, cc2.cc1id from catalogobase cb join usuario u on cb.catbaseusrcreaid = u.usuarioid join usuario m on cb.catbaseusrmodid = m.usuarioid join codreferencia cr on cb.codrefid = cr.codrefid join coddocumento cd on cb.coddocid = cd.coddocid join catalogocuentas2 cc2 on cc2.cc2id = ? join catalogocuentas3 cc3 on cb.catbaseid = cc3.cc3id where cb.catbaseid = ?', [cc2id, cc3id]);

    // console.log('cc1id:', cc1id);
    // console.log('cc2id:', cc2id);
    // console.log('cc3id:', cc3id);
    // console.log(catalogo)

    res.render('estandar/subcuentas/posteable/ver', { cc1id, cc2id, cc3id, catalogo })
})

router.get('/subcuentas/:id/posteable/:id2/modificar/:id3', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;
    const cc3id = req.params.id3;

    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre, m.usuarionombre as usuarionombremod, cr.codrefdescripcion, cd.coddocdescripcion, cc3.cc3id, cc3.cc2id, cc2.cc1id from catalogobase cb join usuario u on cb.catbaseusrcreaid = u.usuarioid join usuario m on cb.catbaseusrmodid = m.usuarioid join codreferencia cr on cb.codrefid = cr.codrefid join coddocumento cd on cb.coddocid = cd.coddocid join catalogocuentas2 cc2 on cc2.cc2id = ? join catalogocuentas3 cc3 on cb.catbaseid = cc3.cc3id where cb.catbaseid = ?', [cc2id, cc3id]);

    const coddocid = await pool.query('select distinct coddocid, coddocdescripcion from coddocumento');
    const codrefid = await pool.query('select distinct codrefid, codrefdescripcion from codreferencia');
    const nivel = 3;

    res.render('estandar/subcuentas/posteable/modificar', { cc1id, cc2id, cc3id, catalogo, coddocid, codrefid, nivel })
})

router.post('/subcuentas/:id/posteable/:id2/modificar/:id3', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;
    const cc3id = req.params.id3;

    const { catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid } = req.body;
    const catbasefechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const user = req.user;

    try {
        const nuevoCatalogo = await pool.query('update catalogobase set catbasecodigo = ?, catbasedescripcion = ?, catbaseexplicacion = ?, codrefid = ?, coddocid = ?, catbaseusrmodid = ?, catbasefechamod = ? where catbaseid = ?', [catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid, user.usuarioid, catbasefechamod, cc3id])
        req.flash('success', 'Catalogo de Cuenta Modificado.')
        res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}`)
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasecodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 20 caracteres')
            res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}/modificar/${cc3id}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasedescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}/modificar/${cc3id}`)
        }
    }


})

router.get('/subcuentas/:id/posteable/:id2/eliminar/:id3', isLoggedIn, async (req, res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;
    const cc3id = req.params.id3;

    try {
        const catalogocuentas2 = await pool.query('delete from catalogocuentas3 where cc3id = ?', [cc3id]);
        const catalogobase = await pool.query('delete from catalogobase where catbaseid = ?', [cc3id]);
        req.flash('success', 'Catalogo de Cuenta Eliminado.')
        res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}`)
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        req.flash('message', 'Accion Invalida. Catalogo de Cuenta Nivel Posteable no se puede eliminar.')
        res.redirect(`/estandar/subcuentas/${cc1id}/posteable/${cc2id}`)
    }
})

module.exports = router;