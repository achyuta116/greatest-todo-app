/*
  Warnings:

  - The values [INPROGRESS] on the enum `State` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "State_new" AS ENUM ('INCOMPLETE', 'COMPLETE', 'IN_PROGRESS');
ALTER TABLE "TodoItem" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "TodoItem" ALTER COLUMN "state" TYPE "State_new" USING ("state"::text::"State_new");
ALTER TYPE "State" RENAME TO "State_old";
ALTER TYPE "State_new" RENAME TO "State";
DROP TYPE "State_old";
ALTER TABLE "TodoItem" ALTER COLUMN "state" SET DEFAULT 'INCOMPLETE';
COMMIT;
