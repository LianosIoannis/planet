import { createSaleDocumentWithLots } from "./create_sale.js";

export async function seedDocumentSale() {
	const customerId1 = 1;
	const customerId2 = 2;

	const lotA1Id = 1;
	const lotB1Id = 2;
	const lotB2Id = 3;
	const lotC1Id = 4;

	await createSaleDocumentWithLots({
		customerId: customerId1,
		number: 1,
		date: new Date("2025-10-15"),
		notes: "Seed sale #1",
		lines: [
			{
				materialLotId: lotA1Id,
				qty: 25,
			},
			{
				materialLotId: lotB1Id,
				qty: 10,
			},
		],
	});

	// --- Sale Document #2 ---
	await createSaleDocumentWithLots({
		customerId: customerId2,
		number: 2,
		date: new Date("2025-10-20"),
		notes: "Seed sale #2",
		lines: [
			{
				materialLotId: lotB2Id,
				qty: 15,
			},
			{
				materialLotId: lotC1Id,
				qty: 30,
			},
		],
	});

	console.log("✅ Seeded 2 sale documents.");
}
