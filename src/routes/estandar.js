const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/', isLoggedIn, async (req, res) => {

    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre from catalogobase cb join usuario u on cb.catbaseusrcreaid = u.usuarioid where catbasenivel = 1 order by catbasecodigo');

    res.render('estandar/estandar', { catalogo })
})

router.get('/mas', isLoggedIn, async (req, res) => {
    const coddocid = await pool.query('select distinct coddocid, coddocdescripcion from coddocumento');
    const codrefid = await pool.query('select distinct codrefid, codrefdescripcion from codreferencia');
    const nivel = 1;

    res.render('estandar/mas', { coddocid, codrefid, nivel })
})

router.post('/mas', isLoggedIn, async (req, res) => {
    const { catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid } = req.body;
    const user = req.user;
    const catalogo = {
        catbasenivel: 1,
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

    console.log('codrefid:', codrefid)
    console.log('coddocid:', coddocid)

    try {
        const newCatalogo = await pool.query('insert into catalogobase set ?', [catalogo]);
        const catbaseid = await pool.query('select max(catbaseid) as catbaseid from catalogobase');
        const id = catbaseid[0].catbaseid;
        const catalogocuentas1 = await pool.query('insert into catalogocuentas1 set cc1id = ?', [id])
        req.flash('success', 'Codigo de Documento Creado.')
        res.redirect('/estandar');
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasecodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 20 caracteres')
            res.redirect('/estandar/mas')
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasedescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect('/estandar/mas')
        }
    }
})

router.get('/modificar/:id', isLoggedIn, async (req, res) => {
    const catbaseid = req.params.id;
    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, c.codrefdescripcion, d.coddocdescripcion from catalogobase cb join codreferencia c on cb.codrefid = c.codrefid join coddocumento d on cb.coddocid = d.coddocid where catbaseid = ?', [catbaseid]);

    const coddocid = await pool.query('select distinct coddocid, coddocdescripcion from coddocumento');
    const codrefid = await pool.query('select distinct codrefid, codrefdescripcion from codreferencia');
    const nivel = 1;

    res.render('estandar/modificar', { catalogo, coddocid, codrefid, nivel })
})

router.post('/modificar/:id', isLoggedIn, async (req, res) => {
    const catbaseid = req.params.id;
    const { catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid } = req.body;
    const catbasefechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const user = req.user;

    try {
        const nuevoCatalogo = await pool.query('update catalogobase set catbasecodigo = ?, catbasedescripcion = ?, catbaseexplicacion = ?, codrefid = ?, coddocid = ?, catbaseusrmodid = ?, catbasefechamod = ? where catbaseid = ?', [catbasecodigo, catbasedescripcion, catbaseexplicacion, codrefid, coddocid, user.usuarioid, catbasefechamod, catbaseid])
        req.flash('success', 'Catalogo de Cuenta Modificado.')
        res.redirect('/estandar')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasecodigo\' at row 1') {
            req.flash('message', 'Codigo muy extenso. Limite de 20 caracteres')
            res.redirect(`/estandar/modificar/${catbaseid}`)
        }
        if (error.message === 'ER_DATA_TOO_LONG: Data too long for column \'catbasedescripcion\' at row 1') {
            req.flash('message', 'Descripcion muy extensa. Limite de 120 caracteres')
            res.redirect(`/estandar/modificar/${catbaseid}`)
        }
    }
    
})

router.get('/ver/:id', isLoggedIn, async (req, res) => {
    const catbaseid = req.params.id;

    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre, m.usuarionombre as usuarionombremod, cr.codrefdescripcion, cd.coddocdescripcion  from catalogobase cb join usuario u on cb.catbaseusrcreaid = u.usuarioid join usuario m on cb.catbaseusrmodid = m.usuarioid join codreferencia cr on cb.codrefid = cr.codrefid join coddocumento cd on cb.coddocid = cd.coddocid where cb.catbaseid = ?', [catbaseid]);

    res.render('estandar/ver', { catalogo })
})

router.get('/eliminar/:id', isLoggedIn, async (req, res) => {
    const catbaseid = req.params.id;

    try {
        const catalogocuentas1 = await pool.query('delete from catalogocuentas1 where cc1id = ?', [catbaseid])
        const catalogo = await pool.query('delete from catalogobase where catbaseid = ?', [catbaseid]);
        req.flash('success', 'Catalogo de Cuenta Eliminado.')
        res.redirect('/estandar')
    } catch (error) {
        console.log(`\n----------------------ERROR-----------------------\n ${error.message} \n`);
        req.flash('message', 'Accion Invalida. Catalogo de Cuenta Nivel Superior esta vinculado a Catalogo de Bases Nivel Medio y/o Nivel Posteable')
        res.redirect('/estandar')
    }
})

module.exports = router;