const PDFDocument = require('pdfkit');

function buildPDF(dataCallback,endCallback) {
    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    //doc.fontSize(15).text('Catalogo de Cuentas')
    
    doc.end();
}

module.exports = {buildPDF}