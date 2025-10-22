import { DocumentKind, MovementDirection } from "../../generated/prisma/index.js";
import { prisma } from "./seed_client.js";

export type LotUsageDoc = {
	originLotId: number;
	documentId: number;
	documentKind: DocumentKind;
	documentDate: Date;
	documentNumber: number;
	minDepth: number; // 0 = direct usage of the origin lot; >=1 via descendants
};

export async function getLotUsageDocuments(): Promise<LotUsageDoc[]> {
	// 1) Load all lots (ids only)
	const lots = await prisma.materialLot.findMany({
		select: { id: true },
		orderBy: { id: "asc" },
	});
	if (lots.length === 0) return [];

	const allLotIds = lots.map((l) => l.id);

	// 2) Build lot→lot edges from PRODUCTION documents:
	//    each PRODUCTION doc: one IN (finished lot) + many OUT (input lots)
	const prodDocs = await prisma.document.findMany({
		where: { kind: DocumentKind.PRODUCTION },
		select: {
			id: true,
			documentLines: {
				select: { movementDirection: true, materialLotId: true },
				orderBy: { lineNo: "asc" },
			},
		},
	});

	const edges = new Map<number, Set<number>>(); // inputLotId -> Set<finishedLotId>
	for (const d of prodDocs) {
		const finished = d.documentLines.find(
			(ln) => ln.movementDirection === MovementDirection.IN && ln.materialLotId != null,
		);
		if (!finished?.materialLotId) continue;
		const finishedLotId = finished.materialLotId;

		for (const ln of d.documentLines) {
			if (ln.movementDirection === MovementDirection.OUT && ln.materialLotId != null) {
				const inputLotId = ln.materialLotId;
				if (!edges.has(inputLotId)) edges.set(inputLotId, new Set<number>());
				// biome-ignore lint/style/noNonNullAssertion: <seed>
				edges.get(inputLotId)!.add(finishedLotId);
			}
		}
	}

	// 3) Fetch all document lines that reference any lot (+ doc info)
	const lines = await prisma.documentLine.findMany({
		where: { materialLotId: { in: allLotIds } },
		select: {
			materialLotId: true,
			movementDirection: true,
			document: { select: { id: true, kind: true, date: true, number: true } },
		},
		orderBy: [{ documentId: "asc" }],
	});

	// Group lines by lotId for quick lookups
	const linesByLot = new Map<number, typeof lines>();
	for (const ln of lines) {
		// biome-ignore lint/style/noNonNullAssertion: <seed>
		const lotId = ln.materialLotId!;
		const arr = linesByLot.get(lotId);
		if (arr) arr.push(ln);
		else linesByLot.set(lotId, [ln]);
	}

	// 4) For each origin lot, BFS to compute descendants and min depth
	const result: LotUsageDoc[] = [];
	for (const origin of allLotIds) {
		// BFS over lot graph
		const queue: Array<{ lotId: number; depth: number }> = [{ lotId: origin, depth: 0 }];
		const seen = new Map<number, number>(); // lotId -> minDepth
		seen.set(origin, 0);

		while (queue.length) {
			// biome-ignore lint/style/noNonNullAssertion: <seed>
			const { lotId, depth } = queue.shift()!;
			const nexts = edges.get(lotId);
			if (nexts) {
				for (const child of nexts) {
					const prev = seen.get(child);
					if (prev == null || depth + 1 < prev) {
						seen.set(child, depth + 1);
						queue.push({ lotId: child, depth: depth + 1 });
					}
				}
			}
		}

		// 5) For each reached lot, collect documents per rule:
		//    - depth 0 (origin itself): include ONLY OUT movements of that lot
		//    - depth >= 1: include ANY document that references the descendant lot
		const docsForOrigin = new Map<number, LotUsageDoc>(); // documentId -> row (minDepth tracked)

		for (const [reachedLotId, depth] of seen.entries()) {
			const lotLines = linesByLot.get(reachedLotId) ?? [];
			for (const ln of lotLines) {
				if (depth === 0 && ln.movementDirection !== MovementDirection.OUT) {
					continue; // only count "use" of the origin lot itself
				}
				const d = ln.document;
				const existing = docsForOrigin.get(d.id);
				if (!existing || depth < existing.minDepth) {
					docsForOrigin.set(d.id, {
						originLotId: origin,
						documentId: d.id,
						documentKind: d.kind,
						documentDate: d.date,
						documentNumber: d.number,
						minDepth: depth,
					});
				}
			}
		}

		// append rows
		result.push(...Array.from(docsForOrigin.values()));
	}

	// global ordering helpful for UI
	result.sort(
		(a, b) =>
			a.originLotId - b.originLotId ||
			new Date(a.documentDate).getTime() - new Date(b.documentDate).getTime() ||
			a.documentId - b.documentId,
	);

	return result;
}
