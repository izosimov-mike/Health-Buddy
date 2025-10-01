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

    // Отправка персонального уведомления пользователю FID 507376
    // Используем publishCast для отправки сообщения с упоминанием пользователя
    // Примечание: publishCast публикует в общий фид, но упоминание @507376 уведомит пользователя
    
    const message = {
      signerUuid: process.env.NEYNAR_SIGNER_UUID!,
      text: `@507376 Don't forget to log your daily health activities! 💪 Check your progress at https://health-buddy.vercel.app`,
      embeds: [{
        url: "https://health-buddy.vercel.app"
      }]
    };

    await client.publishCast(message);

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent successfully',
      targetFid: 507376,
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