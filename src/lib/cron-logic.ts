import { sendTelegramApiRequest } from './telegram-api';

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';
const MOCK_API_URL = 'https://699107e56279728b0153afac.mockapi.io/Telegran';

type User = {
    id: string;
    chatId: number;
    notificationsEnabled: boolean;
    notificationDay?: number;
    notificationHour?: number;
    notificationMinute?: number;
    lastNotificationSent?: string;
};

export async function runCronJob(force: boolean = false) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN is not set.');
    }

    const now = new Date();

    // TIMEZONE SÃO PAULO
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    });

    const parts = formatter.formatToParts(now);

    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const weekdayPart = parts.find(p => p.type === 'weekday');

    const currentHour = Number(hourPart?.value);
    const currentMinute = Number(minutePart?.value);

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

    console.log(`CRON (SP): Dia ${currentDay} (${weekdayClean}) Hora ${currentHour}:${currentMinute}`);

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

    const filteredUsers = users.filter(user => {
        if (!user.notificationsEnabled || user.notificationDay !== currentDay || user.lastNotificationSent === today) {
            return false;
        }

        if (force) return true;

        // Se o usuário não tem minuto definido, assume 0
        const userHour = user.notificationHour || 0;
        const userMinute = user.notificationMinute || 0;

        // Com o cron rodando a cada 5 minutos, verificamos se a hora bate 
        // e se o minuto atual é maior ou igual ao agendado.
        // Como marcamos como enviado, ele só vai disparar na primeira execução que atender isso.
        return currentHour === userHour && currentMinute >= userMinute;
    });

    if (filteredUsers.length === 0) {
        console.log('CRON: Nenhum usuário para notificar agora.');
        return { status: 'ok', sentCount: 0 };
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
    return { status: 'ok', sentCount: filteredUsers.length };
}
