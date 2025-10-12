import { prisma } from "./seed_client.js";

export async function seedSuppliers() {
	const data = [
		{ code: "SUP001", name: "Alpha Supplies", afm: "100001001" },
		{ code: "SUP002", name: "Beta Traders", afm: "100001002" },
		{ code: "SUP003", name: "Gamma Imports", afm: "100001003" },
		{ code: "ADJ_SUPP", name: "ADJUSTMENT", afm: "000000000" },
	];

	await prisma.supplier.createMany({ data });
	console.log(`✅ Seeded ${data.length} suppliers`);
}
