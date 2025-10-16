import dayjs from "dayjs";
import { DocumentKind, MovementDirection, Prisma } from "../../generated/prisma/index.js";
import { prisma } from "./seed_client.js";

export type SaleLineInput = {
	materialLotId: number;
	qty: number;
};

export type CreateSaleWithLotsInput = {
	customerId: number;
	number: number;
	lines: SaleLineInput[];
	date: Date;
	notes?: string | null;
};

export async function createSaleDocumentWithLots(input: CreateSaleWithLotsInput) {
	const SALE = DocumentKind.SALE;
	const OUT = MovementDirection.OUT;

	return prisma.$transaction(async (tx) => {
		const lotIds = [...new Set(input.lines.map((l) => l.materialLotId))];

		const lots = await tx.materialLot.findMany({
			where: { id: { in: lotIds } },
			select: { id: true, materialId: true },
		});

		const resolved = input.lines.map((l, idx) => {
			const lot = lots.find((x) => x.id === l.materialLotId);

			return {
				lineNo: idx + 1,
				materialId: lot?.materialId as number,
				materialLotId: l.materialLotId,
				qty: new Prisma.Decimal(l.qty),
			};
		});

		return tx.document.create({
			data: {
				kind: SALE,
				date: dayjs(input.date).toDate(),
				number: input.number,
				notes: input.notes ?? null,
				customer: { connect: { id: input.customerId } },
				documentLines: {
					create: resolved.map((r) => ({
						lineNo: r.lineNo,
						movementDirection: OUT,
						qty: new Prisma.Decimal(r.qty),
						material: { connect: { id: r.materialId } },
						materialLot: { connect: { id: r.materialLotId } },
					})),
				},
			},
			include: {
				customer: true,
				documentLines: {
					include: { material: true, materialLot: true },
					orderBy: { lineNo: "asc" },
				},
			},
		});
	});
}
