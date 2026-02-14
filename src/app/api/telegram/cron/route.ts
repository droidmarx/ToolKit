import { NextResponse } from 'next/server';
import { sendTelegramApiRequest } from '@/lib/telegram-api';

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';

export async function GET() {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.error('CRON: TELEGRAM_BOT_TOKEN is not set.');
        return NextResponse.json({ status: 'error', message: 'Bot token not configured.' }, { status: 500 });
    }
    
    if (!chatId) {
        console.error('CRON: TELEGRAM_CHAT_ID is not set. Cannot send scheduled message.');
        return NextResponse.json({ status: 'error', message: 'Target chat ID not configured.' }, { status: 500 });
    }

    const message = `Organize seus materiais verifique oque está faltando e não se esqueça de fazer o pedido: ${MATERIAL_FORM_URL}`;

    try {
        const response = await sendTelegramApiRequest('sendMessage', {
            chat_id: chatId,
            text: message,
        });

        if (response.ok) {
            console.log(`CRON: Successfully sent scheduled message to chat ID ${chatId}`);
            return NextResponse.json({ status: 'ok', message: 'Scheduled message sent.' });
        } else {
            const errorBody = await response.json();
            console.error(`CRON: Failed to send scheduled message.`, errorBody);
            return NextResponse.json({ status: 'error', message: 'Failed to send message via Telegram API.', details: errorBody }, { status: 500 });
        }
    } catch (error) {
        console.error('CRON: An unexpected error occurred.', error);
        return NextResponse.json({ status: 'error', message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
