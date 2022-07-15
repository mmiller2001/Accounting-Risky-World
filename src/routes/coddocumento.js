const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const moment = require('moment');

router.get('/', isLoggedIn, async (req,res) => {
    const coddocumento = await pool.query('select * from coddocumento');
    res.render('coddocumento/coddocumento', {coddocumento})
})

router.get('/mas', isLoggedIn, async (req,res) => {
    res.render('coddocumento/mas')
})

router.post('/mas', isLoggedIn, async(req,res) => {
    const {coddoccodigo,coddocdescripcion, coddocexplicacion } = req.body;
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

    const coddocumento = await pool.query('insert into coddocumento set ?', [nuevoCodDocumento]);
    res.redirect('/coddocumento')
})

router.get('/ver/:id', isLoggedIn, async(req,res) => {
    const id = req.params.id;
    const coddocumento = await pool.query('select cd.coddocid, cd.coddoccodigo, cd.coddocdescripcion, cd.coddocexplicacion, cd.coddocusrcreaid, cd.coddocfechacrea, cd.coddocusrmodid, cd.coddocfechamod, u.usuarionombre, m.usuarionombre as usuarionombremod from coddocumento cd join usuario u on cd.coddocusrcreaid = u.usuarioid join usuario m on cd.coddocusrmodid = m.usuarioid where cd.coddocid = ?', [id]);

    res.render('coddocumento/ver', {coddocumento});
})

router.get('/modificar/:id', isLoggedIn, async(req,res) => {
    const id = req.params.id;
    const coddocumento = await pool.query('select * from coddocumento where coddocid = ?', [id]);
    res.render('coddocumento/modificar', {coddocumento});
})

router.post('/modificar/:id', isLoggedIn, async (req,res) => {
    const {coddoccodigo,coddocdescripcion, coddocexplicacion } = req.body;
    const coddocfechamod = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    const coddocid = req.params.id;
    const user = req.user;

    const coddocumento = await pool.query('update coddocumento set coddoccodigo = ?, coddocdescripcion = ?, coddocexplicacion = ?, coddocusrmodid = ?, coddocfechamod = ? where coddocid = ?', [coddoccodigo,coddocdescripcion, coddocexplicacion,user.usuarioid,coddocfechamod,coddocid]);
    res.redirect('/coddocumento')
})

router.get('/eliminar/:id', isLoggedIn, async (req,res) => {
    const id = req.params.id;
    const coddocumento = await pool.query('delete from coddocumento where coddocid = ?', [id]); 
    res.redirect('/coddocumento')
})

module.exports = router;