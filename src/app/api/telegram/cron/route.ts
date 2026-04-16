import { NextResponse } from 'next/server';
import { sendTelegramApiRequest } from '@/lib/telegram-api';

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';
const MOCK_API_URL = 'https://699107e56279728b0153afac.mockapi.io/Telegran';

type User = {
    id: string;
    chatId: number;
    notificationsEnabled: boolean;
    notificationDay?: number;
    notificationHour?: number;
};

export async function GET() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.error('CRON: TELEGRAM_BOT_TOKEN is not set.');
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    try {
        const now = new Date();

        const currentDay = now.getDay(); // 0-6
        const currentHour = now.getHours(); // 0-23

        console.log(`CRON: Rodando para dia ${currentDay} hora ${currentHour}`);

        const usersResponse = await fetch(MOCK_API_URL);
        const users: User[] = await usersResponse.json();

        const filteredUsers = users.filter(user =>
            user.notificationsEnabled &&
            user.notificationDay === currentDay &&
            user.notificationHour === currentHour
        );

        if (filteredUsers.length === 0) {
            console.log('CRON: Nenhum usuário para notificar agora.');
            return NextResponse.json({ status: 'ok' });
        }

        const message = `Organize seus materiais e faça seu pedido: ${MATERIAL_FORM_URL}`;

        const sendPromises = filteredUsers.map(user =>
            sendTelegramApiRequest('sendMessage', {
                chat_id: user.chatId,
                text: message,
            })
        );

        await Promise.allSettled(sendPromises);

        console.log(`CRON: Mensagens enviadas para ${filteredUsers.length} usuários`);

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}