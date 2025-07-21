import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import {
  CreatePartyResponse,
  JoinPartyResponse,
  BoostSongResponse,
} from '@bellybearsings/shared';

// Function references
export const createPartyFunction = httpsCallable<
  { name?: string; hostDisplayName?: string },
  CreatePartyResponse
>(functions, 'createParty');

export const joinPartyFunction = httpsCallable<
  { partyId: string; displayName?: string },
  JoinPartyResponse
>(functions, 'joinParty');

export const boostSongFunction = httpsCallable<
  { partyId: string; songId: string },
  BoostSongResponse
>(functions, 'boostSong');

export const endPartyFunction = httpsCallable<
  { partyId: string },
  { success: boolean }
>(functions, 'endParty');

// Wrapper functions for easier use
export async function createParty(name?: string, hostDisplayName?: string): Promise<CreatePartyResponse> {
  const result = await createPartyFunction({ name, hostDisplayName });
  return result.data;
}

export async function joinParty(partyId: string, displayName?: string): Promise<JoinPartyResponse> {
  const result = await joinPartyFunction({ partyId, displayName });
  return result.data;
}

export async function boostSong(partyId: string, songId: string): Promise<BoostSongResponse> {
  const result = await boostSongFunction({ partyId, songId });
  return result.data;
}

export async function endParty(partyId: string): Promise<boolean> {
  const result = await endPartyFunction({ partyId });
  return result.data.success;
} 