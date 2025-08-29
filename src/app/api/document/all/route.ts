import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      select: {
        documentNo: true,
      },
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error('Error fetching all documents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
