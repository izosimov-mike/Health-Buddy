import { NextRequest, NextResponse } from 'next/server'
import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || '1'
    const levelName = searchParams.get('levelName') || 'Beginner'
    const totalPoints = searchParams.get('totalPoints') || '0'
    const username = searchParams.get('username') || 'Health Buddy User'

    // Create canvas
    const canvas = createCanvas(800, 600)
    const ctx = canvas.getContext('2d')

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600)
    gradient.addColorStop(0, '#8B5CF6') // Purple
    gradient.addColorStop(1, '#EC4899') // Pink
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    // Load and draw level image
    try {
      const levelImagePath = path.join(process.cwd(), 'public', 'images', `${level}_${levelName.replace(' ', '_')}.png`)
      if (fs.existsSync(levelImagePath)) {
        const levelImage = await loadImage(levelImagePath)
        // Draw level image in center-top
        const imageSize = 150
        ctx.drawImage(levelImage, (800 - imageSize) / 2, 80, imageSize, imageSize)
      }
    } catch (error) {
      console.error('Error loading level image:', error)
    }

    // Set text properties
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'

    // Draw title
    ctx.font = 'bold 48px Arial'
    ctx.fillText('Health Buddy', 400, 280)

    // Draw level name
    ctx.font = 'bold 36px Arial'
    ctx.fillText(levelName, 400, 330)

    // Draw total points
    ctx.font = 'bold 32px Arial'
    ctx.fillText(`${totalPoints} Total Points`, 400, 380)

    // Draw username
    ctx.font = '24px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillText(username, 400, 420)

    // Draw call to action
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText('Join me in turning wellness into a game!', 400, 480)

    // Draw app info
    ctx.font = '20px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText('Daily check-ins • Healthy actions • Progress tracking', 400, 520)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating share image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}