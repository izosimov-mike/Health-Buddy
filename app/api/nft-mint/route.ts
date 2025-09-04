import { NextRequest, NextResponse } from 'next/server'
import { db, nftMints, users } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

// GET - Check if user has minted NFT for specific level
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fid = searchParams.get('fid')
    const level = searchParams.get('level')

    console.log('NFT mint check - FID:', fid, 'Level:', level)

    if (!fid || !level) {
      return NextResponse.json(
        { error: 'Missing fid or level parameter' },
        { status: 400 }
      )
    }

    // Find user by FID
    const user = await db.select().from(users).where(eq(users.farcasterFid, fid)).limit(1)
    
    console.log('User found:', user.length > 0 ? user[0].id : 'No user found')
    
    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has minted NFT for this level
    const existingMint = await db
      .select()
      .from(nftMints)
      .where(
        and(
          eq(nftMints.userId, user[0].id),
          eq(nftMints.level, parseInt(level))
        )
      )
      .limit(1)

    console.log('Existing mint check:', {
      userId: user[0].id,
      level: parseInt(level),
      hasMinted: existingMint.length > 0,
      mintData: existingMint[0] || null
    })

    return NextResponse.json({
      hasMinted: existingMint.length > 0,
      mintData: existingMint[0] || null
    })

  } catch (error) {
    console.error('Error checking NFT mint status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Record successful NFT mint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid, level, transactionHash, contractAddress, tokenId } = body

    if (!fid || !level || !transactionHash || !contractAddress || tokenId === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Find user by FID
    const user = await db.select().from(users).where(eq(users.farcasterFid, fid)).limit(1)
    
    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already minted NFT for this level
    const existingMint = await db
      .select()
      .from(nftMints)
      .where(
        and(
          eq(nftMints.userId, user[0].id),
          eq(nftMints.level, parseInt(level))
        )
      )
      .limit(1)

    if (existingMint.length > 0) {
      return NextResponse.json(
        { error: 'NFT already minted for this level', alreadyMinted: true },
        { status: 409 }
      )
    }

    // Record the mint
    const newMint = await db.insert(nftMints).values({
      userId: user[0].id,
      level: parseInt(level),
      transactionHash,
      contractAddress,
      tokenId: parseInt(tokenId),
    }).returning()

    return NextResponse.json({
      success: true,
      mint: newMint[0]
    })

  } catch (error) {
    console.error('Error recording NFT mint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}