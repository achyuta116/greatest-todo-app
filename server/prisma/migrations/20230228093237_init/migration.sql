-- CreateEnum
CREATE TYPE "State" AS ENUM ('INCOMPLETE', 'COMPLETE', 'INPROGRESS');

-- CreateTable
CREATE TABLE "TodoItem" (
    "id" SERIAL NOT NULL,
    "desc" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'INCOMPLETE',

    CONSTRAINT "TodoItem_pkey" PRIMARY KEY ("id")
);
