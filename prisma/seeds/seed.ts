import { prisma } from "./seed_client.js";
import { seedCustomers } from "./seed_customer.js";
import { seedDocumentProduction } from "./seed_document_production.js";
import { seedDocumentPurchase } from "./seed_document_purchase.js";
import { seedDocumentSale } from "./seed_document_sale.js";
import { seedMaterials } from "./seed_material.js";
import { seedRecipes } from "./seed_recipe.js";
import { seedSpecialItems } from "./seed_specialItem.js";
import { seedSuppliers } from "./seed_supplier.js";

async function main() {
	await seedSuppliers();
	await seedCustomers();
	await seedMaterials();
	await seedSpecialItems();
	await seedRecipes();
	await seedDocumentPurchase();
	await seedDocumentSale();
	await seedDocumentProduction();
}

main()
	.then(async () => {
		console.log("🌱 All seeds completed successfully!");
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
