import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.formData()
  const file = data.get("file")
  const retainFile = data.get("retainFile") === 'true'
  const documentId = parseInt(params.id)

  let filePath = ''
  if (!retainFile && file && typeof file === "object" && "arrayBuffer" in file) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${data.get('documentNo')}_${file.name}`
    const uploadPath = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true })
    fs.writeFileSync(path.join(uploadPath, fileName), buffer)
    filePath = `/uploads/${fileName}`
  }

  const updatePayload: any = {
    isoType: data.get("isoType")?.toString(),
    docType: data.get("docType") as string,
    docName: data.get("docName") as string,
    objective: data.get("objective") as string,
    status: data.get("status") as string,
    requestFrom: data.get("requestFrom") as string,
    dept: data.get("dept") as string,
  }

  if (!retainFile) updatePayload.attachmentPath = filePath

  updatePayload.modifiedBy = data.get("modifiedBy")?.toString()
  updatePayload.modifiedDate = new Date(data.get("modifiedDate")?.toString() || new Date())

  const result = await prisma.document.update({
    where: { id: documentId },
    data: updatePayload,
  })

  console.log("Updating doc ID:", documentId, updatePayload)
  return NextResponse.json(result)
}
