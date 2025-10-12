import { createProductionDocument } from "./create_production.js";
import { prisma } from "./seed_client.js";

export async function seedDocumentProduction() {
	async function getIngredientLotIdsForRecipe(recipeId: number) {
		const recipe = (await prisma.recipe.findUnique({
			where: { id: recipeId },
			include: {
				specialItem: { include: { material: { select: { code: true } } } },
				recipeLine: {
					select: { id: true, materialId: true },
					orderBy: { id: "asc" },
				},
			},
		})) as {
			specialItem: {
				material: {
					code: string;
				};
			} & {
				id: number;
				materialId: number;
			};
			recipeLine: {
				id: number;
				materialId: number;
			}[];
		} & {
			id: number;
			name: string;
			createdAt: Date;
			updatedAt: Date;
			specialItemId: number;
		};

		const lotIds = await Promise.all(
			recipe.recipeLine.map(async (rl) => {
				const lot = await prisma.materialLot.findFirst({
					where: { materialId: rl.materialId },
					select: { id: true },
					orderBy: { id: "asc" },
				});
				// biome-ignore lint/style/noNonNullAssertion: <Seed>
				return lot!.id;
			}),
		);

		return {
			lotIds,
			finishedGoodCode: recipe.specialItem.material.code,
		};
	}

	const r1 = await getIngredientLotIdsForRecipe(1);
	await createProductionDocument({
		recipeId: 1,
		number: 3001,
		lot: `FG-${r1.finishedGoodCode}-001`,
		date: new Date("2025-10-12"),
		notes: "Test production for recipe #1",
		qty: 1,
		materialLotIds: r1.lotIds,
	});

	const r2 = await getIngredientLotIdsForRecipe(2);
	await createProductionDocument({
		recipeId: 2,
		number: 3002,
		lot: `FG-${r2.finishedGoodCode}-001`,
		date: new Date("2025-10-12"),
		notes: "Test production for recipe #2",
		qty: 2,
		materialLotIds: r2.lotIds,
	});

	console.log("✅ Seeded 2 production documents (recipes 1 & 2).");
}
