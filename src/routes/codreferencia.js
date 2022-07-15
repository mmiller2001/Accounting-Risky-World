const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/', isLoggedIn, async (req,res) => {
    const codreferencia = await pool.query('select * from codreferencia');
    res.render('codreferencia/codreferencia', {codreferencia});
})

router.get('/mas', isLoggedIn, async (req,res) => {
    res.render('codreferencia/mas');
})

router.post('/mas', isLoggedIn, async (req,res) => {
    const {codrefcodigo,codrefdescripcion, codrefexplicacion } = req.body;
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

    const codreferencia = await pool.query('insert into codreferencia set ?', [nuevoCodReferencia]);
    res.redirect('/codreferencia')
})

router.get('/ver/:id', isLoggedIn, async (req,res) => {
    const codrefid = req.params.id;
    const query = 'select cr.codrefid, cr.codrefcodigo, cr.codrefdescripcion, cr.codrefexplicacion, cr.codrefusrcreaid, cr.codreffechacrea, cr.codrefusrmodid, cr.codreffechamod, u.usuarionombre, m.usuarionombre as usuarionombremod from codreferencia cr join usuario u on cr.codrefusrcreaid = u.usuarioid join usuario m on cr.codrefusrmodid = m.usuarioid where cr.codrefid = ?';

    const codreferencia = await pool.query(query, [codrefid])

    console.log(codreferencia)
    res.render('codreferencia/ver', {codreferencia});
})

router.get('/modificar/:id', isLoggedIn, async (req,res) => {
    const id = req.params.id;
    const codreferencia = await pool.query('select * from codreferencia where codrefid = ?', [id]);
    res.render('codreferencia/modificar', {codreferencia})
})

router.post('/modificar/:id', isLoggedIn, async (req,res) => {
    const {codrefcodigo,codrefdescripcion, codrefexplicacion } = req.body;
    const codreffechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const id = req.params.id;
    const user = req.user;

    const codreferencia = await pool.query('update codreferencia set codrefcodigo = ?, codrefdescripcion = ?, codrefexplicacion = ?, codrefusrmodid = ?, codreffechamod = ? where codrefid = ?', [codrefcodigo,codrefdescripcion, codrefexplicacion,user.usuarioid,codreffechamod,id]);
    res.redirect('/codreferencia');
})

router.get('/eliminar/:id', isLoggedIn, async (req,res) => {
    const id = req.params.id;
    const codreferencia = await pool.query('delete from codreferencia where codrefid = ?', [id]); 
    res.redirect('/codreferencia')
})

module.exports = router;