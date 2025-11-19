ALTER TABLE "Ticket" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Ticket" ALTER COLUMN "estado" TYPE "Status" USING ("estado"::"Status");
ALTER TABLE "Ticket" ALTER COLUMN "estado" SET DEFAULT 'pendiente';
