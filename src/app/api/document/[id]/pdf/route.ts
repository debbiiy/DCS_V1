import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function fmt(d?: Date | null) {
  if (!d) return '';
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yy = dt.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

function prosesLabel(
  row: 'user' | 'review' | 'appr1' | 'appr2',
  doc: any
) {
  switch (row) {
    case 'user':
      return 'Mengajukan Dokumen';
    case 'review':
      return doc.reviewedBy ? 'Reviewed' : '';
    case 'appr1':
      return doc.approval1By ? 'Approved' : '';
    case 'appr2':
      return doc.approval2By ? 'Approved' : '';
  }
}

async function loadLogo(pdf: PDFDocument) {
  const candidates = ['logo-samudera.png', 'logo.png', 'logo.jpg', 'logo.jpeg'];
  for (const name of candidates) {
    const p = path.join(process.cwd(), 'public', name);
    if (fs.existsSync(p)) {
      const bytes = fs.readFileSync(p);
      return name.endsWith('.png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    }
  }
  return null;
}

async function loadApprovedStamp(pdf: PDFDocument) {
  const candidates = ['approved.png', 'approved.jpg', 'approved.jpeg'];
  for (const name of candidates) {
    const p = path.join(process.cwd(), 'public', name);
    if (fs.existsSync(p)) {
      const bytes = fs.readFileSync(p);
      return name.endsWith('.png') ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    }
  }
  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const docId = Number(id);
  if (Number.isNaN(docId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({ where: { id: docId } });
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const { width } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  const logo = await loadLogo(pdf);

  const lw = 120;
  const lh = logo ? (logo.height / logo.width) * lw : 0;
  if (logo) {
    page.drawImage(logo, { x: 40, y: y - lh, width: lw, height: lh });
  }

  const perusahaan = 'PT Perusahaan Pelayanan Nusantara Panurjwan';
  const namaDokumen = doc.docName || 'Nama Dokumen';

  const companyNameX = 180;
  page.drawText(perusahaan, { x: companyNameX, y: y - 20, size: 10, font });
  page.drawText(namaDokumen, { x: companyNameX, y: y - 36, size: 12, font: fontBold });

  const metaRightX = width - 180;
  page.drawText(`No. Dokumen: ${doc.documentNo || '-'}`, { x: metaRightX, y: y - 10, size: 9, font });
  page.drawText(`Tgl Berlaku: 01 Januari 2024`, { x: metaRightX, y: y - 24, size: 9, font });
  page.drawText(`Rev. Berikutnya: 01 Januari 2027`, { x: metaRightX, y: y - 38, size: 9, font });

  y -= 80;

  const title = 'LEMBAR PENGESAHAN';
  const tw = fontBold.widthOfTextAtSize(title, 14);
  page.drawText(title, { x: (width - tw) / 2, y, size: 14, font: fontBold });

  y -= 24;

  const rowHeight = 56;
  const col = [150, 110, 150, 80, 95];
  const tableWidth = col.reduce((a, b) => a + b, 0);
  const startX = (width - tableWidth) / 2;

  const drawCell = (text: string, x: number, yy: number, w: number, bold = false) => {
    page.drawRectangle({
      x,
      y: yy - rowHeight,
      width: w,
      height: rowHeight,
      borderWidth: 1,
      borderColor: rgb(0.75, 0.75, 0.75),
    });
    const pad = 6;
    page.drawText(text ?? '', {
      x: x + pad,

      y: yy - rowHeight + 12,
      size: 10,
      font: bold ? fontBold : font,
      color: rgb(0, 0, 0),
    });
  };

  let x = startX;
  ;['NAMA', 'JABATAN', 'TANDA TANGAN / STATUS', 'TANGGAL', 'PROSES'].forEach((h, i) => {
    drawCell(h, x, y, col[i], true);
    x += col[i];
  });

  const rows = [
    { 
      nama: doc.requestFrom || 'User',
      jabatan: '',
      approved: false,            
      tanggal: fmt(doc.createdAt),
      proses: prosesLabel('user', doc),
    },
    { 
      nama: doc.reviewedBy || '',
      jabatan: '',
      approved: !!doc.reviewedBy, 
      tanggal: fmt(doc.reviewedDate),
      proses: prosesLabel('review', doc),
    },
    { 
      nama: doc.approval1By || '',
      jabatan: '',
      approved: !!doc.approval1By,
      tanggal: fmt(doc.approval1Date),
      proses: prosesLabel('appr1', doc),
    },
    { 
      nama: doc.approval2By || '',
      jabatan: '',
      approved: !!doc.approval2By,
      tanggal: fmt(doc.approval2Date),
      proses: prosesLabel('appr2', doc),
    },
  ];
  const approvedStamp = await loadApprovedStamp(pdf);

  y -= rowHeight;

  for (const r of rows) {
    x = startX;
    drawCell(r.nama, x, y, col[0]); x += col[0];
    drawCell(r.jabatan, x, y, col[1]); x += col[1];
    drawCell('', x, y, col[2]); 
    if (r.approved && approvedStamp) {
      const maxW = 100;
      const targetW = Math.min(maxW, approvedStamp.width);
      const targetH = (approvedStamp.height / approvedStamp.width) * targetW;
      const cx = x + (col[2] - targetW) / 2;
      const cy = y - rowHeight + (rowHeight - targetH) / 2;
      page.drawImage(approvedStamp, { x: cx, y: cy, width: targetW, height: targetH });
    }
    x += col[2];

    drawCell(r.tanggal, x, y, col[3]); x += col[3];
    drawCell(r.proses, x, y, col[4]); x += col[4];
    y -= rowHeight;
  }

const pdfBytes = await pdf.save();

const ab = pdfBytes.buffer.slice(
  pdfBytes.byteOffset,
  pdfBytes.byteOffset + pdfBytes.byteLength
);

return new NextResponse(ab as ArrayBuffer, {
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="Lembar Pengesahan_${doc.documentNo || 'document'}.pdf"`,
    'Cache-Control': 'no-store',
  },
});
}
