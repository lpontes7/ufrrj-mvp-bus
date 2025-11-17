export function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin <= 0) return "agora há pouco";
  if (diffMin === 1) return "há 1 minuto";
  if (diffMin < 60) return `há ${diffMin} minutos`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours === 1) return "há 1 hora";
  return `há ${diffHours} horas`;
}
