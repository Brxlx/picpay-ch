/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `wallet_type` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "wallet_type_id_description_key";

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(9,2) NOT NULL DEFAULT 0.0,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_type_description_key" ON "wallet_type"("description");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
