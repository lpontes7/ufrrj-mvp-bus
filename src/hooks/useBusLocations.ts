import { useEffect, useState } from "react";
import type { BusLocation } from "../types/bus";

/**
 * Hook responsável por fornecer as posições dos ônibus.
 * Neste exemplo é apenas um mock que atualiza a cada 5 segundos.
 * Em produção, aqui entraria a integração com Firebase ou sua API.
 */
export function useBusLocations() {
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    try {
      // Simula carregamento inicial
      setTimeout(() => {
        setBuses([
          {
            id: "bus-01",
            lat: -22.756,
            lng: -43.691,
            line: "Circular Campus",
            updatedAt: Date.now(),
            speedKmh: 28,
          },
          {
            id: "bus-02",
            lat: -22.752,
            lng: -43.685,
            line: "Engenharia → Central",
            updatedAt: Date.now(),
            speedKmh: 32,
          },
        ]);
        setIsLoading(false);
      }, 1000);

      // Simula atualização de posição a cada 5 segundos
      interval = setInterval(() => {
        setBuses((prev) =>
          prev.map((bus) => ({
            ...bus,
            lat: bus.lat + (Math.random() - 0.5) * 0.001,
            lng: bus.lng + (Math.random() - 0.5) * 0.001,
            updatedAt: Date.now(),
            speedKmh: 20 + Math.random() * 15,
          }))
        );
      }, 5000);
    } catch (err) {
      console.error(err);
      setError("Falha ao obter dados dos ônibus.");
      setIsLoading(false);
    }

    return () => clearInterval(interval);
  }, []);

  return { buses, isLoading, error };
}
