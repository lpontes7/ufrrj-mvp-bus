export type BusLocation = {
  id: string;
  lat: number;
  lng: number;
  line?: string; // ex: “Campus Central”
  updatedAt?: number; // timestamp ms
  headingDeg?: number; // azimute (0–359)
  speedKmh?: number;
};
