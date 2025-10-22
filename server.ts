import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { type CreateProductionInput, createProductionDocument } from "./prisma/seeds/create_production.js";
import { type CreatePurchaseWithLotsInput, createPurchaseDocumentWithLots } from "./prisma/seeds/create_purchase.js";
import { type CreateSaleWithLotsInput, createSaleDocumentWithLots } from "./prisma/seeds/create_sale.js";
import { prisma } from "./prisma/seeds/seed_client.js";
import { getLotBalances } from "./prisma/seeds/view_lot_remaining_quantity.js";
import { getLotUsageDocuments } from "./prisma/seeds/view_lot_usage_documents.js";

const app = express();

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const browserDir = path.join(__dirname, "ui", "browser");

app.use("/", express.static(browserDir, { index: false }));

app.get("/", (_, res) => {
	res.sendFile(path.join(browserDir, "index.html"));
});

app.get("/get-customers", async (_, res) => {
	try {
		const result = await prisma.customer.findMany();
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-suppliers", async (_, res) => {
	try {
		const result = await prisma.supplier.findMany();
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-raw-materials", async (_, res) => {
	try {
		const result = await prisma.material.findMany({ where: { SpecialItem: { is: null } } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-special-products", async (_, res) => {
	try {
		const result = await prisma.material.findMany({ where: { SpecialItem: { isNot: null } } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-all-products", async (_, res) => {
	try {
		const result = await prisma.material.findMany();
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-all-products-except/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const result = await prisma.material.findMany({ where: { id: { not: id } } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-recipes", async (_, res) => {
	try {
		const result = await prisma.recipe.findMany();
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-material-lots/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const result = await prisma.materialLot.findMany({ where: { materialId: id } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-recipe-materials/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const lines = await prisma.recipeLine.findMany({ where: { recipeId: id } });
		const materialIds = [...new Set(lines.map((line) => line.materialId))];
		const result = await prisma.material.findMany({ where: { id: { in: materialIds } } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-purchase-documents", async (_, res) => {
	try {
		const result = await prisma.document.findMany({ where: { kind: "PURCHASE" } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-sale-documents", async (_, res) => {
	try {
		const result = await prisma.document.findMany({ where: { kind: "SALE" } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-production-documents", async (_, res) => {
	try {
		const result = await prisma.document.findMany({ where: { kind: "PRODUCTION" } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-adjustment-documents", async (_, res) => {
	try {
		const result = await prisma.document.findMany({ where: { kind: "ADJUSTMENT" } });
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-lot-balances", async (_, res) => {
	try {
		const result = await getLotBalances();
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.get("/get-lot-usage-documents", async (_, res) => {
	try {
		const result = await getLotUsageDocuments();
		res.status(200).json({ success: true, data: result });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.delete("/delete-customer/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const deleted = await prisma.customer.delete({ where: { id } });
		res.status(200).json({ success: true, data: deleted });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.delete("/delete-supplier/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const deleted = await prisma.supplier.delete({ where: { id } });
		res.status(200).json({ success: true, data: deleted });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.delete("/delete-document/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const deleted = await prisma.document.delete({ where: { id } });
		res.status(200).json({ success: true, data: deleted });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.delete("/delete-raw-material/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const deleted = await prisma.material.delete({ where: { id } });
		res.status(200).json({ success: true, data: deleted });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.delete("/delete-special-product/:id", async (req, res) => {
	try {
		const sid = parseInt(req.params.id, 10);
		const si = await prisma.specialItem.findUnique({ where: { id: sid } });
		if (!si) throw new Error("Special item not found");
		const deleted = await prisma.material.delete({ where: { id: si.materialId } });
		res.status(200).json({ success: true, data: deleted });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.delete("/delete-recipe/:id", async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const deleted = await prisma.recipe.delete({ where: { id } });
		res.status(200).json({ success: true, data: deleted });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-supplier", async (req, res) => {
	try {
		const supplier = await prisma.supplier.create({ data: req.body });
		res.status(200).json({ success: true, data: supplier });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-customer", async (req, res) => {
	try {
		const customer = await prisma.customer.create({ data: req.body });
		res.status(200).json({ success: true, data: customer });
	} catch (err) {
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-production-document", async (req, res) => {
	try {
		const document = await createProductionDocument(req.body as CreateProductionInput);
		res.status(200).json({ success: true, data: document });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-purchase-document", async (req, res) => {
	try {
		const document = await createPurchaseDocumentWithLots(req.body as CreatePurchaseWithLotsInput);
		res.status(200).json({ success: true, data: document });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-sale-document", async (req, res) => {
	try {
		const document = await createSaleDocumentWithLots(req.body as CreateSaleWithLotsInput);
		res.status(200).json({ success: true, data: document });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-raw-material", async (req, res) => {
	try {
		const material = await prisma.material.create({ data: req.body });
		res.status(200).json({ success: true, data: material });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-special-product", async (req, res) => {
	try {
		const material = await prisma.material.create({ data: req.body });
		const special = await prisma.specialItem.create({ data: { materialId: material.id } });
		res.status(200).json({ success: true, data: special });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

app.post("/create-recipe", async (req, res) => {
	try {
		const { name, materialId, recipeLine } = req.body;

		const specialItemId = await prisma.specialItem.findUnique({ where: { materialId: materialId } });

		const recipe = await prisma.recipe.create({
			data: {
				name,
				specialItemId: specialItemId!.id,
				recipeLine: {
					create: recipeLine.map((line: any) => ({
						materialId: line.materialId,
						qty: String(line.qty),
					})),
				},
			},
		});

		res.status(200).json({ success: true, data: recipe });
	} catch (err) {
		console.dir(err);
		res.status(200).json({ success: false, error: JSON.stringify(err) });
	}
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
