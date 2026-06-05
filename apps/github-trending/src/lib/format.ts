export function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }

  return String(value);
}

export function formatDelta(value: number) {
  return `+${value}`;
}

export function formatStarsGained(value: number) {
  return `+${formatCompactNumber(value)}`;
}

export function formatRange(value: string) {
  if (value === "daily") {
    return "Today";
  }

  if (value === "weekly") {
    return "Week";
  }

  return "Month";
}

export function formatUtcTime(value: string) {
  const date = new Date(value);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes} UTC`;
}
