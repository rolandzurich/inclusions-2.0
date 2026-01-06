import { DJ, DJPair, DJsData } from "@/types/dj";
import djsData from "@/data/djs.json";

const data = djsData as DJsData;

/**
 * Lädt alle DJs
 */
export function getAllDJs(): DJ[] {
  return data.djs;
}

/**
 * Lädt einen DJ anhand der ID
 */
export function getDJById(id: string): DJ | undefined {
  return data.djs.find((dj) => dj.id === id);
}

/**
 * Lädt alle DJs, die einzeln buchbar sind
 */
export function getBookableDJs(): DJ[] {
  return data.djs.filter((dj) => dj.bookableIndividually);
}

/**
 * Lädt alle DJ Pairs
 */
export function getAllDJPairs(): DJPair[] {
  return data.pairs;
}

/**
 * Lädt ein DJ Pair anhand der ID
 */
export function getDJPairById(id: string): DJPair | undefined {
  return data.pairs.find((pair) => pair.id === id);
}

/**
 * Lädt ein DJ Pair mit vollständigen DJ-Informationen
 */
export function getDJPairWithDJs(pairId: string): (DJPair & { dj1: DJ; dj2: DJ }) | undefined {
  const pair = getDJPairById(pairId);
  if (!pair) return undefined;

  const dj1 = getDJById(pair.dj1Id);
  const dj2 = getDJById(pair.dj2Id);

  if (!dj1 || !dj2) return undefined;

  return {
    ...pair,
    dj1,
    dj2,
  };
}

/**
 * Lädt alle DJs und Pairs für ein Event-Lineup
 */
export function getLineupItems(ids: string[]): Array<{ type: "dj" | "pair"; data: DJ | DJPair }> {
  const items: Array<{ type: "dj" | "pair"; data: DJ | DJPair }> = [];
  for (const id of ids) {
    const dj = getDJById(id);
    if (dj) {
      items.push({ type: "dj" as const, data: dj });
      continue;
    }
    const pair = getDJPairById(id);
    if (pair) {
      items.push({ type: "pair" as const, data: pair });
    }
  }
  return items;
}

/**
 * Generiert den Anzeigenamen für ein DJ Pair mit echten DJ-Namen
 * (z.B. "Samy Jackson & DJ Bächli" statt "Samy Jackson & Inclusions DJ")
 */
export function getPairDisplayName(pairId: string): string | undefined {
  const pairWithDJs = getDJPairWithDJs(pairId);
  if (!pairWithDJs) return undefined;
  
  return `${pairWithDJs.dj1.name} & ${pairWithDJs.dj2.name}`;
}

/**
 * Generiert den Anzeigenamen für ein DJ Pair im Lineup
 * (z.B. "Samy Jackson & Inclusions DJ" statt "Samy Jackson & DJ Bächli")
 */
export function getLineupPairDisplayName(pairId: string): string | undefined {
  const pairWithDJs = getDJPairWithDJs(pairId);
  if (!pairWithDJs) return undefined;
  
  return `${pairWithDJs.dj1.name} & Inclusions DJ`;
}


