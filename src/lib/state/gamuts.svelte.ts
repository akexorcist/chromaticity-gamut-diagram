import { buildGamutState, type GamutKey, type GamutState } from '../data/gamuts';

export const gamuts: GamutState[] = $state(buildGamutState());

export function findGamut(key: GamutKey): GamutState | undefined {
  return gamuts.find((g) => g.key === key);
}

export function setOn(key: GamutKey, on: boolean): void {
  const g = findGamut(key);
  if (g) g.on = on;
}
