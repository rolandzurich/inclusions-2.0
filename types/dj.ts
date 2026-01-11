export interface DJ {
  id: string;
  name: string;
  image?: string;
  text?: string;
  soundcloud?: string;
  hasDisability: boolean;
  bookableIndividually: boolean;
}

export interface DJPair {
  id: string;
  name: string;
  dj1Id: string;
  dj2Id: string;
  image?: string;
  text?: string;
}

export interface DJsData {
  djs: DJ[];
  pairs: DJPair[];
}


