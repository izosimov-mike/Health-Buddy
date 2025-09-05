import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || '1'
    const levelName = searchParams.get('levelName') || 'Beginner'
    const totalPoints = searchParams.get('totalPoints') || '0'
    const username = searchParams.get('username') || 'Health Buddy User'

    // Create SVG content
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="800" height="600" fill="url(#bg)" />
        
        <!-- Level badge -->
        <circle cx="400" cy="150" r="60" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="3" />
        <text x="400" y="160" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">${level}</text>
        
        <!-- Title -->
        <text x="400" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Health Buddy</text>
        
        <!-- Level name -->
        <text x="400" y="330" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="36" font-weight="bold">${levelName}</text>
        
        <!-- Total points -->
        <text x="400" y="380" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">${totalPoints} Total Points</text>
        
        <!-- Username -->
        <text x="400" y="420" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24">${username}</text>
        
        <!-- Call to action -->
        <text x="400" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="bold">Join me in turning wellness into a game!</text>
        
        <!-- App info -->
        <text x="400" y="520" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="20">Daily check-ins • Healthy actions • Progress tracking</text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating share image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}