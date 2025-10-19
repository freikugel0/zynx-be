-- CreateTable
CREATE TABLE "Personal" (
    "id" SERIAL NOT NULL,
    "jobTitle" TEXT,
    "bio" TEXT,
    "company" TEXT,
    "role" TEXT,
    "socialLinks" JSONB,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Personal_userId_key" ON "Personal"("userId");

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
