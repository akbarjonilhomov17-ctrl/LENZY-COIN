import { LEAGUES } from './constants';
import { League } from '../types';

export function getCurrentLeague(coins: number): League {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (coins >= LEAGUES[i].minCoins) {
      return LEAGUES[i];
    }
  }
  return LEAGUES[0];
}

export function getNextLeague(currentLeagueId: string): League | null {
  const currentIndex = LEAGUES.findIndex(l => l.id === currentLeagueId);
  if (currentIndex >= 0 && currentIndex < LEAGUES.length - 1) {
    return LEAGUES[currentIndex + 1];
  }
  return null;
}

export function calculateBoostCost(baseCost: number, multiplier: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(multiplier, currentLevel - 1));
}
