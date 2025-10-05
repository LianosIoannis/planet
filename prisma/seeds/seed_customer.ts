import { prisma } from "./seed_client.js";

export async function seedCustomers() {
	const data = [
		{ code: "CUS001", name: "Acme Industries", afm: "200001001" },
		{ code: "CUS002", name: "Nova Retail", afm: "200001002" },
		{ code: "CUS003", name: "Orion Manufacturing", afm: "200001003" },
	];

	await prisma.customer.createMany({ data });
	console.log(`✅ Seeded ${data.length} customers`);
}
