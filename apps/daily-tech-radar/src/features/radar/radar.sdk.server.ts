import { DailyTechRadarClient } from "@nextop-os/daily-tech-radar";

export function createRadarClient() {
  const baseUrl = process.env.DAILY_TECH_RADAR_BASE_URL;
  return new DailyTechRadarClient(baseUrl ? { baseUrl } : {});
}
