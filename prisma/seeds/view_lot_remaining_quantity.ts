import { MovementDirection, Prisma } from "../../generated/prisma/index.js";
import { prisma } from "./seed_client.js";

export type FlatLotBalanceRow = {
	materialLotId: number;
	materialId: number;
	materialCode: string;
	materialName: string;
	lot: string;
	productionDate: Date;
	expirationDate: Date;
	qty: Prisma.Decimal;
};

export type LotBalanceRow = {
	materialLotId: number;
	materialId: number;
	material: { code: string; name: string };
	lotInfo: { lot: string; productionDate: Date; expirationDate: Date };
	qty: Prisma.Decimal;
};

export async function getLotBalances(): Promise<FlatLotBalanceRow[]> {
	// 1) Load all lots with material info
	const lots = await prisma.materialLot.findMany({
		select: {
			id: true,
			materialId: true,
			lot: true,
			productionDate: true,
			expirationDate: true,
			material: { select: { code: true, name: true } },
		},
		orderBy: [{ material: { code: "asc" } }, { lot: "asc" }],
	});
	if (lots.length === 0) return [];

	// 2) Fetch all document lines referencing lots
	const lines = await prisma.documentLine.findMany({
		where: { materialLotId: { not: null } },
		select: { materialLotId: true, movementDirection: true, qty: true },
	});

	// 3) Aggregate net qty (IN - OUT)
	const netByLot = new Map<number, Prisma.Decimal>();
	for (const ln of lines) {
		// biome-ignore lint/style/noNonNullAssertion: <seed>
		const lotId = ln.materialLotId!;
		const prev = netByLot.get(lotId) ?? new Prisma.Decimal(0);
		const delta =
			ln.movementDirection === MovementDirection.IN ? new Prisma.Decimal(ln.qty) : new Prisma.Decimal(ln.qty).negated();
		netByLot.set(lotId, prev.plus(delta));
	}

	// 4) Flatten and build results
	return lots.map((l) => ({
		materialLotId: l.id,
		materialId: l.materialId,
		materialCode: l.material.code,
		materialName: l.material.name,
		lot: l.lot,
		productionDate: l.productionDate,
		expirationDate: l.expirationDate,
		qty: netByLot.get(l.id) ?? new Prisma.Decimal(0),
	}));
}
