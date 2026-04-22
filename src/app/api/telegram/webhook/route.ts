'use server';

import { NextResponse } from 'next/server';
import { sendTelegramApiRequest } from '@/lib/telegram-api';

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';
const GOOGLE_MAPS_URL = 'https://goo.gl/maps/88VJ2ZpSiy4F2Qas7?g_st=aw';
const SITE_URL_TOP_DRAB = 'https://top-drab.vercel.app/';
const QR_CODE_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${SITE_URL_TOP_DRAB}`;
const SITE_URL_TOOL_KIT_ONE = 'https://tool-kit-one.vercel.app/';
const SITE_URL_GPON_EPON = 'https://gpon-epon.vercel.app/';
const MOCK_API_URL = 'https://699107e56279728b0153afac.mockapi.io/Telegran';

type User = {
    id: string;
    chatId: number;
    notificationsEnabled: boolean;
    notificationDay?: number;
    notificationHour?: number;
    notificationMinute?: number;
    lastNotificationSent?: string;
    latitude?: number;
    longitude?: number;
};

const dias = [
    'Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'
];

const horas = Array.from({ length: 24 }, (_, i) => i);

async function findUserByChatId(chatId: number): Promise<User | null> {
    const res = await fetch(`${MOCK_API_URL}?chatId=${chatId}`);
    if (!res.ok) return null;
    const users = await res.json();
    return users.length > 0 ? users[0] : null;
}

async function ensureUserExists(chatId: number): Promise<User> {
    const user = await findUserByChatId(chatId);
    if (user) return user;

    const res = await fetch(MOCK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chatId,
            notificationsEnabled: false,
        }),
    });
    return await res.json();
}

// MENU
async function sendMainMenu(chatId: number) {
    await sendTelegramApiRequest('sendMessage', {
        chat_id: chatId,
        text: '👇 Menu principal',
        reply_markup: {
            keyboard: [
                ['📄 Pedido de material', '🗺 Mapa de CTO'],
                ['📲 Painel de ferramentas', '🧠 GPON / EPON (EliasFausto)'],
                ['📷 QRcode de Avaliação'],
                [
                    { text: '📍 Quais minhas coordenadas', request_location: true },
                    { text: '🔔 Ativar lembrete de materiais' }
                ],
            ],
            resize_keyboard: true,
        },
    });
}

// SETUP NOTIFICAÇÕES
async function promptNotificationSetup(chatId: number, statusMsg?: string) {
    const msg = statusMsg || '⚠️ Você ainda não configurou qual dia devo te lembrar de pedir materiais';
    await sendTelegramApiRequest('sendMessage', {
        chat_id: chatId,
        text: `Configurar notificações 📅\n\n${msg}`,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Segunda', callback_data: 'day_1' },
                    { text: 'Terça', callback_data: 'day_2' },
                ],
                [
                    { text: 'Quarta', callback_data: 'day_3' },
                    { text: 'Quinta', callback_data: 'day_4' },
                ],
                [
                    { text: 'Sexta', callback_data: 'day_5' },
                    { text: 'Sábado', callback_data: 'day_6' },
                ],
                [
                    { text: 'Domingo', callback_data: 'day_0' },
                ],
                [
                    { text: '❌ Desativar', callback_data: 'disable_notifications' }
                ]
            ],
        },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // =========================
        // RECEBER LOCALIZAÇÃO
        // =========================
        if (body.message?.location) {
            const { chat, location } = body.message;
            const chatId = chat.id;

            const { latitude, longitude } = location;

            const user = await findUserByChatId(chatId);

            if (user) {
                await fetch(`${MOCK_API_URL}/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude,
                        longitude
                    }),
                });
            }

            await sendTelegramApiRequest('sendMessage', {
                chat_id: chatId,
                text: `📍 Localização recebida:\n\nLatitude: ${latitude}\nLongitude: ${longitude}`,
            });
        }

        // =========================
        // TEXTO (BOTÕES)
        // =========================
        if (body.message?.text) {
            const { chat, text } = body.message;
            const chatId = chat.id;

            if (text === '/start') {
                await ensureUserExists(chatId);
                await sendMainMenu(chatId);
                await promptNotificationSetup(chatId);
            }

            if (text === '📄 Pedido de material') {
                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `📄 Faça seu pedido:\n${MATERIAL_FORM_URL}`,
                });
            }

            if (text === '🗺 Mapa de CTO') {
                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `🗺 Localização:\n${GOOGLE_MAPS_URL}`,
                });
            }

            if (text === '📲 Painel de ferramentas') {
                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `📲 Acesse o painel:\n${SITE_URL_TOOL_KIT_ONE}`,
                });
            }

            if (text === '🧠 GPON / EPON (EliasFausto)') {
                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `🧠 Ferramenta GPON/EPON:\n${SITE_URL_GPON_EPON}`,
                });
            }

            if (text === '📷 QRcode de Avaliação') {
                await sendTelegramApiRequest('sendPhoto', {
                    chat_id: chatId,
                    photo: QR_CODE_IMAGE_URL,
                    caption: '📷 Acesse via QR Code',
                });
            }

            if (text === '🔔 Ativar lembrete de materiais') {
                const user = await findUserByChatId(chatId);

                let statusMsg = '⚠️ Você ainda não configurou qual dia devo te lembrar de pedir materiais';

                if (
                    user?.notificationsEnabled &&
                    user.notificationDay !== undefined &&
                    user.notificationHour !== undefined
                ) {
                    statusMsg = `✅ ${dias[user.notificationDay]} às ${user.notificationHour}h`;
                }

                await promptNotificationSetup(chatId, statusMsg);
            }
        }

        // =========================
        // CALLBACK
        // =========================
        if (body.callback_query) {
            const { data, message } = body.callback_query;
            const chatId = message.chat.id;

            const user = await ensureUserExists(chatId);

            if (data.startsWith('day_')) {
                const day = Number(data.split('_')[1]);

                await fetch(`${MOCK_API_URL}/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationDay: day }),
                });

                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `Escolha o horário para ${dias[day]} ⏰`,
                    reply_markup: {
                        inline_keyboard: Array.from({ length: Math.ceil(horas.length / 4) }, (_, i) => 
                            horas.slice(i * 4, (i + 1) * 4).map(h => ({
                                text: `${h}h`,
                                callback_data: `hour_${h}`
                            }))
                        ),
                    },
                });
            }

            if (data.startsWith('hour_')) {
                const hour = Number(data.split('_')[1]);

                await fetch(`${MOCK_API_URL}/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        notificationHour: hour,
                        notificationsEnabled: true,
                        lastNotificationSent: null
                    }),
                });

                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `✅ Notificação ativada às ${hour}h`,
                });
            }

            if (data === 'disable_notifications') {
                await fetch(`${MOCK_API_URL}/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        notificationsEnabled: false,
                    }),
                });

                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: '❌ Notificações desativadas',
                });
            }
        }

    } catch (error) {
        console.error(error);
    }

    return NextResponse.json({ status: 'ok' });
}
