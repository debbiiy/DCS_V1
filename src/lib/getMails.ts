import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

export async function getReviewerEmails(): Promise<string[]> {
  const reviewers = await prisma.user.findMany({
    where: { role: Role.REVIEWER },
    select: { email: true },
  })
  return reviewers.map(r => r.email)
}

export async function getApproverEmails(): Promise<string[]> {
  const approvers = await prisma.user.findMany({
    where: { role: Role.APPROVER },
    select: { email: true },
  })
  return approvers.map(a => a.email)
}

export async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { email: true },
  })
  return admins.map(a => a.email)
}
