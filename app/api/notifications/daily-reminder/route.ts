import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

export async function GET(request: NextRequest) {
  // Проверка авторизации cron job
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Инициализация Neynar SDK v3
    const config = new Configuration({
      apiKey: process.env.NEYNAR_API_KEY!,
      baseOptions: {
        headers: {
          "x-neynar-experimental": true,
        },
      },
    });
    const client = new NeynarAPIClient(config);

    // Отправка персонального уведомления пользователю FID 507376
    // Используем publishFrameNotifications - правильный метод для Mini-App уведомлений
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    await client.publishFrameNotifications({
      targetFids: [507376], // отправляем конкретному пользователю
      notification: {
        title: "Daily health activities reminder",
        body: "Don't forget to log your daily health activities! 💪",
        target_url: "https://health-buddy-seven.vercel.app/"
      }
    });
    
    console.log(`📢 Daily reminder sent to user FID 507376 via publishFrameNotifications`);
    console.log(`Notification ID: daily-reminder-${today}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Daily reminder sent successfully via publishFrameNotifications',
      targetFid: 507376,
      method: 'publishFrameNotifications',
      notificationId: `daily-reminder-${today}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Если нет signer UUID, возвращаем информацию о том, что нужно его настроить
    if (errorMessage.includes('signer') || errorMessage.includes('PaymentRequired')) {
      return NextResponse.json(
        { 
          error: 'NEYNAR_SIGNER_UUID required. Please create a signer in Neynar dashboard or upgrade to paid plan.',
          details: 'Visit https://neynar.com/dashboard to create a signer or upgrade your plan.'
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send notification', details: errorMessage }, 
      { status: 500 }
    );
  }
}