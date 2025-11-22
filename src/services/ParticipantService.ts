import { Party, Participant } from '../persistence';
import { functionsService } from '@bellybearsings/firebase-config';

export class ParticipantService {
  /**
   * Validates that a party exists and is active for participants to join
   */
  static async validatePartyForJoining(partyCode: string): Promise<{
    isValid: boolean;
    party?: Party;
    error?: string;
  }> {

    try {
      const party = await Party.findByCode(partyCode);

      if (!party) {
        return {
          isValid: false,
          error: 'Party not found. Please check the party code.',
        };
      }

      if (!party.isActive) {
        return {
          isValid: false,
          party,
          error: 'This party is not currently active.',
        };
      }

      if (party.hasEnded) {
        return {
          isValid: false,
          party,
          error: 'This party has ended.',
        };
      }

      return {
        isValid: true,
        party,
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'An error occurred while validating the party. Please try again.',
      };
    }
  }

  /**
   * Joins a user to a party as a guest
   */
  static async joinParty(
    partyId: string,
    userProfile: {
      userId: string;
      displayName: string;
      email?: string;
      profilePicture?: string;
    }
  ): Promise<{
    success: boolean;
    participant?: Participant;
    error?: string;
  }> {

    try {
      // Call Cloud Function to join party
      const result = await functionsService.joinParty(partyId);

      if (!result.success) {
        return {
          success: false,
          error: 'Failed to join party',
        };
      }

      // Fetch the participant record to return
      const participant = await Participant.findByUserAndParty(userProfile.userId, partyId);

      if (!participant) {
        // Should not happen if cloud function succeeded
        return {
          success: false,
          error: 'Joined party but could not retrieve participant record',
        };
      }

      return {
        success: true,
        participant,
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to join party. Please try again.',
      };
    }
  }

  /**
   * Leaves a party (marks participant as left but keeps record)
   */
  static async leaveParty(userId: string, partyId: string): Promise<{
    success: boolean;
    error?: string;
  }> {

    try {
      const participant = await Participant.findByUserAndParty(userId, partyId);

      if (!participant) {
        return {
          success: false,
          error: 'You are not a member of this party.',
        };
      }

      if (participant.leftAt) {
        return {
          success: true, // Already left
        };
      }

      // Mark participant as left
      participant.leave();
      await participant.save();

      // Remove from party participants list
      const party = await Party.getPartyById(partyId);
      if (party && party.participants.includes(userId)) {
        party.removeParticipant(userId);
        await party.save();
      }

      return {
        success: true,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to leave party. Please try again.',
      };
    }
  }

  /**
   * Gets participant information for a user in a party
   */
  static async getParticipantInfo(userId: string, partyId: string): Promise<Participant | null> {
    return Participant.findByUserAndParty(userId, partyId);
  }

  /**
   * Gets all active participants in a party
   */
  static async getPartyParticipants(partyId: string): Promise<Participant[]> {
    return Participant.findActiveByParty(partyId);
  }

  /**
   * Uses a boost for a user in a party
   */
  static async useBoost(userId: string, partyId: string): Promise<{
    success: boolean;
    boostsRemaining?: number;
    error?: string;
  }> {

    try {
      const participant = await Participant.findByUserAndParty(userId, partyId);

      if (!participant) {
        return {
          success: false,
          error: 'You are not a member of this party.',
        };
      }

      if (!participant.hasBoostsLeft) {
        return {
          success: false,
          error: 'You have no boosts remaining.',
        };
      }

      participant.useBoost();
      await participant.save();

      return {
        success: true,
        boostsRemaining: participant.boostsRemaining,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to use boost. Please try again.',
      };
    }
  }
} 