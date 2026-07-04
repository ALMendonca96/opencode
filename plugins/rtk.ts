import { ShellCommandRequest, PluginContext } from "@opencode-ai/plugin";
import { execSync } from "child_process";

/**
 * Intercepta chamadas bash/shell e tenta reescrever o comando via `rtk rewrite`.
 * Objetivo: Reduzir tokens gastos em comandos verbosos (ex: limitando linhas de cat/grep).
 */
export function beforeShellCommand(
    request: ShellCommandRequest,
    context: PluginContext,
): string {
    const originalCommand = request.command;

    try {
        // Verifica se o rtk está disponível no PATH do sistema
        execSync("which rtk", { stdio: "ignore" });

        // Escapa aspas para evitar quebra na injeção do comando
        const safeCommand = originalCommand.replace(/"/g, '\\"');

        // Pede ao rtk para otimizar/reescrever o comando
        const rewrittenCommand = execSync(`rtk rewrite "${safeCommand}"`, {
            encoding: "utf-8",
        }).trim();

        if (rewrittenCommand && rewrittenCommand !== originalCommand) {
            context.logger.info(
                `[Economia de Tokens] Comando reescrito: ${originalCommand} -> ${rewrittenCommand}`,
            );
            return rewrittenCommand;
        }
    } catch (error) {
        // Se o rtk não estiver instalado ou falhar, desativa silenciosamente
        // e retorna o comando original sem quebrar a sessão.
        context.logger.debug(
            "RTK não encontrado ou falhou ao reescrever. Mantendo comando original.",
        );
    }

    return originalCommand;
}
