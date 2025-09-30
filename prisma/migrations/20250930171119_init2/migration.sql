-- CreateTable
CREATE TABLE "RecipeLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recipeId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "qty" DECIMAL NOT NULL,
    CONSTRAINT "RecipeLine_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecipeLine_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RecipeLine_materialId_idx" ON "RecipeLine"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeLine_recipeId_materialId_key" ON "RecipeLine"("recipeId", "materialId");
