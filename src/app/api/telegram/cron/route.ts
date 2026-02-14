import { NextResponse } from 'next/server';
import { sendTelegramApiRequest } from '@/lib/telegram-api';

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';
const MOCK_API_URL = 'https://699107e56279728b0153afac.mockapi.io/Telegran';

type User = {
    id: string;
    chatId: number;
    notificationsEnabled: boolean;
};

export async function GET() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.error('CRON: TELEGRAM_BOT_TOKEN is not set.');
        return NextResponse.json({ status: 'error', message: 'Bot token not configured.' }, { status: 500 });
    }
    
    try {
        console.log('CRON: Fetching users for scheduled messages...');
        const usersResponse = await fetch(MOCK_API_URL);
        if (!usersResponse.ok) {
            const errorBody = await usersResponse.text();
            console.error('CRON: Failed to fetch users from mock API', errorBody);
            return NextResponse.json({ status: 'error', message: 'Failed to fetch users.', details: errorBody }, { status: 500 });
        }

        const users: User[] = await usersResponse.json();
        const subscribedUsers = users.filter(user => user.notificationsEnabled);

        if (subscribedUsers.length === 0) {
            console.log('CRON: No users subscribed for notifications. Job finished.');
            return NextResponse.json({ status: 'ok', message: 'No users to notify.' });
        }
        
        console.log(`CRON: Found ${subscribedUsers.length} subscribed users. Sending messages...`);

        const message = `Organize seus materiais verifique oque está faltando e não se esqueça de fazer o pedido: ${MATERIAL_FORM_URL}`;
        
        const sendPromises = subscribedUsers.map(user => 
            sendTelegramApiRequest('sendMessage', {
                chat_id: user.chatId,
                text: message,
            })
        );

        const results = await Promise.allSettled(sendPromises);
        
        let successCount = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                successCount++;
            } else {
                const chatId = subscribedUsers[index].chatId;
                console.error(`CRON: Failed to send message to chat ID ${chatId}`, result.status === 'rejected' ? result.reason : 'Telegram API error');
            }
        });

        console.log(`CRON: Finished sending messages. Success: ${successCount}/${subscribedUsers.length}`);
        return NextResponse.json({ status: 'ok', message: `Sent messages to ${successCount} of ${subscribedUsers.length} users.` });

    } catch (error) {
        console.error('CRON: An unexpected error occurred.', error);
        return NextResponse.json({ status: 'error', message: 'An unexpected error occurred.' }, { status: 500 });
    }
}
