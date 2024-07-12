-- CreateEnum
CREATE TYPE "WALLET_TYPE" AS ENUM ('USER', 'MERCHANT');

-- CreateTable
CREATE TABLE "wallet" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cnpj" TEXT,
    "password" TEXT NOT NULL,
    "balance" DECIMAL(9,2) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updadated_at" TIMESTAMP(3) NOT NULL,
    "wallet_type_id" TEXT NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_type" (
    "id" TEXT NOT NULL,
    "description" "WALLET_TYPE" NOT NULL DEFAULT 'USER',

    CONSTRAINT "wallet_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_email_key" ON "wallet"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_cpf_key" ON "wallet"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_cnpj_key" ON "wallet"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_type_id_description_key" ON "wallet_type"("id", "description");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_wallet_type_id_fkey" FOREIGN KEY ("wallet_type_id") REFERENCES "wallet_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;
