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
};

async function findUserByChatId(chatId: number): Promise<User | null> {
    const url = `${MOCK_API_URL}?chatId=${chatId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const users = await response.json();
        return users.length > 0 ? users[0] : null;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    try {
        const body = await req.json();

        // 📍 LOCALIZAÇÃO
        if (body.message && body.message.location) {
            const { chat } = body.message;
            const { latitude, longitude } = body.message.location;

            await sendTelegramApiRequest('sendMessage', {
                chat_id: chat.id,
                text: `${latitude}, ${longitude}`,
            });
        }

        if (body.message && body.message.text) {
            const { chat, text } = body.message;
            const chatId = chat.id;
            const command = text.split(' ')[0];

            switch (command) {
                case '/start':
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: `Escolha uma opção abaixo 👇`,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '📄 Material', web_app: { url: MATERIAL_FORM_URL } }],
                                [{ text: '🗺 Maps', web_app: { url: GOOGLE_MAPS_URL } }],
                                [{ text: '📲 Painel', web_app: { url: SITE_URL_TOOL_KIT_ONE } }],
                                [{ text: '🧠 GPON/EPON', web_app: { url: SITE_URL_GPON_EPON } }],
                                [{ text: '📍 Capturar localização', callback_data: 'location' }],
                                [{ text: '🔔 Notificações', callback_data: 'notifications' }],
                            ],
                        },
                    });
                    break;

                case '/command3':
                    await sendTelegramApiRequest('sendPhoto', {
                        chat_id: chatId,
                        photo: QR_CODE_IMAGE_URL,
                        caption: SITE_URL_TOP_DRAB,
                    });
                    break;

                case '/command7':
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: 'Clique abaixo para enviar sua localização 📍',
                        reply_markup: {
                            keyboard: [
                                [
                                    {
                                        text: '📍 Compartilhar localização',
                                        request_location: true,
                                    },
                                ],
                            ],
                            resize_keyboard: true,
                            one_time_keyboard: true,
                        },
                    });
                    break;

                default:
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: 'Use /start',
                    });
                    break;
            }
        }

        // CALLBACK BUTTONS
        if (body.callback_query) {
            const { data, message } = body.callback_query;
            const chatId = message.chat.id;

            if (data === 'location') {
                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: 'Clique abaixo para enviar sua localização 📍',
                    reply_markup: {
                        keyboard: [
                            [
                                {
                                    text: '📍 Compartilhar localização',
                                    request_location: true,
                                },
                            ],
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true,
                    },
                });
            }

            if (data === 'notifications') {
                const user = await findUserByChatId(chatId);

                if (!user) {
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: 'Use /start primeiro.',
                    });
                    return;
                }

                const newStatus = !user.notificationsEnabled;

                await fetch(`${MOCK_API_URL}/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationsEnabled: newStatus }),
                });

                await sendTelegramApiRequest('sendMessage', {
                    chat_id: chatId,
                    text: `Notificações ${newStatus ? 'ATIVADAS' : 'DESATIVADAS'}`,
                });
            }
        }
    } catch (error) {
        console.error(error);
    }

    return NextResponse.json({ status: 'ok' });
}