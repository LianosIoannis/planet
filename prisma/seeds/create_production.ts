import { DocumentKind, MovementDirection, Prisma } from "../../generated/prisma/index.js";
import { prisma } from "./seed_client.js";

export type CreateProductionInput = {
	recipeId: number;
	number: number;
	lot: string;
	date: Date;
	notes?: string | null;
	qty: number;
	materialLotIds: number[];
};

export async function createProductionDocument(input: CreateProductionInput) {
	const PRODUCTION = DocumentKind.PRODUCTION;
	const IN = MovementDirection.IN;
	const OUT = MovementDirection.OUT;

	return prisma.$transaction(async (tx) => {
		const recipe = (await tx.recipe.findUnique({
			where: { id: input.recipeId },
			include: {
				specialItem: { select: { materialId: true } },
				recipeLine: {
					select: { materialId: true, qty: true, id: true },
					orderBy: { id: "asc" },
				},
			},
		})) as {
			specialItem: {
				materialId: number;
			};
			recipeLine: {
				id: number;
				qty: Prisma.Decimal;
				materialId: number;
			}[];
		} & {
			name: string;
			id: number;
			createdAt: Date;
			updatedAt: Date;
			specialItemId: number;
		};

		const lots = await tx.materialLot.findMany({
			where: { id: { in: input.materialLotIds } },
			select: { id: true },
			orderBy: { id: "asc" },
		});

		const finishedMaterialId = recipe.specialItem.materialId;

		const finishedInLine = {
			lineNo: 1,
			movementDirection: IN,
			qty: input.qty,
			material: { connect: { id: finishedMaterialId } },
			materialLot: {
				connectOrCreate: {
					where: { materialId_lot: { materialId: finishedMaterialId, lot: input.lot } },
					create: {
						material: { connect: { id: finishedMaterialId } },
						lot: input.lot,
						productionDate: input.date,
						expirationDate: input.date,
					},
				},
			},
		} as const;

		const ingredientOutLines = recipe.recipeLine.map((ing, idx) => ({
			lineNo: idx + 2,
			movementDirection: OUT,
			qty: new Prisma.Decimal(ing.qty).mul(new Prisma.Decimal(input.qty)),
			material: { connect: { id: ing.materialId } },
			// biome-ignore lint/style/noNonNullAssertion: <Seed>
			materialLot: { connect: { id: lots[idx]!.id } },
		}));

		// 4) Create document
		return tx.document.create({
			data: {
				kind: PRODUCTION,
				date: input.date,
				number: input.number,
				notes: input.notes ?? null,
				recipe: { connect: { id: input.recipeId } },
				documentLines: { create: [finishedInLine, ...ingredientOutLines] },
			},
			include: {
				recipe: { include: { specialItem: { include: { material: true } } } },
				documentLines: {
					include: { material: true, materialLot: true },
					orderBy: { lineNo: "asc" },
				},
			},
		});
	});
}
