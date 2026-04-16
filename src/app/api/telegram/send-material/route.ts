'use server';

import { NextResponse } from 'next/server';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MATERIAL_FORM_URL = 'https://forms.gle/UEqhzzLM3TGXgTbE6';

export async function POST(req: Request) {
    const { chatId } = await req.json();

    const text = `📦 Pedido de material:\n${MATERIAL_FORM_URL}`;

    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text
        })
    });

    const data = await res.json();

    return NextResponse.json(data);
}
