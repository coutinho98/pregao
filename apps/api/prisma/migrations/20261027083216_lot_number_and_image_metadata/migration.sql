-- AlterTable
ALTER TABLE "item_snapshots" ADD COLUMN     "altText" TEXT,
ADD COLUMN     "imageHeight" INTEGER,
ADD COLUMN     "imageWidth" INTEGER;

-- AlterTable
ALTER TABLE "lots" ADD COLUMN     "number" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "lots_number_key" ON "lots"("number");
