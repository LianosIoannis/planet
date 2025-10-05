import { prisma } from "./seed_client.js";

export async function seedMaterials() {
	const materials = Array.from({ length: 10 }, (_, i) => ({
		code: `MAT${String(i + 1).padStart(3, "0")}`,
		name: `Material ${i + 1}`,
	}));

	await prisma.material.createMany({ data: materials });
	console.log(`✅ Seeded ${materials.length} materials`);
}
