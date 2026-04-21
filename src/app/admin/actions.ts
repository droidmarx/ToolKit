"use server";

import { runCronJob } from "@/lib/cron-logic";

export async function forceCronAction() {
    // Como esta é uma Server Action, ela roda apenas no servidor
    // e tem acesso às variáveis de ambiente sem precisar de headers HTTP
    try {
        const result = await runCronJob(true); // force = true
        return result;
    } catch (error) {
        console.error("Erro na Server Action de Cron:", error);
        throw new Error("Falha ao disparar notificações manualmente.");
    }
}
