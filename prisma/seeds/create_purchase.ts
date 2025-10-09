// src/services/documents/createPurchaseDocumentWithLots.ts
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
	lines: PurchaseLineInput[];
	date?: Date;
	notes?: string | null;
};

function toDate(d: Date | string) {
	return d instanceof Date ? d : new Date(d);
}

export async function createPurchaseDocumentWithLots(input: CreatePurchaseWithLotsInput) {
	const { supplierId, lines, date = new Date(), notes = null } = input;

	if (!lines?.length) throw new Error("At least one line is required.");

	// Pre-validation (cheap, outside tx)
	const supplier = await prisma.supplier.findUnique({
		where: { id: supplierId },
		select: { id: true, isActive: true },
	});
	if (!supplier) throw new Error(`Supplier ${supplierId} not found.`);
	if (!supplier.isActive) throw new Error(`Supplier ${supplierId} is inactive.`);

	for (let i = 0; i < lines.length; i++) {
		const { qty, lot, productionDate, expirationDate } = lines[i];
		const q = new Prisma.Decimal(qty);
		if (q.lessThanOrEqualTo(0)) throw new Error(`Quantity at line ${i + 1} must be > 0.`);
		if (!lot?.trim()) throw new Error(`Lot is required at line ${i + 1}.`);

		const pd = toDate(productionDate);
		const ed = toDate(expirationDate);
		if (Number.isNaN(+pd) || Number.isNaN(+ed)) {
			throw new Error(`Invalid date(s) at line ${i + 1}.`);
		}
		if (pd > ed) {
			throw new Error(`productionDate must be <= expirationDate at line ${i + 1}.`);
		}
	}

	const uniqueMaterialIds = [...new Set(lines.map((l) => l.materialId))];
	const materials = await prisma.material.findMany({
		where: { id: { in: uniqueMaterialIds } },
		select: { id: true },
	});
	if (materials.length !== uniqueMaterialIds.length) {
		const found = new Set(materials.map((m) => m.id));
		const missing = uniqueMaterialIds.filter((id) => !found.has(id));
		throw new Error(`Missing material ids: ${missing.join(", ")}`);
	}

	return prisma.$transaction(async (tx) => {
		// Next sequential document number for PURCHASE
		const agg = await tx.document.aggregate({
			_max: { number: true },
			where: { kind: "PURCHASE" },
		});
		const nextNumber = (agg._max.number ?? 0) + 1;

		const doc = await tx.document.create({
			data: {
				kind: "PURCHASE",
				number: nextNumber,
				date,
				notes,
				supplier: { connect: { id: supplierId } },
			},
			select: { id: true },
		});

		// Upsert (materialId, lot) -> get lot ids
		const lotIds: number[] = [];
		for (const line of lines) {
			const pd = toDate(line.productionDate);
			const ed = toDate(line.expirationDate);

			const lot = await tx.materialLot.upsert({
				where: {
					// thanks to @@unique([materialId, lot]) in your schema
					materialId_lot: { materialId: line.materialId, lot: line.lot },
				},
				update: {
					// If the lot already exists, we DO NOT change its identity but we can
					// optionally refresh the dates if you prefer. Comment out if you want them immutable.
					productionDate: pd,
					expirationDate: ed,
				},
				create: {
					materialId: line.materialId,
					lot: line.lot,
					productionDate: pd,
					expirationDate: ed,
				},
				select: { id: true },
			});

			lotIds.push(lot.id);
		}

		// Create document lines (movementDirection = IN)
		const linesData = lines.map((l, idx) => ({
			documentId: doc.id,
			lineNo: idx + 1,
			materialId: l.materialId,
			materialLotId: lotIds[idx],
			movementDirection: "IN" as const,
			qty: new Prisma.Decimal(l.qty),
		}));

		await tx.documentLine.createMany({ data: linesData });

		// Return the full document with lines & relations
		return tx.document.findUniqueOrThrow({
			where: { id: doc.id },
			include: {
				supplier: true,
				documentLines: {
					orderBy: { lineNo: "asc" },
					include: { material: true, materialLot: true },
				},
			},
		});
	});
}
