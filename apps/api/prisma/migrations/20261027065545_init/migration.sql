-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AUCTIONEER', 'BIDDER');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'SETTLED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DEPOSIT', 'HOLD', 'RELEASE', 'DEBIT', 'CREDIT', 'REFUND');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "totalCents" BIGINT NOT NULL DEFAULT 0,
    "committedCents" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_ledger" (
    "id" UUID NOT NULL,
    "walletId" UUID NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "totalAfterCents" BIGINT NOT NULL,
    "committedAfterCents" BIGINT NOT NULL,
    "lotId" UUID,
    "bidId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_snapshots" (
    "id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "dateDisplay" TEXT,
    "medium" TEXT,
    "dimensions" TEXT,
    "placeOfOrigin" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_images" (
    "id" UUID NOT NULL,
    "snapshotId" UUID NOT NULL,
    "imageMime" TEXT NOT NULL,
    "imageBytes" BYTEA NOT NULL,
    "thumbBytes" BYTEA NOT NULL,

    CONSTRAINT "item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" UUID NOT NULL,
    "auctioneerId" UUID NOT NULL,
    "itemSnapshotId" UUID NOT NULL,
    "startingPriceCents" BIGINT NOT NULL,
    "minIncrementCents" BIGINT NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "originalEndsAt" TIMESTAMPTZ(3) NOT NULL,
    "status" "LotStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentBidCents" BIGINT,
    "leaderId" UUID,
    "bidCount" INTEGER NOT NULL DEFAULT 0,
    "genesisHash" TEXT NOT NULL,
    "lastHash" TEXT NOT NULL,
    "headSignature" TEXT NOT NULL,
    "settledAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" UUID NOT NULL,
    "lotId" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "bidderId" UUID NOT NULL,
    "bidderPseudonym" TEXT NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "lotId" UUID NOT NULL,
    "winnerId" UUID NOT NULL,
    "winnerPseudonym" TEXT NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "bidCount" INTEGER NOT NULL,
    "finalHash" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "wallet_ledger_walletId_createdAt_idx" ON "wallet_ledger"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "wallet_ledger_lotId_idx" ON "wallet_ledger"("lotId");

-- CreateIndex
CREATE INDEX "item_snapshots_source_externalId_idx" ON "item_snapshots"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "item_images_snapshotId_key" ON "item_images"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "lots_itemSnapshotId_key" ON "lots"("itemSnapshotId");

-- CreateIndex
CREATE INDEX "lots_status_startsAt_idx" ON "lots"("status", "startsAt");

-- CreateIndex
CREATE INDEX "lots_status_endsAt_idx" ON "lots"("status", "endsAt");

-- CreateIndex
CREATE INDEX "lots_auctioneerId_createdAt_idx" ON "lots"("auctioneerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "bids_hash_key" ON "bids"("hash");

-- CreateIndex
CREATE INDEX "bids_bidderId_lotId_idx" ON "bids"("bidderId", "lotId");

-- CreateIndex
CREATE UNIQUE INDEX "bids_lotId_seq_key" ON "bids"("lotId", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_lotId_key" ON "receipts"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_publicToken_key" ON "receipts"("publicToken");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_ledger" ADD CONSTRAINT "wallet_ledger_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "bids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_images" ADD CONSTRAINT "item_images_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "item_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_auctioneerId_fkey" FOREIGN KEY ("auctioneerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_itemSnapshotId_fkey" FOREIGN KEY ("itemSnapshotId") REFERENCES "item_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Money and sequencing invariants enforced by the database as a last line of defense.
ALTER TABLE "wallets"
  ADD CONSTRAINT "wallets_committed_non_negative" CHECK ("committedCents" >= 0),
  ADD CONSTRAINT "wallets_total_covers_committed" CHECK ("totalCents" >= "committedCents");

ALTER TABLE "wallet_ledger"
  ADD CONSTRAINT "wallet_ledger_amount_positive" CHECK ("amountCents" > 0);

ALTER TABLE "lots"
  ADD CONSTRAINT "lots_ends_after_start" CHECK ("endsAt" > "startsAt"),
  ADD CONSTRAINT "lots_starting_price_positive" CHECK ("startingPriceCents" > 0),
  ADD CONSTRAINT "lots_min_increment_positive" CHECK ("minIncrementCents" > 0),
  ADD CONSTRAINT "lots_bid_count_non_negative" CHECK ("bidCount" >= 0);

ALTER TABLE "bids"
  ADD CONSTRAINT "bids_amount_positive" CHECK ("amountCents" > 0),
  ADD CONSTRAINT "bids_seq_positive" CHECK ("seq" >= 1);
