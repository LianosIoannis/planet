import { createPurchaseDocumentWithLots } from "./create_purchase.js";

export async function seedDocumentPurchase() {
	const supplierId1 = 1;
	const supplierId2 = 2;
	const supplierId3 = 3;

	const materialAId = 3;
	const materialBId = 4;
	const materialCId = 5;
	const materialDId = 6;
	const materialEId = 7;
	const materialFId = 8;
	const materialGId = 9;
	const materialHId = 10;

	await createPurchaseDocumentWithLots({
		supplierId: supplierId1,
		number: 1,
		date: new Date("2025-10-01"),
		notes: "Seed purchase #1",
		lines: [
			{
				materialId: materialAId,
				lot: "L-A-001",
				productionDate: "2025-09-01",
				expirationDate: "2026-09-01",
				qty: 120.5,
			},
			{
				materialId: materialBId,
				lot: "L-B-001",
				productionDate: "2025-09-05",
				expirationDate: "2026-09-05",
				qty: 75,
			},
		],
	});

	await createPurchaseDocumentWithLots({
		supplierId: supplierId2,
		number: 2,
		date: new Date("2025-10-10"),
		notes: "Seed purchase #2",
		lines: [
			{
				materialId: materialBId,
				lot: "L-B-002",
				productionDate: "2025-09-20",
				expirationDate: "2026-09-20",
				qty: 50,
			},
			{
				materialId: materialCId,
				lot: "L-C-001",
				productionDate: "2025-09-22",
				expirationDate: "2026-09-22",
				qty: 200,
			},
		],
	});

	await createPurchaseDocumentWithLots({
		supplierId: supplierId3,
		number: 3,
		date: new Date("2025-10-15"),
		notes: "Seed purchase #3",
		lines: [
			{
				materialId: materialDId,
				lot: "L-D-001",
				productionDate: "2025-09-25",
				expirationDate: "2026-09-25",
				qty: 180,
			},
			{
				materialId: materialEId,
				lot: "L-E-001",
				productionDate: "2025-09-28",
				expirationDate: "2026-09-28",
				qty: 95.3,
			},
			{
				materialId: materialFId,
				lot: "L-F-001",
				productionDate: "2025-09-30",
				expirationDate: "2026-09-30",
				qty: 65,
			},
			{
				materialId: materialGId,
				lot: "L-G-001",
				productionDate: "2025-10-02",
				expirationDate: "2026-10-02",
				qty: 140,
			},
			{
				materialId: materialHId,
				lot: "L-H-001",
				productionDate: "2025-10-05",
				expirationDate: "2026-10-05",
				qty: 110,
			},
		],
	});

	console.log("✅ Seeded 3 purchase documents.");
}
