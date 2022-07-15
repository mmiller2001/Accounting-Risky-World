const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/subcuentas/:id', isLoggedIn, async (req,res) => {
    const catbaseid = req.params.id;
    const info = await pool.query('select * from catalogobase where catbaseid = ?', [catbaseid])
    const subcatalogo = await pool.query('SELECT cc2.*, cb.* FROM catalogobase cb,catalogocuentas2 cc2 WHERE cb.catbaseid = cc2.cc2id AND cc2.cc1id = ?', [catbaseid]);
    // console.log('info:',info)
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
    
    console.log('catalogo:', catalogo)
    console.log('cc1id:', cc1id);
    console.log('codrefid:',codrefid)
    console.log('coddocid:',coddocid)

    const subcuenta = await pool.query('insert into catalogobase set ?', [catalogo]);
    const cc2id = await pool.query('select max(catbaseid) as catbaseid from catalogobase where catbasenivel = 2');
    const id = cc2id[0].catbaseid;
    const catalogocuentas2 = await pool.query('insert into catalogocuentas2 set cc2id = ?, cc1id = ?', [id,cc1id])

    res.redirect('/estandar/subcuentas/5/mas')
})

module.exports = router;