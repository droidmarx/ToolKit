'use server';

import { NextResponse } from 'next/server';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';
const GOOGLE_MAPS_URL = 'https://goo.gl/maps/88VJ2ZpSiy4F2Qas7?g_st=aw';
const QR_CODE_IMAGE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://tool-kit-one.vercel.app/';

async function sendApiRequest(method: string, body: object) {
    const url = `${BASE_URL}/${method}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const responseBody = await response.json();
        if (!response.ok) {
            console.error(`Telegram API error: ${response.status}`, responseBody);
        } else {
            console.log(`Telegram API call '${method}' successful. Response:`, responseBody);
        }
        return response;
    } catch (error) {
        console.error('Failed to send API request to Telegram', error);
    }
}

export async function POST(req: Request) {
    console.log('Webhook received a request.');
    
    if (!TOKEN) {
        console.error('CRITICAL: TELEGRAM_BOT_TOKEN is not set in environment variables.');
        return NextResponse.json({ status: 'error', message: 'Bot token not configured.' }, { status: 500 });
    }
    console.log('TELEGRAM_BOT_TOKEN is present.');

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
                    await sendApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: 'Olá! Sou seu bot de assistência CTO. Use os seguintes comandos:\n\n/command1 - Link para pedido de material.\n/command2 - Link para o Google Maps.\n/command3 - Receber a imagem do QR Code.',
                    });
                    break;
                
                case '/command1':
                    await sendApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: `Aqui está o link para o pedido de material: ${MATERIAL_FORM_URL}`,
                    });
                    break;
                
                case '/command2':
                    await sendApiRequest('sendMessage', {
                        chat_id: chatId,
                        text: `Aqui está o link do Google Maps: ${GOOGLE_MAPS_URL}`,
                    });
                    break;

                case '/command3':
                    await sendApiRequest('sendPhoto', {
                        chat_id: chatId,
                        photo: QR_CODE_IMAGE_URL,
                        caption: 'Aqui está o QR Code solicitado.',
                    });
                    break;

                default:
                    console.log(`Command '${command}' not recognized.`);
                    await sendApiRequest('sendMessage', {
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
