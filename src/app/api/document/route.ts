import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { sendEmail } from '@/lib/mailers'
import { getReviewerEmails, getAdminEmails } from '@/lib/getMails'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const docs = await prisma.document.findMany({
    where: { createdBy: email },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(docs)
}

export async function POST(req: Request) {
  const data = await req.formData()
  const file = data.get("file")
  const documentNo = data.get("documentNo")?.toString() || ''
  const retainFile = data.get("retainFile") === 'true'

  let filePath = ''
  if (!retainFile && file && typeof file === "object" && "arrayBuffer" in file) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${documentNo}_${file.name}`
    const uploadPath = path.join(process.cwd(), 'public', 'uploads')

    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true })
    fs.writeFileSync(path.join(uploadPath, fileName), buffer)
    filePath = `/uploads/${fileName}`
  }

  const result = await prisma.document.upsert({
    where: { documentNo },
    update: {
      isoType: data.get("isoType")?.toString(),
      docType: data.get("docType") as string,
      docName: data.get("docName") as string,
      objective: data.get("objective") as string,
      attachmentPath: retainFile ? undefined : filePath,
      status: data.get("status") as string,
      requestFrom: data.get("requestFrom") as string,
      dept: data.get("dept") as string,
    },
    create: {
      documentNo,
      isoType: data.get("isoType")?.toString(),
      docType: data.get("docType") as string,
      docName: data.get("docName") as string,
      objective: data.get("objective") as string,
      attachmentPath: filePath,
      status: data.get("status") as string,
      requestFrom: data.get("requestFrom") as string,
      dept: data.get("dept") as string,
      createdBy: data.get("createdBy") as string,
    },
  })

  if (data.get('status') === 'submit') {
    console.log('⏳ Proses kirim email notifikasi ke reviewer dan admin dimulai...')
    try {
      const reviewers = await getReviewerEmails()
      const admins = await getAdminEmails()
    console.log('📧 Reviewer Emails:', reviewers)
    console.log('📧 Admin Emails:', admins)

      await sendEmail(
        reviewers.join(', '),
        `📄 Review Request: ${data.get('docName')}`,
        `<p>Dear Reviewer,</p>
        <p>A new document <strong>${data.get('docName')}</strong> has been submitted by ${data.get('requestFrom')}.</p>
        <p>Please review it here: <a href="${process.env.BASE_URL}/dashboard/reviewer">Reviewer Page</a></p>
        <p><small>This is an automated message from the system.</small></p>`
      )
    console.log('✅ Email berhasil dikirim ke reviewer')
      await sendEmail(
        admins.join(', '),
        `📢 New Document Submitted`,
        `<p>Document <strong>${data.get('docName')}</strong> has been submitted by ${data.get('requestFrom')}.</p>
        <p><small>This is an automated message from the system.</small></p>`
      )
      console.log('✅ Email berhasil dikirim ke admin')
    } catch (error) {
      console.error('Gagal mengirim email notifikasi:', error)
    }
  }

  return NextResponse.json(result)
}
