import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      where: {
        approval1By: { not: null },
        approval2By: { not: null },
      },
      select: {
        id: true,
        documentNo: true,
        docType: true,
        docName: true,
        modifiedDate: true,
        approval1By: true,
        approval2By: true,
      },
      orderBy: { modifiedDate: 'desc' }
    })

    return NextResponse.json(docs)
  } catch (error) {
    console.error('Error fetching approved documents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
