const now = new Date();

// Ajuste de timezone para São Paulo
const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
});

// Extrai corretamente
const parts = formatter.formatToParts(now);

const hourPart = parts.find(p => p.type === 'hour');
const weekdayPart = parts.find(p => p.type === 'weekday');

const currentHour = Number(hourPart?.value);

// Mapear dia da semana manualmente
const diasMap: Record<string, number> = {
    dom: 0,
    seg: 1,
    ter: 2,
    qua: 3,
    qui: 4,
    sex: 5,
    sáb: 6,
};

const currentDay = diasMap[weekdayPart?.value.toLowerCase() || 'dom'];

console.log(`CRON (SP): Dia ${currentDay} Hora ${currentHour}`);