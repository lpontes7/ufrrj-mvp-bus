export type BusLocation = {
  id: string;
  lat: number;
  lng: number;
  line?: string; // ex: “Campus Central”
  updatedAt?: number; // timestamp ms
  headingDeg?: number; // azimute (0–359)
  speedKmh?: number;
};

export type BusCurrentLocation = {
  lat: number;
  lng: number;
  updatedAt: number;
  userId: string;
};

export type BusDirection = 'TO_RURAL' | 'TO_49';

export type BusSighting = {
  id: string;
  busId: string;
  userId: string;
  lat: number;
  lng: number;
  createdAt: number | string | Date | { seconds: number; nanoseconds?: number };
  expiresAt?: number;
  direction?: BusDirection | null;
};

export type BusLiveShare = {
  id: string; // normalmente o próprio userId
  userId: string;
  lat: number;
  lng: number;
  updatedAt: number;
};

export type GetLastSightingsParams = {
  busId: string;
  limit: number;
};

export type SendOutsideBusSightParams = {
  busId: string;
  userId: string;
  lat: number;
  lng: number;
  direction: BusDirection;
};

export type SendInsideBusLocationParams = {
  busId: string;
  userId: string;
  lat: number;
  lng: number;
};
