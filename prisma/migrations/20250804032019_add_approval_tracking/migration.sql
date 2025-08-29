-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "approval1By" TEXT,
ADD COLUMN     "approval1Date" TIMESTAMP(3),
ADD COLUMN     "approval2By" TEXT,
ADD COLUMN     "approval2Date" TIMESTAMP(3),
ADD COLUMN     "modifiedBy" TEXT,
ADD COLUMN     "modifiedDate" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "reviewedDate" TIMESTAMP(3);
