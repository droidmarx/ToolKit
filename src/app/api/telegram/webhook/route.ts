'use server';

import { NextResponse } from 'next/server';
import { sendTelegramApiRequest } from '@/lib/telegram-api';

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';
const GOOGLE_MAPS_URL = 'https://goo.gl/maps/88VJ2ZpSiy4F2Qas7?g_st=aw';
const SITE_URL_TOP_DRAB = 'https://top-drab.vercel.app/';
const QR_CODE_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${SITE_URL_TOP_DRAB}`;
const SITE_URL_TOOL_KIT_ONE = 'https://tool-kit-one.vercel.app/';
const MOCK_API_URL = 'https://699107e56279728b0153afac.mockapi.io/Telegran';

type User = {
    id: string;
    chatId: number;
    notificationsEnabled: boolean;
};

async function findUserByChatId(chatId: number): Promise<User | null> {
    const url = `${MOCK_API_URL}?chatId=${chatId}`;
    console.log(`API_HELPER: Finding user with URL: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('API_HELPER: Failed to fetch user from mock API', `Status: ${response.status}`, await response.text());
            return null;
        }
        const users = await response.json();
        if (users.length > 0) {
            console.log(`API_HELPER: Found user:`, users[0]);
            return users[0];
        } else {
            console.log(`API_HELPER: User not found for chat ID ${chatId}`);
            return null;
        }
    } catch (error) {
        console.error('API_HELPER: Error finding user by chat ID:', error);
        return null;
    }
}


export async function POST(req: Request) {
    console.log('Webhook received a request.');
    
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.error('CRITICAL: TELEGRAM_BOT_TOKEN is not set in environment variables.');
        return NextResponse.json({ status: 'error', message: 'Bot token not configured.' }, { status: 500 });
    }

    try {
        const body = await req.json();
        console.log('Webhook body:', JSON.stringify(body, null, 2));

        if (body.message && body.message.text) {
            const { chat, text } = body.message;
            const chatId = chat.id;

            const command = text.split(' ')[0];
            console.log(`Processing command: '${command}' for chat ID: ${chatId}`);

            switch (command) {
                case '/start':
                    try {
                        let user = await findUserByChatId(chatId);
                        console.log('/start: Checking user. Found:', user ? `ID ${user.id}` : 'No');

                        if (user) {
                            if (!user.notificationsEnabled) {
                                console.log(`/start: User ${user.id} has notifications disabled. Enabling...`);
                                const response = await fetch(`${MOCK_API_URL}/${user.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ notificationsEnabled: true }),
                                });
                                if (!response.ok) {
                                     console.error(`/start: Failed to enable notifications for user ${user.id}. Status: ${response.status}`, await response.text());
                                }
                            }
                        } else {
                            console.log('/start: User not found. Creating new user...');
                            const response = await fetch(MOCK_API_URL, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ chatId: chatId, notificationsEnabled: true }),
                            });
                             if (response.ok) {
                                console.log(`/start: Successfully created new user for chat ID ${chatId}`);
                            } else {
                                console.error(`/start: Failed to create new user for chat ID ${chatId}. Status: ${response.status}`, await response.text());
                            }
                        }
                    } catch (apiError) {
                        console.error("/start: Error during API interaction", apiError);
                    }
                    
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: 'Olá! Sou seu bot de assistência CTO. Use os seguintes comandos:\n\n/command1 - Link para pedido de material.\n/command2 - Link para o Google Maps.\n/command3 - Receber QR Code e link do site.\n/command4 - Receber link do painel de ferramentas.\n/command5 - Ativar/Desativar avisos semanais.',
                    });
                    break;
                
                case '/command1':
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: `Aqui está o link para o pedido de material: ${MATERIAL_FORM_URL}`,
                    });
                    break;
                
                case '/command2':
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: `Aqui está o link do Google Maps: ${GOOGLE_MAPS_URL}`,
                    });
                    break;

                case '/command3':
                    await sendTelegramApiRequest('sendPhoto', {
                        chat_id: chatId,
                        photo: QR_CODE_IMAGE_URL,
                        caption: `Aqui está o QR Code e o link do site: ${SITE_URL_TOP_DRAB}`,
                    });
                    break;

                case '/command4':
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: `Aqui está o link do painel de ferramentas: ${SITE_URL_TOOL_KIT_ONE}`,
                    });
                    break;
                
                case '/command5':
                    try {
                        const user = await findUserByChatId(chatId);
                        console.log('/command5: Checking user. Found:', user ? `ID ${user.id}` : 'No');
                        
                        if (!user) {
                            console.log(`/command5: User not found for chat ID ${chatId}. Sending registration message.`);
                            await sendTelegramApiRequest('sendMessage', {
                                chat_id: chatId,
                                text: 'Você ainda não está registrado. Use o comando /start para começar e poder gerenciar seus avisos.',
                            });
                            break;
                        }

                        const newStatus = !user.notificationsEnabled;
                        console.log(`/command5: Toggling notifications for user ${user.id} to ${newStatus}`);

                        const updateResponse = await fetch(`${MOCK_API_URL}/${user.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notificationsEnabled: newStatus }),
                        });

                        if (updateResponse.ok) {
                            console.log(`/command5: Successfully updated user ${user.id}.`);
                             await sendTelegramApiRequest('sendMessage', {
                                chat_id: chatId,
                                text: `Avisos de material semanais foram ${newStatus ? 'ATIVADOS' : 'DESATIVADOS'}.`,
                            });
                        } else {
                             const errorBody = await updateResponse.text();
                             console.error(`/command5: Failed to update preferences for user ${user.id}. Status: ${updateResponse.status}`, errorBody);
                             await sendTelegramApiRequest('sendMessage', {
                                chat_id: chatId,
                                text: 'Ocorreu um erro ao atualizar suas preferências. Tente novamente.',
                            });
                        }
                    } catch (apiError) {
                        console.error(`/command5: Error during API interaction`, apiError);
                         await sendTelegramApiRequest('sendMessage', {
                            chat_id: chatId,
                            text: 'Ocorreu um erro de comunicação ao atualizar suas preferências. Tente novamente.',
                        });
                    }
                    break;
                
                default:
                    await sendTelegramApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: 'Comando não reconhecido. Digite /start para ver a lista de comandos disponíveis.',
                    });
                    break;
            }
        } else {
            console.log('Received a message without text or not a message update, ignoring.');
        }
    } catch (error) {
        console.error('Error handling webhook:', error);
    }

    return NextResponse.json({ status: 'ok' });
}
