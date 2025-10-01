import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

export async function GET(request: NextRequest) {
  // Проверка авторизации cron job
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Инициализация Neynar SDK
    const client = new NeynarAPIClient({
      apiKey: process.env.NEYNAR_API_KEY!,
    });

    // Отправка уведомления пользователю FID 507376
    const message = {
      body: {
        signer_uuid: process.env.NEYNAR_SIGNER_UUID!,
        text: "Don't forget to log your daily health activities! 💪 Check your progress at https://health-buddy.vercel.app",
        embeds: [{
          url: "https://health-buddy.vercel.app"
        }]
      }
    };

    await client.publishMessageToFarcaster(message);

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' }, 
      { status: 500 }
    );
  }
}