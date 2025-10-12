/**
 * Divvi Referral Tracking Utilities
 * Consumer Address: 0xE27d9E71A92eb928D033194987be22998b336068
 */

import { getReferralTag, submitReferral } from '@divvi/referral-sdk';
import type { Hex } from 'viem';

// Your Divvi Consumer Address
export const DIVVI_CONSUMER_ADDRESS = '0xE27d9E71A92eb928D033194987be22998b336068' as const;

/**
 * Generate a referral tag for a user's transaction
 * @param userAddress - The address of the user making the transaction
 * @returns The referral tag to be appended to transaction data
 */
export function generateDivviReferralTag(userAddress: string): Hex {
  try {
    const referralTag = getReferralTag({
      user: userAddress as Hex,
      consumer: DIVVI_CONSUMER_ADDRESS,
    });
    
    console.log('🔗 Generated Divvi referral tag:', referralTag);
    return referralTag as Hex;
  } catch (error) {
    console.error('Error generating Divvi referral tag:', error);
    return '0x' as Hex; // Return empty hex if error
  }
}

/**
 * Submit a transaction to Divvi for referral tracking
 * @param txHash - The transaction hash
 * @param chainId - The chain ID where the transaction was sent
 */
export async function submitDivviReferral(
  txHash: string,
  chainId: number
): Promise<void> {
  try {
    await submitReferral({
      txHash: txHash as Hex,
      chainId,
    });
    
    console.log('✅ Successfully submitted referral to Divvi:', {
      txHash,
      chainId,
    });
  } catch (error) {
    console.error('❌ Error submitting referral to Divvi:', error);
    // Don't throw - we don't want to break the main transaction flow
  }
}

/**
 * Append referral tag to existing transaction data
 * @param originalData - The original transaction data (can be undefined)
 * @param userAddress - The user's address
 * @returns Combined data with referral tag
 */
export function appendReferralTag(
  originalData: Hex | undefined,
  userAddress: string
): Hex {
  const referralTag = generateDivviReferralTag(userAddress);
  
  if (!originalData || originalData === '0x') {
    return referralTag;
  }
  
  return (originalData + referralTag.slice(2)) as Hex;
}

