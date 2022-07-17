const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/subcuentas/:id', isLoggedIn, async (req,res) => {
    const catbaseid = req.params.id;
    const info = await pool.query('select * from catalogobase where catbaseid = ?', [catbaseid])
    const subcatalogo = await pool.query('SELECT cc2.*, cb.* FROM catalogobase cb,catalogocuentas2 cc2 WHERE cb.catbaseid = cc2.cc2id AND cc2.cc1id = ?', [catbaseid]);
    
    // console.log('subcatalogo:', subcatalogo)
    
    res.render('estandar/subcuentas/subcuentas', {subcatalogo, catbaseid});
})

router.get('/subcuentas/:id/mas', isLoggedIn, async (req,res) => {
    const catbaseid = req.params.id;
    const coddocid = await pool.query('select distinct coddocid, coddocdescripcion from coddocumento');
    const codrefid = await pool.query('select distinct codrefid, codrefdescripcion from codreferencia');
    const nivel = 2;

    res.render('estandar/subcuentas/mas', {coddocid, codrefid, nivel, catbaseid});
})

router.post('/subcuentas/:id/mas', isLoggedIn, async (req,res) => {
    const cc1id = req.params.id;
    const {catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid } = req.body;
    const user = req.user;
    const catalogo = {
        catbasenivel: 2,
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
    
    // console.log('catalogo:', catalogo)
    // console.log('cc1id:', cc1id);
    // console.log('codrefid:',codrefid)
    // console.log('coddocid:',coddocid)

    const subcuenta = await pool.query('insert into catalogobase set ?', [catalogo]);
    const cc2id = await pool.query('select max(catbaseid) as catbaseid from catalogobase where catbasenivel = 2');
    const id = cc2id[0].catbaseid;
    const catalogocuentas2 = await pool.query('insert into catalogocuentas2 set cc2id = ?, cc1id = ?', [id,cc1id])

    res.redirect(`/estandar/subcuentas/${cc1id}`)
})

router.get('/subcuentas/:id/ver/:id2', isLoggedIn, async (req,res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;

    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre, m.usuarionombre as usuarionombremod, cr.codrefdescripcion, cd.coddocdescripcion, cc2.cc2id, cc2.cc1id from catalogobase cb join usuario u on cb.catbaseusrcreaid = u.usuarioid join usuario m on cb.catbaseusrmodid = m.usuarioid join codreferencia cr on cb.codrefid = cr.codrefid join coddocumento cd on cb.coddocid = cd.coddocid join catalogocuentas2 cc2 on cb.catbaseid = cc2.cc2id where cb.catbaseid = ?', [cc2id]);

    // console.log('catalogo:', catalogo)
    res.render('estandar/subcuentas/ver', {catalogo,cc1id, cc2id});
})

router.get('/subcuentas/:id/modificar/:id2', isLoggedIn, async (req,res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;

    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre, m.usuarionombre as usuarionombremod, cr.codrefdescripcion, cd.coddocdescripcion, cc2.cc2id, cc2.cc1id from catalogobase cb join usuario u on cb.catbaseusrcreaid = u.usuarioid join usuario m on cb.catbaseusrmodid = m.usuarioid join codreferencia cr on cb.codrefid = cr.codrefid join coddocumento cd on cb.coddocid = cd.coddocid join catalogocuentas2 cc2 on cb.catbaseid = cc2.cc2id where cb.catbaseid = ?', [cc2id]);

    const coddocid = await pool.query('select distinct coddocid, coddocdescripcion from coddocumento');
    const codrefid = await pool.query('select distinct codrefid, codrefdescripcion from codreferencia');
    const nivel = 1;

    // console.log('catalogo:', catalogo);
    // console.log('cc1id:', cc1id);
    // console.log('cc2id:', cc2id);

    res.render('estandar/subcuentas/modificar', {catalogo,coddocid,codrefid,nivel,cc1id,cc2id});
})

router.post('/subcuentas/:id/modificar/:id2', isLoggedIn, async (req,res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;

    const {catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid} = req.body;
    const catbasefechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const user = req.user;

    const nuevoCatalogo = await pool.query('update catalogobase set catbasecodigo = ?, catbasedescripcion = ?, catbaseexplicacion = ?, codrefid = ?, coddocid = ?, catbaseusrmodid = ?, catbasefechamod = ? where catbaseid = ?', [catbasecodigo, catbasedescripcion, catbaseexplicacion,codrefid, coddocid, user.usuarioid,catbasefechamod,cc2id])

    res.redirect(`/estandar/subcuentas/${cc1id}`)
})

router.get('/subcuentas/:id/eliminar/:id2', isLoggedIn, async (req,res) => {
    const cc1id = req.params.id;
    const cc2id = req.params.id2;

    console.log('cc1id:', cc1id);
    console.log('cc2id:', cc2id);

    const catalogocuentas2 = await pool.query('delete from catalogocuentas2 where cc2id = ?', [cc2id]) 
    const catalogobase = await pool.query('delete from catalogobase where catbaseid = ?', [cc2id]);
    res.redirect(`/estandar/subcuentas/${cc1id}`)
})


module.exports = router;