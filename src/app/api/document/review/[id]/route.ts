import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mailers'
import { getApproverEmails, getAdminEmails } from '@/lib/getMails'

const prisma = new PrismaClient()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const documentId = parseInt(params.id)
  const body = await req.json()

  const doc = await prisma.document.findUnique({ where: { id: documentId } })
  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  if (doc.reviewedBy && doc.reviewedBy !== body.reviewerUsername) {
    return NextResponse.json({ error: 'Already reviewed by another user' }, { status: 403 })
  }

  if (!doc.reviewedBy) {
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        reviewedBy: body.reviewerUsername,
        reviewedDate: new Date(),
        modifiedBy: body.reviewerUsername,
        modifiedDate: new Date(),
      }
    })

    try {
      const approverEmails = await getApproverEmails()
      const adminEmails = await getAdminEmails()

      await sendEmail(
        approverEmails.join(', '),
        `Approval Needed: ${doc.docName}`,
        `<p>Dear Approver,</p>
        <p>The document <strong>${doc.docName}</strong> has been reviewed.</p>
        <p>Please proceed to approval at: <a href="${process.env.BASE_URL}/dashboard/approver">Approval Page</a></p>
        <p><small>This is an automated message from the system.</small></p>`
      )

      await sendEmail(
        adminEmails.join(', '),
        `Document Reviewed: ${doc.docName}`,
        `<p>Document <strong>${doc.docName}</strong> has been reviewed by ${body.reviewerUsername}.</p>`
      )
    } catch (err) {
      console.error('Error sending email to approver:', err)
    }

    return NextResponse.json(updated)
  }

  return NextResponse.json(doc)
}
