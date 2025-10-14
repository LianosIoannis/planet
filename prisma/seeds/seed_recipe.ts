import { prisma } from "./seed_client.js";

export async function seedRecipes() {
	const specialItems = await prisma.specialItem.findMany({
		include: { material: true },
		orderBy: { id: "asc" },
		take: 2,
	});

	if (specialItems.length < 2) {
		console.log("⚠️ Need 2 SpecialItems (for MAT001 & MAT002) before seeding recipes.");
		return;
	}

	const firstRecipeComponents = ["MAT003", "MAT004", "MAT005", "MAT006"];
	const secondRecipeComponents = ["MAT007", "MAT008", "MAT009", /*"MAT010"*/];

	const [firstMaterials, secondMaterials] = await Promise.all([
		prisma.material.findMany({ where: { code: { in: firstRecipeComponents } }, orderBy: { code: "asc" } }),
		prisma.material.findMany({ where: { code: { in: secondRecipeComponents } }, orderBy: { code: "asc" } }),
	]);

	const [si1, si2] = specialItems as [(typeof specialItems)[number], (typeof specialItems)[number]];

	const recipeName1 = `REC_${si1.material.code}`;
	const recipeName2 = `REC_${si2.material.code}`;

	await prisma.recipe.create({
		data: {
			name: recipeName1,
			specialItemId: si1.id,
			recipeLine: {
				create: firstMaterials.map((m) => ({
					materialId: m.id,
					qty: "1.5",
				})),
			},
		},
	});
	console.log(`✅ Seeded ${recipeName1} with ${firstMaterials.length} lines (qty 1.5)`);

	await prisma.recipe.create({
		data: {
			name: recipeName2,
			specialItemId: si2.id,
			recipeLine: {
				create: secondMaterials.map((m) => ({
					materialId: m.id,
					qty: "0.5",
				})),
			},
		},
	});
	console.log(`✅ Seeded ${recipeName2} with ${secondMaterials.length} lines (qty 0.5)`);
}
