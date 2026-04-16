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
    lastNotificationSent?: string;
};

const dias = [
    'Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'
];

const horas = [8,9,10,11,12,13,14];

async function findUserByChatId(chatId: number): Promise<User | null> {
    const res = await fetch(`${MOCK_API_URL}?chatId=${chatId}`);
    const users = await res.json();
    return users.length > 0 ? users[0] : null;
}

// MENU
async function sendMainMenu(chatId: number) {
    await sendTelegramApiRequest('sendMessage', {
        chat_id: chatId,
        text: '👇 Menu principal',
        reply_markup: {
            keyboard: [
                ['📄 Material', '🗺 Maps'],
                ['📲 Painel', '🧠 GPON/EPON'],
                ['📷 QR Code'],
                ['📍 Localização', '🔔 Notificações'],
            ],
            resize_keyboard: true,
        },
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // TEXTO
        if (body.message?.text) {
            const { chat, text } = body.message;
            const chatId = chat.id;

            if (text === '/start') {
                await sendMainMenu(chatId);
            }

            if (text === '🔔 Notificações') {
                const user = await findUserByChatId(chatId);

                let statusMsg = '⚠️ Você ainda não configurou';

                if (
                    user?.notificationsEnabled &&
                    user.notificationDay !== undefined &&
                    user.notificationHour !== undefined
                ) {
                    statusMsg = `✅ ${dias[user.notificationDay]} às ${user.notificationHour}h`;
                }

                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `Configurar notificações 📅\n\n${statusMsg}`,
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
        }

        // CALLBACK
        if (body.callback_query) {
            const { data, message } = body.callback_query;
            const chatId = message.chat.id;

            const user = await findUserByChatId(chatId);
            if (!user) return;

            // ESCOLHE DIA
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
                        inline_keyboard: [
                            horas.map(h => ({
                                text: `${h}h`,
                                callback_data: `hour_${h}`
                            }))
                        ],
                    },
                });
            }

            // ESCOLHE HORA
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

            // DESATIVAR
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