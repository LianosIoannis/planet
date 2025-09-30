-- Suppliers
INSERT INTO
    Supplier (code, name, afm, isActive, createdAt, updatedAt)
VALUES
    (
        'SUP1',
        'Alpha Supplies',
        '100000001',
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'SUP2',
        'Beta Supplies',
        '100000002',
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Customers
INSERT INTO
    Customer (code, name, afm, isActive, createdAt, updatedAt)
VALUES
    (
        'CUST1',
        'Gamma Trading',
        '200000001',
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'CUST2',
        'Delta Retail',
        '200000002',
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- Materials (10 rows)
INSERT INTO
    Material (code, name, createdAt, updatedAt)
VALUES
    (
        'MAT1',
        'Material 1',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT2',
        'Material 2',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT3',
        'Material 3',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT4',
        'Material 4',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT5',
        'Material 5',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT6',
        'Material 6',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT7',
        'Material 7',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT8',
        'Material 8',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT9',
        'Material 9',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),
    (
        'MAT10',
        'Material 10',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

-- SpecialItems (first 2 materials are special)
INSERT INTO
    SpecialItem (materialId)
SELECT
    id
FROM
    Material
WHERE
    code IN ('MAT1', 'MAT2');

-- 1) Create recipe for SpecialItem on MAT1 (only if it doesn't already exist)
INSERT INTO
    Recipe (createdAt, updatedAt, specialItemId)
SELECT
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    si.id
FROM
    SpecialItem si
    JOIN Material m ON m.id = si.materialId
WHERE
    m.code = 'MAT1'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            Recipe r
        WHERE
            r.specialItemId = si.id
    );

-- 2) Add lines MAT3–MAT6 to MAT1's recipe (skip existing pairs)
INSERT INTO
    RecipeLine (recipeId, materialId, qty)
SELECT
    (
        SELECT
            r.id
        FROM
            Recipe r
            JOIN SpecialItem si2 ON si2.id = r.specialItemId
            JOIN Material ms ON ms.id = si2.materialId
        WHERE
            ms.code = 'MAT1'
        ORDER BY
            r.id DESC
        LIMIT
            1
    ) AS recipeId,
    m.id AS materialId,
    1.000 AS qty
FROM
    Material m
WHERE
    m.code IN ('MAT3', 'MAT4', 'MAT5', 'MAT6')
    AND NOT EXISTS (
        SELECT
            1
        FROM
            RecipeLine rl
        WHERE
            rl.recipeId = (
                SELECT
                    r.id
                FROM
                    Recipe r
                    JOIN SpecialItem si2 ON si2.id = r.specialItemId
                    JOIN Material ms ON ms.id = si2.materialId
                WHERE
                    ms.code = 'MAT1'
                ORDER BY
                    r.id DESC
                LIMIT
                    1
            )
            AND rl.materialId = m.id
    );

-- 3) Create recipe for SpecialItem on MAT2 (only if it doesn't already exist)
INSERT INTO
    Recipe (createdAt, updatedAt, specialItemId)
SELECT
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    si.id
FROM
    SpecialItem si
    JOIN Material m ON m.id = si.materialId
WHERE
    m.code = 'MAT2'
    AND NOT EXISTS (
        SELECT
            1
        FROM
            Recipe r
        WHERE
            r.specialItemId = si.id
    );

-- 4) Add lines MAT7–MAT10 to MAT2's recipe (skip existing pairs)
INSERT INTO
    RecipeLine (recipeId, materialId, qty)
SELECT
    (
        SELECT
            r.id
        FROM
            Recipe r
            JOIN SpecialItem si2 ON si2.id = r.specialItemId
            JOIN Material ms ON ms.id = si2.materialId
        WHERE
            ms.code = 'MAT2'
        ORDER BY
            r.id DESC
        LIMIT
            1
    ) AS recipeId,
    m.id AS materialId,
    1.000 AS qty
FROM
    Material m
WHERE
    m.code IN ('MAT7', 'MAT8', 'MAT9', 'MAT10')
    AND NOT EXISTS (
        SELECT
            1
        FROM
            RecipeLine rl
        WHERE
            rl.recipeId = (
                SELECT
                    r.id
                FROM
                    Recipe r
                    JOIN SpecialItem si2 ON si2.id = r.specialItemId
                    JOIN Material ms ON ms.id = si2.materialId
                WHERE
                    ms.code = 'MAT2'
                ORDER BY
                    r.id DESC
                LIMIT
                    1
            )
            AND rl.materialId = m.id
    );