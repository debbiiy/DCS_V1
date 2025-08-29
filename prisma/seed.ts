import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  await prisma.user.createMany({
    data: [
      { email: 'admin@samudera.id', username: 'SUPER ADMIN', password, role: 'ADMIN', dept: 'IT' },
      { email: 'user@samudera.id', username: 'user', password, role: 'USER' },
      { email: 'reviewer@samudera.id', username: 'reviewer', password, role: 'REVIEWER' },
      { email: 'approver@samudera.id', username: 'approver', password, role: 'APPROVER' },
      { email: 'approver2@samudera.id', username: 'approver2', password, role: 'APPROVER' },
      { email: 'user2@samudera.id', username: 'user2', password, role: 'USER' },
      { email: 'deborahfransiska4@gmail.com', username: 'Deb', password, role: 'REVIEWER' },
    ],
    
    skipDuplicates: true,
  })
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
