import { NextResponse } from 'next/server';
import { runCronJob } from '@/lib/cron-logic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const cronSecret = process.env.CRON_SECRET;

    // Validação de segurança
    const authHeader = req.headers.get('authorization');
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        console.warn('CRON: Tentativa de acesso não autorizada.');
        return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
    }

    try {
        const result = await runCronJob(force);
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}