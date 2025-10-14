import cors from "cors";
import express from "express";
import { prisma } from "./prisma/seeds/seed_client.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/get-customers", async (_, res) => {
	const result = await prisma.customer.findMany();
	res.json(result);
});

app.get("/get-suppliers", async (_, res) => {
	const result = await prisma.supplier.findMany();
	res.json(result);
});

app.get("/get-raw-materials", async (_, res) => {
	const result = await prisma.material.findMany({ where: { SpecialItem: { is: null } } });
	res.json(result);
});

app.get("/get-special-products", async (_, res) => {
	const result = await prisma.material.findMany({ where: { SpecialItem: { isNot: null } } });
	res.json(result);
});

app.get("/get-purchase-documents", async (_, res) => {
	const result = await prisma.document.findMany({ where: { kind: "PURCHASE" } });
	res.json(result);
});

app.get("/get-sale-documents", async (_, res) => {
	const result = await prisma.document.findMany({ where: { kind: "SALE" } });
	res.json(result);
});

app.get("/get-production-documents", async (_, res) => {
	const result = await prisma.document.findMany({ where: { kind: "PRODUCTION" } });
	res.json(result);
});

app.get("/get-adjustment-documents", async (_, res) => {
	const result = await prisma.document.findMany({ where: { kind: "ADJUSTMENT" } });
	res.json(result);
});

app.delete("/delete-customer/:id", async (req, res) => {
	const id = parseInt(req.params.id, 10);

	const deleted = await prisma.customer.delete({
		where: { id },
	});

	res.json({ success: true, deleted });
});

app.delete("/delete-supplier/:id", async (req, res) => {
	const id = parseInt(req.params.id, 10);

	const deleted = await prisma.supplier.delete({
		where: { id },
	});

	res.json({ success: true, deleted });
});

app.delete("/delete-document/:id", async (req, res) => {
	const id = parseInt(req.params.id, 10);

	const deleted = await prisma.document.delete({
		where: { id },
	});

	res.json({ success: true, deleted });
});

app.delete("/delete-raw-material/:id", async (req, res) => {
	const id = parseInt(req.params.id, 10);

	const deleted = await prisma.material.delete({
		where: { id },
	});

	res.json({ success: true, deleted });
});

app.delete("/delete-special-product/:id", async (req, res) => {
	const sid = parseInt(req.params.id, 10);

	const si = (await prisma.specialItem.findUnique({
		where: { id: sid },
	})) as {
		id: number;
		materialId: number;
	};

	const deleted = await prisma.material.delete({
		where: { id: si.materialId as number },
	});

	res.json({ success: true, deleted });
});

app.post("/create-supplier", async (req, res) => {
	try {
		const supplier = await prisma.supplier.create({
			data: req.body,
		});
		res.status(201).json(supplier);
	} catch (err) {
		res.status(500).json({ error: "Failed to create customer", message: err });
	}
});

app.post("/create-customer", async (req, res) => {
	try {
		const customer = await prisma.customer.create({
			data: req.body,
		});
		res.status(201).json(customer);
	} catch (err) {
		res.status(500).json({ error: "Failed to create customer", message: err });
	}
});

const PORT = 3000;

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
