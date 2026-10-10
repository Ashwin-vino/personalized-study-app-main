const fs = require('fs');
const PDFDocument = require('pdfkit');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('PRD.pdf'));

const text = fs.readFileSync('PRD.md', 'utf8');

doc.fontSize(20).text('Product Requirements Document (PRD)', { align: 'center' });
doc.moveDown();

const lines = text.split('\n');

for (let line of lines) {
    if (line.startsWith('# ')) {
        doc.fontSize(24).font('Helvetica-Bold').text(line.replace('# ', ''));
    } else if (line.startsWith('## ')) {
        doc.fontSize(20).font('Helvetica-Bold').text(line.replace('## ', ''));
    } else if (line.startsWith('### ')) {
        doc.fontSize(16).font('Helvetica-Bold').text(line.replace('### ', ''));
    } else if (line.startsWith('#### ')) {
        doc.fontSize(14).font('Helvetica-Bold').text(line.replace('#### ', ''));
    } else if (line.startsWith('- ')) {
        doc.fontSize(12).font('Helvetica').text('  • ' + line.replace('- ', ''));
    } else if (line.trim() !== '') {
        // Handle bold markdown roughly
        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '$1'); 
        doc.fontSize(12).font('Helvetica').text(formattedLine);
    }
    
    if (line.trim() === '' || line.startsWith('#')) {
        doc.moveDown(0.5);
    }
}

doc.end();
console.log('PDF generated successfully');
