'use server';

import { NextResponse } from 'next/server';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(req: Request) {
    const { chatId } = await req.json();

    const chat = await fetch(`https://api.telegram.org/bot${TOKEN}/getChat?chat_id=${chatId}`);
    const chatData = await chat.json();

    const name = chatData.result.first_name || "Sem nome";

    const photoRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getUserProfilePhotos?user_id=${chatId}`);
    const photoData = await photoRes.json();

    let photoUrl = null;

    if (photoData.result.total_count > 0) {
        const fileId = photoData.result.photos[0][0].file_id;
        const file = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
        const fileData = await file.json();

        photoUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileData.result.file_path}`;
    }

    return NextResponse.json({ name, photoUrl });
}
