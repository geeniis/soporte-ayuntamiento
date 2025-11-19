CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Comment" (
  id SERIAL PRIMARY KEY,
  contenido TEXT NOT NULL,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ticketId" INTEGER NOT NULL,
  "authorId" INTEGER,
  CONSTRAINT fk_ticket_comment FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE,
  CONSTRAINT fk_author_comment FOREIGN KEY ("authorId") REFERENCES "User"(id) ON DELETE SET NULL
);

ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "authorId" INTEGER;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "assignedToId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ticket_author') THEN
    ALTER TABLE "Ticket" ADD CONSTRAINT fk_ticket_author FOREIGN KEY ("authorId") REFERENCES "User"(id) ON DELETE SET NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ticket_assigned') THEN
    ALTER TABLE "Ticket" ADD CONSTRAINT fk_ticket_assigned FOREIGN KEY ("assignedToId") REFERENCES "User"(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Ensure enum type Status exists and convert Ticket.estado to enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Status') THEN
    CREATE TYPE "Status" AS ENUM ('pendiente','en_progreso','resuelto','cerrado');
  END IF;
END
$$;

DO $$
BEGIN
  -- Change column type if it's still TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='Ticket' AND column_name='estado' AND data_type='text'
  ) THEN
    ALTER TABLE "Ticket" ALTER COLUMN "estado" TYPE "Status" USING ("estado"::"Status");
  END IF;
END
$$;
