import { BusLocation } from '../types/bus';

export function formatSubtitle(b: BusLocation) {
  const speed = b.speedKmh != null ? ` • ${b.speedKmh.toFixed(0)} km/h` : '';
  const t = b.updatedAt ? ` • ${timeAgo(b.updatedAt)}` : '';
  return `${b.line ?? 'Linha'}${speed}${t}`;
}

export function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m === 1) return 'há 1 min';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  return `há ${h} h`;
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin <= 0) return 'agora há pouco';
  if (diffMin === 1) return 'há 1 minuto';
  if (diffMin < 60) return `há ${diffMin} minutos`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours === 1) return 'há 1 hora';
  return `há ${diffHours} horas`;
}
