import dayjs from "dayjs";
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
		const recipe = await tx.recipe.findUnique({
			where: { id: input.recipeId },
			include: {
				specialItem: { select: { materialId: true } },
				recipeLine: {
					select: { materialId: true, qty: true, id: true },
					orderBy: { id: "asc" },
				},
			},
		});

		const lots = await tx.materialLot.findMany({
			where: { id: { in: input.materialLotIds } },
			select: { id: true, materialId: true, expirationDate: true },
		});

		const lotByMaterialId = new Map(lots.map((l) => [l.materialId, l]));

		const earliestLot = await tx.materialLot.findFirst({
			where: { id: { in: input.materialLotIds } },
			select: { expirationDate: true },
			orderBy: { expirationDate: "asc" },
		});

		// biome-ignore lint/style/noNonNullAssertion: <seed>
		const finishedMaterialId = recipe!.specialItem.materialId;
		const fallbackExpiration = dayjs(input.date).add(1, "year").toDate();
		const targetExpiration = earliestLot?.expirationDate ?? fallbackExpiration;

		const finishedInLine = {
			lineNo: 1,
			movementDirection: IN,
			qty: new Prisma.Decimal(input.qty),
			material: { connect: { id: finishedMaterialId } },
			materialLot: {
				create: {
					material: { connect: { id: finishedMaterialId } },
					lot: input.lot, // must be unique per material
					productionDate: dayjs(input.date).toDate(),
					expirationDate: dayjs(targetExpiration).toDate(),
				},
			},
		};

		// biome-ignore lint/style/noNonNullAssertion: <seed>
		const ingredientOutLines = recipe!.recipeLine.map((ing, idx) => {
			// biome-ignore lint/style/noNonNullAssertion: <seed>
			const lot = lotByMaterialId.get(ing.materialId)!;
			const qty = new Prisma.Decimal(ing.qty).mul(new Prisma.Decimal(input.qty));
			return {
				lineNo: idx + 2,
				movementDirection: OUT,
				qty,
				material: { connect: { id: ing.materialId } },
				materialLot: { connect: { id: lot.id, materialId: ing.materialId } },
			};
		});

		// 4) Create document
		return tx.document.create({
			data: {
				kind: PRODUCTION,
				date: dayjs(input.date).toDate(),
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
