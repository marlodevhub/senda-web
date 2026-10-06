import { callBff } from "@/lib/api/client";

export type GardenZone = { elements: number; stage: 0 | 1 | 2 | 3 | 4 | 5 };

export type Garden = {
  general: GardenZone;
  raices: GardenZone;
  flores: GardenZone;
  ritmo: GardenZone;
  especiales: string[];
};

export async function getGarden(): Promise<Garden> {
  return callBff<Garden>("/api/v1/progress/garden");
}
