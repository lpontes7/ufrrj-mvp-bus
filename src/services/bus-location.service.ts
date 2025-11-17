import {
  ref,
  set,
  get,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { database } from "../config/firebase";

export type BusSighting = {
  id: string;
  lat: number;
  lng: number;
  createdAt: number;
  expiresAt?: number;
  userId: string;
};

export class BusLocationService {
  static async sendInsideBusLocation(params: {
    busId: string;
    userId: string;
    lat: number;
    lng: number;
  }) {
    const { busId, userId, lat, lng } = params;
    const path = `busReports/${busId}/inside/${userId}`;
    const dbRef = ref(database, path);

    return set(dbRef, {
      lat,
      lng,
      updatedAt: Date.now(),
    });
  }

  static async sendOutsideBusSight(params: {
    busId: string;
    userId: string;
    lat: number;
    lng: number;
  }) {
    const { busId, userId, lat, lng } = params;

    const now = Date.now();
    const ttlMs = 5 * 60 * 1000; // 5 minutos
    const id = now.toString(); // id baseado no timestamp

    const path = `busReports/${busId}/sightings/${id}`;
    const dbRef = ref(database, path);

    return set(dbRef, {
      lat,
      lng,
      createdAt: now,
      expiresAt: now + ttlMs, // daqui a 5 minutos
      userId,
    });
  }

  // 🔍 buscar últimos avistamentos de um ônibus
  static async getLastSightings(params: { busId: string; limit?: number }) {
    const { busId, limit = 5 } = params;

    const sightingsRef = ref(database, `busReports/${busId}/sightings`);
    const q = query(
      sightingsRef,
      orderByChild("createdAt"),
      limitToLast(limit)
    );

    const snapshot = await get(q);

    const result: BusSighting[] = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        const value = child.val();
        result.push({
          id: child.key as string,
          lat: value.lat,
          lng: value.lng,
          createdAt: value.createdAt,
          expiresAt: value.expiresAt,
          userId: value.userId,
        });
      });
    }

    result.sort((a, b) => b.createdAt - a.createdAt);

    return result;
  }
}
