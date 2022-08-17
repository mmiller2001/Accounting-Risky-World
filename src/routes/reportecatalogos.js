const pool = require('../database');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const moment = require('moment');

//const PDFDocument = require('pdfkit');

//PDF
//const pdfService = require('../service/pdf-service')
const PDFDocument = require('../service/pdfkit-tables')
// const doc = new PDFDocument();

router.get('/', isLoggedIn, async (req, res, next) => {
    const catalogo = await pool.query('select cb.catbaseid, cb.catbasenivel, cb.catbasecodigo, cb.catbasedescripcion, cb.catbaseexplicacion, cb.codrefid, cb.coddocid, cb.catbaseusrcreaid, cb.catbasefechacrea, cb.catbaseusrmodid, cb.catbasefechamod, u.usuarionombre, cd.coddoccodigo, cr.codrefcodigo from catalogobase cb join coddocumento cd on cb.coddocid = cd.coddocid join codreferencia cr on cb.codrefid = cr.codrefid join usuario u on cb.catbaseusrcreaid = u.usuarioid order by catbasecodigo');

    console.log(catalogo)

    const table = {
        headers: ['Catbase ID', 'Catbase Nivel', 'Catbase Codigo', 'Catbase Descripcion', 'Catbase Explicacion', 'Codrefid', 'Coddocid'],
        rows: []
    };

    catalogo.forEach(element => {
        table.rows.push([element.catbaseid, element.catbasenivel, element.catbasecodigo, element.catbasedescripcion, element.catbaseexplicacion, element.codrefcodigo, element.coddoccodigo])
    })

    function buildPDF(dataCallback,endCallback) {
        const doc = new PDFDocument();
        doc.on('data', dataCallback);
        doc.on('end', endCallback);
        doc.fontSize(15).text('Catalogo de Cuentas')

        doc.moveDown().table(table, 10, 125, { width: 590 });
        
        doc.end();
    }

    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=Catalogos_de_Cuenta.pdf'
    })

    buildPDF(
        (chunk) => stream.write(chunk),
        () => stream.end()
    );
})

module.exports = router;