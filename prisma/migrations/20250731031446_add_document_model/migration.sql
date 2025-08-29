-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "documentNo" TEXT NOT NULL,
    "isoType" TEXT,
    "requestFrom" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "docName" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "attachmentPath" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_documentNo_key" ON "Document"("documentNo");
