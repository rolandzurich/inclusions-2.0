export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  lineup?: string[]; // Array of DJ/Pair IDs
  status: "upcoming" | "past";
  image?: string;
  video?: string;
}


