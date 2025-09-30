/*
  Warnings:

  - Added the required column `materialId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "series" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "notes" TEXT,
    "documentTypeId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "customerId" INTEGER,
    CONSTRAINT "Document_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("customerId", "date", "documentTypeId", "id", "notes", "number", "series", "supplierId") SELECT "customerId", "date", "documentTypeId", "id", "notes", "number", "series", "supplierId" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE UNIQUE INDEX "Document_series_number_key" ON "Document"("series", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
