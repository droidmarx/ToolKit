import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { chatId, text } = await req.json();

        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
        }

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text
            })
        });

        const data = await response.json();

        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
    }
}
