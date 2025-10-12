import { DocumentKind, MovementDirection, Prisma } from "../../generated/prisma/index.js";
import { prisma } from "./seed_client.js";

export type PurchaseLineInput = {
	materialId: number;
	lot: string;
	productionDate: Date | string;
	expirationDate: Date | string;
	qty: number;
};

export type CreatePurchaseWithLotsInput = {
	supplierId: number;
	number: number;
	lines: PurchaseLineInput[];
	date: Date;
	notes?: string | null;
};

export async function createPurchaseDocumentWithLots(input: CreatePurchaseWithLotsInput) {
	const PURCHASE = DocumentKind.PURCHASE;
	const IN = MovementDirection.IN;

	const created = await prisma.$transaction(async (tx) => {
		return tx.document.create({
			data: {
				kind: PURCHASE,
				date: input.date,
				number: input.number,
				notes: input.notes ?? null,
				supplier: { connect: { id: input.supplierId } },

				documentLines: {
					create: input.lines.map((line, i) => ({
						lineNo: i + 1,
						movementDirection: IN,
						qty: new Prisma.Decimal(line.qty),

						material: { connect: { id: line.materialId } },
						materialLot: {
							connectOrCreate: {
								where: {
									materialId_lot: {
										materialId: line.materialId,
										lot: line.lot,
									},
								},
								create: {
									material: { connect: { id: line.materialId } },
									lot: line.lot,
									productionDate: new Date(line.productionDate),
									expirationDate: new Date(line.expirationDate),
								},
							},
						},
					})),
				},
			},
			include: {
				supplier: true,
				documentLines: {
					include: { material: true, materialLot: true },
					orderBy: { lineNo: "asc" },
				},
			},
		});
	});

	return created;
}
