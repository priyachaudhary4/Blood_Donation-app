import jsPDF from 'jspdf';
import { format } from 'date-fns';

const drawStamp = (doc, x, y, color) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setLineWidth(1);

    // Outer Circle
    doc.circle(x, y, 15, 'S');
    // Inner Circle
    doc.circle(x, y, 13, 'S');

    // Text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('LIFELINK', x, y - 4, { align: 'center' });
    doc.text('OFFICIAL', x, y, { align: 'center' });
    doc.text('VERIFIED', x, y + 4, { align: 'center' });

    // Stars
    doc.setFontSize(10);
    doc.text('*', x - 9, y + 2);
    doc.text('*', x + 9, y + 2);
};

const drawSignature = (doc, x, y, name) => {
    doc.setDrawColor(0, 0, 100); // Dark Blue ink
    doc.setLineWidth(0.5);

    // Simulate a signature using curves
    // A simple abstract scribble
    const startX = x - 15;
    const startY = y;

    doc.moveTo(startX, startY);
    doc.curveTo(startX + 10, startY - 10, startX + 20, startY + 5, startX + 30, startY - 5);
    doc.curveTo(startX + 35, startY + 2, startX + 40, startY - 8, startX + 50, startY);
    doc.stroke();

    // Add Typed Name below
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    // doc.text(name, x, y + 5, { align: 'center' }); 
};

export const generateCertificate = (donorName, bloodType, donationDate) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setLineWidth(2);
    doc.setDrawColor(185, 28, 28); // Red-700
    doc.rect(10, 10, 277, 190);

    // Inner Border
    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 38, 38); // Red-600
    doc.rect(15, 15, 267, 180);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(40);
    doc.text('CERTIFICATE OF APPRECIATION', 148.5, 45, { align: 'center' });

    // Subheader
    doc.setFont('times', 'normal');
    doc.setTextColor(55, 65, 81); // Gray-700
    doc.setFontSize(18);
    doc.text('PROUDLY PRESENTED TO', 148.5, 70, { align: 'center' });

    // Donor Name
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(32);
    doc.text(donorName.toUpperCase(), 148.5, 95, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(70, 98, 227, 98); // Underline

    // Body Text
    doc.setFont('times', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(16);
    const text = `For your selfless act of donating blood (${bloodType}) on ${format(new Date(donationDate), 'MMMM dd, yyyy')}.
Your contribution gives the gift of life and hope to those in need.`;
    doc.text(text, 148.5, 120, { align: 'center', maxWidth: 200 });

    // Signature 1: Authorized Signature
    const sig1X = 70;
    const sigY = 160;

    // Draw Signature 1
    drawSignature(doc, sig1X + 10, sigY - 5);
    doc.setDrawColor(100, 100, 100);
    doc.line(sig1X - 20, sigY, sig1X + 40, sigY);
    doc.setFont('times', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text('Authorized Signature', sig1X + 10, sigY + 8, { align: 'center' });

    // Draw Stamp in center bottom/middle
    drawStamp(doc, 148.5, 165, [185, 28, 28]); // Red Stamp

    // Signature 2: BloodLink Director
    const sig2X = 227;
    // Draw Signature 2
    drawSignature(doc, sig2X - 20, sigY - 5);
    doc.setDrawColor(100, 100, 100);
    doc.line(sig2X - 50, sigY, sig2X + 10, sigY);
    doc.text('BloodLink Director', sig2X - 20, sigY + 8, { align: 'center' });

    // Footer
    doc.setFontSize(12);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for being a hero!', 148.5, 195, { align: 'center' });

    // Save
    doc.save(`Certificate_${donorName.replace(/\s+/g, '_')}.pdf`);
};

export const generateRecipientCertificate = (recipientName, donorName, bloodType, date) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setLineWidth(2);
    doc.setDrawColor(22, 163, 74); // Green-600
    doc.rect(10, 10, 277, 190);

    // Inner Border
    doc.setLineWidth(0.5);
    doc.setDrawColor(34, 197, 94); // Green-500
    doc.rect(15, 15, 267, 180);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(40);
    doc.text('CERTIFICATE OF RECEPTION', 148.5, 45, { align: 'center' });

    // Subheader
    doc.setFont('times', 'normal');
    doc.setTextColor(55, 65, 81); // Gray-700
    doc.setFontSize(18);
    doc.text('THIS CERTIFIES THAT', 148.5, 70, { align: 'center' });

    // Recipient Name
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(32);
    doc.text(recipientName.toUpperCase(), 148.5, 95, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(70, 98, 227, 98); // Underline

    // Body Text
    doc.setFont('times', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(16);
    const text = `Has gratefully received a donation of ${bloodType} blood from\n${donorName}\non ${format(new Date(date), 'MMMM dd, yyyy')}.`;
    doc.text(text, 148.5, 120, { align: 'center', maxWidth: 220 });

    // Helping Notes / Quote
    doc.setFont('times', 'italic');
    doc.setTextColor(22, 163, 74); // Greenish
    doc.setFontSize(14);
    doc.text('"Every drop counts. This act of kindness has saved a life."', 148.5, 145, { align: 'center' });

    // Signature 1: Medical Officer
    const sig1X = 70;
    const sigY = 175;

    drawSignature(doc, sig1X + 10, sigY - 5);
    doc.setDrawColor(100, 100, 100);
    doc.line(sig1X - 20, sigY, sig1X + 40, sigY);
    doc.setFont('times', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text('Medical Officer', sig1X + 10, sigY + 8, { align: 'center' });

    // Draw Stamp
    drawStamp(doc, 148.5, 175, [22, 163, 74]); // Green Stamp

    // Signature 2: LifeLink Authority
    const sig2X = 227;
    drawSignature(doc, sig2X - 20, sigY - 5);
    doc.setDrawColor(100, 100, 100);
    doc.line(sig2X - 50, sigY, sig2X + 10, sigY);
    doc.text('LifeLink Authority', sig2X - 20, sigY + 8, { align: 'center' });

    // Save
    doc.save(`Reception_Certificate_${recipientName.replace(/\s+/g, '_')}.pdf`);
};
