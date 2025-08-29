import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const submittedDocs = await prisma.document.findMany({
      where: {
        status: 'submit',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(submittedDocs)
  } catch (error) {
    console.error('Error fetching submitted documents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
