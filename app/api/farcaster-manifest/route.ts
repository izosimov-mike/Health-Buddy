import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), 'public', '.well-known', 'farcaster.json')
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)
    
    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving Farcaster manifest:', error)
    return NextResponse.json(
      { error: 'Manifest not found' },
      { status: 404 }
    )
  }
}