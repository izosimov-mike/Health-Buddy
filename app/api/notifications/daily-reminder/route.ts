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
    const notification = {
      target_fids: [507376],
      notification: {
        title: "Health Buddy Daily Reminder",
        body: "Don't forget to log your daily health activities! 💪",
        target_url: "https://health-buddy.vercel.app",
        uuid: `daily-reminder-${Date.now()}`
      }
    };

    await client.sendNotificationToUsers(notification);

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