import { promises as fs } from "fs";
import path from "path";

export type Content = {
  homepage: { choreographyText: string; lineupText: string };
  eventsLineup: string[];
};

export async function getContent(): Promise<Content> {
  const file = path.join(process.cwd(), "data", "content.json");
  const data = await fs.readFile(file, "utf-8");
  return JSON.parse(data);
}
