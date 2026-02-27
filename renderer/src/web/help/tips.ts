import { TipsFrequency } from "../Config";

export const TIP_COUNT = 29; // v0.7.0

export function randomTip(): number {
  // random from 1 to TIP_COUNT
  return Math.floor(Math.random() * TIP_COUNT) + 1;
}

// Use literal keys to avoid circular import (Config → widget-registry → PriceCheckWindow → CheckedItem → tips → Config)
export const TIP_FREQUENCY_MAP: Record<TipsFrequency, number> = {
  1: 1,   // Always
  2: 7,   // MoreOften
  3: 20,  // Normal
  4: 50,  // Rarely
  5: 100, // VeryRarely
  6: -1,  // Never
};
