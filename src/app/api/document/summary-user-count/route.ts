import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email } = await req.json() 

    const result = await prisma.document.groupBy({
      by: ['docType'],
      where: {
        status: 'submit',
        createdBy: email,
      },
      _count: { docType: true },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
