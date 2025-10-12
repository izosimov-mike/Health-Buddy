# 🧪 Divvi Integration Testing Guide

> Complete guide for testing Divvi referral tracking in Health Buddy

## 📋 Prerequisites

Before testing, ensure you have:

- ✅ Wallet with test funds on Base and Celo networks
- ✅ Farcaster account for MiniApp access
- ✅ Development environment running (`pnpm dev`)
- ✅ Browser with MetaMask or compatible wallet

## 🔧 Setup

### 1. Install Dependencies

```bash
# Install Divvi SDK (already done)
pnpm add @divvi/referral-sdk

# Verify installation
pnpm list @divvi/referral-sdk
```

### 2. Verify Configuration

Check that `lib/divvi-utils.ts` contains:

```typescript
export const DIVVI_CONSUMER_ADDRESS = '0xE27d9E71A92eb928D033194987be22998b336068'
```

### 3. Get Test Funds

**For Base Network:**
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goeroi-faucet
- Bridge: https://bridge.base.org

**For Celo Network:**
- Faucet: https://faucet.celo.org
- Or use Celo Alfajores testnet

## 🧪 Test Cases

### Test 1: NFT Minting with Divvi Tracking

**Objective**: Verify referral tag is added to NFT mint transaction

**Steps:**
1. Open Health Buddy app
2. Connect your wallet
3. Complete actions to reach a new level (e.g., Level 2)
4. Click "Mint Achievement NFT" button
5. Approve transaction in wallet
6. Wait for confirmation

**Verification:**
```javascript
// Open browser console and check logs:
console.log('Call data with Divvi tracking:', callDataWithReferral)

// The calldata should end with the referral tag
// Format: 0x[original_data][divvi_referral_tag]
```

**Expected Result:**
- ✅ Transaction includes referral tag at end of calldata
- ✅ Console shows: "🔗 Generated Divvi referral tag"
- ✅ Console shows: "✅ Successfully submitted referral to Divvi"
- ✅ NFT minted successfully

**Check on-chain:**
```
https://basescan.org/tx/[YOUR_TX_HASH]
```
Look at "Input Data" - should see referral tag appended

---

### Test 2: Base Network Check-in

**Objective**: Verify referral tracking on Base check-in

**Steps:**
1. Ensure you haven't checked in today
2. Click "Check In on Base" button
3. Approve transaction (0.000001 ETH)
4. Wait for confirmation

**Verification:**
```javascript
// Browser console should show:
'Sending Base transaction...'
'Call data with Divvi tracking:', dataWithReferral
'Base transaction sent successfully'
'✅ Successfully submitted referral to Divvi'
```

**Expected Result:**
- ✅ Transaction data includes checkIn signature + referral tag
- ✅ Check-in recorded in database
- ✅ Divvi receives transaction info

**Check on-chain:**
```
https://basescan.org/tx/[YOUR_TX_HASH]
```

---

### Test 3: Celo Network Check-in

**Objective**: Verify cross-chain referral tracking on Celo

**Steps:**
1. Click "Check In on Celo" button
2. Wallet switches to Celo network
3. Approve transaction (0.01 CELO)
4. Wait for confirmation

**Verification:**
```javascript
// Browser console logs:
'Sending Celo transaction...'
'Celo transaction sent successfully'
'✅ Successfully submitted referral to Divvi'
```

**Expected Result:**
- ✅ Network switches to Celo automatically
- ✅ Transaction includes referral tag
- ✅ Divvi tracks cross-chain transaction

**Check on-chain:**
```
https://celoscan.io/tx/[YOUR_TX_HASH]
```

---

### Test 4: Token Transfer

**Objective**: Test referral tracking on simple transfers

**Steps:**
1. Navigate to TransactionSender component
2. Enter recipient address (test address)
3. Enter amount (e.g., 0.001 CELO)
4. Click "Send Transaction"
5. Approve in wallet

**Verification:**
```javascript
// Console should show:
'🔗 Generated Divvi referral tag:'
'Транзакция отправлена с Divvi tracking!'
'✅ Successfully submitted referral to Divvi'
```

**Expected Result:**
- ✅ Transfer includes referral tag
- ✅ Toast notification shows "с Divvi tracking"
- ✅ Divvi receives attribution data

---

## 🔍 Debugging

### Check Referral Tag Generation

Add this to your browser console:

```javascript
// Test tag generation
import { generateDivviReferralTag } from '@/lib/divvi-utils'

const userAddress = '0xYourAddress...'
const tag = generateDivviReferralTag(userAddress)
console.log('Generated tag:', tag)
```

### Verify Tag Format

Referral tags should be hex strings like:
```
0x[64_hex_chars]
```

### Check Divvi Submission

Monitor network tab in browser DevTools:
- Look for POST requests to Divvi API
- Check response status (should be 200)

### Common Issues

**Issue 1: "Error generating Divvi referral tag"**
```typescript
// Solution: Check that address is valid
if (!address || !address.startsWith('0x')) {
  console.error('Invalid address:', address)
}
```

**Issue 2: Tag not appearing in transaction data**
```typescript
// Solution: Verify appendReferralTag is called
const dataWithReferral = appendReferralTag(baseData, userAddress)
console.log('Original data:', baseData)
console.log('With referral:', dataWithReferral)
```

**Issue 3: Divvi submission fails**
```typescript
// Solution: Check network and chainId
console.log('Chain ID:', chainId)
console.log('Transaction hash:', txHash)
```

---

## 📊 Verify on Divvi Dashboard

### Access Divvi Analytics

1. Visit Divvi Dashboard (URL from Divvi team)
2. Enter your consumer address:
   ```
   0xE27d9E71A92eb928D033194987be22998b336068
   ```
3. View referral statistics

### What to Check

- **Total Transactions**: Should match your test transactions
- **Networks**: Should show Base and Celo
- **Referral Count**: Should increment with each transaction
- **User Attribution**: Check if user addresses are tracked

---

## 🧪 Automated Testing Script

Create a test script to verify integration:

```typescript
// test/divvi-integration.test.ts
import { generateDivviReferralTag, appendReferralTag } from '@/lib/divvi-utils'

describe('Divvi Integration', () => {
  const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  
  test('generates valid referral tag', () => {
    const tag = generateDivviReferralTag(testAddress)
    expect(tag).toMatch(/^0x[0-9a-f]+$/i)
    expect(tag.length).toBeGreaterThan(2)
  })
  
  test('appends tag to empty data', () => {
    const result = appendReferralTag(undefined, testAddress)
    expect(result).toMatch(/^0x[0-9a-f]+$/i)
  })
  
  test('appends tag to existing data', () => {
    const originalData = '0x183ff085' as `0x${string}`
    const result = appendReferralTag(originalData, testAddress)
    expect(result).toContain('183ff085')
    expect(result.length).toBeGreaterThan(originalData.length)
  })
})
```

Run tests:
```bash
pnpm test divvi-integration
```

---

## 📝 Test Checklist

Use this checklist when testing:

- [ ] NFT Mint transaction includes referral tag
- [ ] Base check-in transaction includes referral tag
- [ ] Celo check-in transaction includes referral tag
- [ ] Token transfer includes referral tag
- [ ] All transactions submitted to Divvi successfully
- [ ] Console logs show successful tag generation
- [ ] Console logs show successful Divvi submission
- [ ] No errors in browser console
- [ ] Transactions visible on block explorers
- [ ] Referral data visible on Divvi dashboard

---

## 🚀 Production Testing

### Pre-deployment

Before deploying to production:

1. **Test on all networks:**
   - [ ] Base Mainnet
   - [ ] Celo Mainnet

2. **Test all transaction types:**
   - [ ] NFT minting
   - [ ] Check-ins (both networks)
   - [ ] Token transfers

3. **Verify error handling:**
   - [ ] Test with invalid addresses
   - [ ] Test with network disconnection
   - [ ] Test with failed transactions

### Post-deployment

After deploying:

1. Monitor first 100 transactions
2. Check Divvi dashboard for attribution data
3. Verify no console errors in production
4. Confirm all transaction types tracked

---

## 📞 Support

If you encounter issues:

1. **Check Browser Console**: Look for error messages
2. **Check Network Tab**: Verify API calls to Divvi
3. **Check Block Explorer**: Verify transaction data includes tag
4. **Contact Divvi**: If submission fails consistently

### Useful Links

- **Divvi Documentation**: https://docs.divvi.xyz
- **Base Explorer**: https://basescan.org
- **Celo Explorer**: https://celoscan.io
- **Health Buddy Repo**: https://github.com/izosimov-mike/Health-Buddy

---

## 🎯 Success Metrics

Integration is successful when:

- ✅ 100% of transactions include referral tags
- ✅ 95%+ of transactions submitted to Divvi successfully
- ✅ No user-facing errors
- ✅ Tags visible in on-chain transaction data
- ✅ Referral attribution tracked in Divvi dashboard

---

**Last Updated**: 2025-01-12  
**Divvi SDK Version**: Latest  
**Consumer Address**: `0xE27d9E71A92eb928D033194987be22998b336068`

