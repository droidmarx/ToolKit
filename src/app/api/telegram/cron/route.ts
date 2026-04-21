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
    lastNotificationSent?: string;
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        console.error('CRON: TELEGRAM_BOT_TOKEN is not set.');
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    try {
        const now = new Date();

        // TIMEZONE SÃO PAULO
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            weekday: 'short',
            hour: 'numeric',
            hour12: false,
        });

        const parts = formatter.formatToParts(now);

        const hourPart = parts.find(p => p.type === 'hour');
        const weekdayPart = parts.find(p => p.type === 'weekday');

        const currentHour = Number(hourPart?.value);

        const diasMap: Record<string, number> = {
            dom: 0,
            seg: 1,
            ter: 2,
            qua: 3,
            qui: 4,
            sex: 5,
            sáb: 6,
        };

        // Remove pontos ou caracteres especiais que o Intl pode retornar (ex: "ter.")
        const weekdayClean = weekdayPart?.value.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúç]/g, '') || 'dom';
        const currentDay = diasMap[weekdayClean];

        console.log(`CRON (SP): Dia ${currentDay} (${weekdayClean}) Hora ${currentHour}`);

        const usersResponse = await fetch(MOCK_API_URL);
        const users: User[] = await usersResponse.json();

        // Hoje no fuso de SP
        const today = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(now).split('/').reverse().join('-');

        if (force) {
            console.log('CRON: MODO FORCE ATIVADO - Ignorando verificação de hora.');
        }

        const filteredUsers = users.filter(user =>
            user.notificationsEnabled &&
            user.notificationDay === currentDay &&
            (force || user.notificationHour === currentHour) &&
            user.lastNotificationSent !== today
        );

        if (filteredUsers.length === 0) {
            console.log('CRON: Nenhum usuário para notificar agora.');
            return NextResponse.json({ status: 'ok' });
        }

        const message = `Hoje é dia de pedir material, revise tudo o que está faltando e não esqueça de pedir: ${MATERIAL_FORM_URL}`;

        for (const user of filteredUsers) {
            await sendTelegramApiRequest('sendMessage', {
                chat_id: user.chatId,
                text: message,
            });

            // MARCA COMO ENVIADO
            await fetch(`${MOCK_API_URL}/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lastNotificationSent: today
                }),
            });
        }

        console.log(`CRON: Mensagens enviadas para ${filteredUsers.length} usuários`);

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}