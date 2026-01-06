import rueckblickData from "@/data/rueckblick.json";

export interface RueckblickImage {
  id: number;
  filename: string;
  title: string;
  description: string;
  category: string;
  order: number;
}

export interface RueckblickData {
  images: RueckblickImage[];
}

const data = rueckblickData as RueckblickData;

/**
 * Lädt alle Rückblick-Bilder
 */
export function getAllRueckblickImages(): RueckblickImage[] {
  return data.images.sort((a, b) => a.order - b.order);
}

/**
 * Lädt Bilder nach Kategorie
 */
export function getRueckblickImagesByCategory(category: string): RueckblickImage[] {
  return data.images
    .filter((img) => img.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * Lädt ein Bild anhand der ID
 */
export function getRueckblickImageById(id: number): RueckblickImage | undefined {
  return data.images.find((img) => img.id === id);
}

/**
 * Kategorien mit deutschen Namen
 */
export const categories = {
  start: "Januar 2025: Zusage vom Supermarket",
  workshops: "DJ Workshops & DJ Trainings während dem Jahr",
  crew: "Crew Treffen im insieme Kulturlokal",
  sponsoren: "Sponsoren & Unterstützer",
  events: "März 2025 Launch der Webseite",
  "insieme-sommerfest": "insieme Sommerfest",
  "dj-on-tour": "Inclusions DJ's on Tour",
  "wertvolle-treffen": "Wertvolle Treffen",
  "grosser-tag": "Der grosse Tag der Inclusions",
  kultur: "Inclusions on Tour",
  "inclusions-art": "Inclusions Art",
  "dance-crew": "Die Dance Crew",
  abschluss: "Debriefing und die Reise geht weiter...",
  "community-event": "Bereits im November: Inclusions Community Event",
};

