-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaterialLot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "lot" TEXT NOT NULL,
    "productionDate" DATETIME NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    CONSTRAINT "MaterialLot_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MaterialLot" ("expirationDate", "id", "lot", "materialId", "productionDate") SELECT "expirationDate", "id", "lot", "materialId", "productionDate" FROM "MaterialLot";
DROP TABLE "MaterialLot";
ALTER TABLE "new_MaterialLot" RENAME TO "MaterialLot";
CREATE UNIQUE INDEX "MaterialLot_materialId_lot_key" ON "MaterialLot"("materialId", "lot");
CREATE TABLE "new_SpecialItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    CONSTRAINT "SpecialItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpecialItem" ("id", "materialId") SELECT "id", "materialId" FROM "SpecialItem";
DROP TABLE "SpecialItem";
ALTER TABLE "new_SpecialItem" RENAME TO "SpecialItem";
CREATE UNIQUE INDEX "SpecialItem_materialId_key" ON "SpecialItem"("materialId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
