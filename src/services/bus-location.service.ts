// src/services/bus-location.service.ts
import {
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  limitToLast,
  onValue,
} from 'firebase/database';
import { db } from '../config/firebase';
import {
  BusLiveShare,
  BusSighting,
  GetLastSightingsParams,
  SendInsideBusLocationParams,
  SendOutsideBusSightParams,
} from '../types/bus';

export class BusLocationService {
  // 🔹 lista os últimos avistamentos (pontos fixos)
  static async getLastSightings({
    busId,
    limit,
  }: GetLastSightingsParams): Promise<BusSighting[]> {
    const baseRef = ref(db, `buses/${busId}/sightings`);

    // usa o limite pedido ou um default mais folgado
    const maxToFetch = limit ?? 20;

    const q = query(baseRef, orderByChild('createdAt'), limitToLast(maxToFetch));

    const snap = await get(q);

    if (!snap.exists()) return [];

    const data = snap.val() as Record<string, any>;

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000; // 1 hora

    const items: BusSighting[] = Object.entries(data)
      .map(([id, value]) => ({
        id,
        busId,
        userId: value.userId,
        lat: value.lat,
        lng: value.lng,
        createdAt: value.createdAt,
        expiresAt: value.expiresAt,
        direction: value.direction ?? null,
      }))
      // mantém só o que:
      // - NÃO expirou (expiresAt > agora) OU não tem expiresAt
      // - E foi criado na última 1 hora
      .filter((s) => {
        const createdAt = Number(s.createdAt);
        if (Number.isNaN(createdAt)) return false;

        const notExpired = !s.expiresAt || s.expiresAt > now;
        const withinLastHour = createdAt >= oneHourAgo;

        return notExpired && withinLastHour;
      })
      // mais recentes primeiro
      .sort((a, b) => b.createdAt - a.createdAt)
      // garante no máximo `limit` ou 10
      .slice(0, limit ?? 10);

    return items;
  }

  // 🔹 marcar "vi o ônibus aqui" (fora do ônibus)
  static async sendOutsideBusSight({
    busId,
    userId,
    lat,
    lng,
    direction,
  }: SendOutsideBusSightParams): Promise<void> {
    const sightingsRef = ref(db, `buses/${busId}/sightings`);
    const newRef = push(sightingsRef);

    const now = Date.now();

    console.log('[BusLocationService] sendOutsideBusSight', {
      busId,
      userId,
      lat,
      lng,
      direction,
      createdAt: now,
    });

    await set(newRef, {
      busId,
      userId,
      lat,
      lng,
      direction,
      createdAt: now,
      // se quiser "forçar" expiração lógica em 1h:
      expiresAt: now + 60 * 60 * 1000,
    });
  }

  // 🔹 compartilhar localização em tempo real (dentro do ônibus)
  static async sendInsideBusLocation({
    busId,
    userId,
    lat,
    lng,
  }: SendInsideBusLocationParams): Promise<void> {
    const shareRef = ref(db, `buses/${busId}/liveShares/${userId}`);

    const now = Date.now();

    console.log('[BusLocationService] sendInsideBusLocation', {
      busId,
      userId,
      lat,
      lng,
      updatedAt: now,
    });

    await set(shareRef, {
      userId,
      lat,
      lng,
      updatedAt: now,
      isActive: true,
    });
  }

  static async stopLiveShare(params: { busId: string; userId: string }): Promise<void> {
    const { busId, userId } = params;
    const shareRef = ref(db, `buses/${busId}/liveShares/${userId}`);

    const now = Date.now();

    await set(shareRef, {
      userId,
      lat: null,
      lng: null,
      updatedAt: now,
      isActive: false, // 👈 marca como inativo
    });
  }

  // 🔹 listener em tempo real de TODOS os compartilhamentos ativos pra um busId
  static listenToLiveShares(
    busId: string,
    callback: (shares: BusLiveShare[]) => void,
  ): () => void {
    const rootRef = ref(db, `buses/${busId}/liveShares`);

    console.log('[BusLocationService] listenToLiveShares init', { busId });

    const unsubscribe = onValue(rootRef, (snapshot) => {
      const value = snapshot.val() as Record<string, any> | null;

      if (!value) {
        console.log('[BusLocationService] listenToLiveShares: vazio');
        callback([]);
        return;
      }

      const now = Date.now();

      const shares: BusLiveShare[] = Object.entries(value)
        .map(([id, data]) => ({
          id,
          userId: data.userId,
          lat: data.lat,
          lng: data.lng,
          updatedAt: data.updatedAt,
          isActive: data.isActive, // se quiser tipar isso depois
        }))
        // só quem está ativo E (opcional) atualizou nos últimos 15 min
        .filter(
          (s) =>
            s.isActive !== false && (!s.updatedAt || now - s.updatedAt < 15 * 60 * 1000),
        );

      console.log('[BusLocationService] listenToLiveShares: recebidos', shares.length);

      callback(shares);
    });

    return () => unsubscribe();
  }
}
