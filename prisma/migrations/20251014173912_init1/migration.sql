-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DocumentLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentId" INTEGER NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "materialLotId" INTEGER,
    "movementDirection" TEXT NOT NULL,
    "qty" DECIMAL NOT NULL,
    CONSTRAINT "DocumentLine_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentLine_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DocumentLine_materialLotId_fkey" FOREIGN KEY ("materialLotId") REFERENCES "MaterialLot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DocumentLine" ("documentId", "id", "lineNo", "materialId", "materialLotId", "movementDirection", "qty") SELECT "documentId", "id", "lineNo", "materialId", "materialLotId", "movementDirection", "qty" FROM "DocumentLine";
DROP TABLE "DocumentLine";
ALTER TABLE "new_DocumentLine" RENAME TO "DocumentLine";
CREATE UNIQUE INDEX "DocumentLine_documentId_lineNo_key" ON "DocumentLine"("documentId", "lineNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
