import { Event } from "@/types/event";
import eventsData from "@/data/events.json";

const data = eventsData as { events: Event[] };

/**
 * Lädt alle Events
 */
export function getAllEvents(): Event[] {
  return data.events;
}

/**
 * Lädt alle kommenden Events
 */
export function getUpcomingEvents(): Event[] {
  return data.events.filter((event) => event.status === "upcoming");
}

/**
 * Lädt alle vergangenen Events
 */
export function getPastEvents(): Event[] {
  return data.events.filter((event) => event.status === "past");
}

/**
 * Lädt ein Event anhand der ID
 */
export function getEventById(id: string): Event | undefined {
  return data.events.find((event) => event.id === id);
}

/**
 * Formatiert ein Datum im deutschen Format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


