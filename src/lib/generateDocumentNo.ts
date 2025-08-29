import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export async function generateDocumentNo() {
  const now = dayjs();
  const prefix = `DOC${now.format("YYMM")}`;

  const latest = await prisma.document.findFirst({
    where: {
      documentNo: { startsWith: prefix },
    },
    orderBy: { id: "desc" },
  });

  let counter = 1;
  if (latest) {
    const lastNo = parseInt(latest.documentNo.slice(-5), 10);
    counter = lastNo + 1;
  }

  const padded = counter.toString().padStart(5, "0");
  return `${prefix}${padded}`;
}
