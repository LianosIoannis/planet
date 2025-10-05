import { prisma } from "./seed_client.js";

export async function seedSpecialItems() {
	const materials = await prisma.material.findMany({
		take: 2,
		orderBy: { id: "asc" },
	});

	const data = materials.map((m) => ({ materialId: m.id }));
	await prisma.specialItem.createMany({ data });

	console.log(`✅ Seeded ${data.length} special items`);
}
