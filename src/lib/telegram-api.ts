import { NextResponse } from 'next/server';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

export async function sendTelegramApiRequest(method: string, body: object) {
    if (!TOKEN) {
        console.error('CRITICAL: TELEGRAM_BOT_TOKEN is not set.');
        return new Response(JSON.stringify({ status: 'error', message: 'Bot token not configured.' }), { status: 500 });
    }

    const url = `${BASE_URL}/${method}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            const responseBody = await response.json();
            console.error(`Telegram API error: ${response.status} on method '${method}'`, responseBody);
        }
        
        return response;
    } catch (error) {
        console.error(`Failed to send API request to Telegram method '${method}'`, error);
        return new Response(JSON.stringify({ status: 'error', message: 'Failed to send API request to Telegram.' }), { status: 500 });
    }
}
