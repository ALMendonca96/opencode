import { RouteRequest } from "@opencode-ai/plugin";

/**
 * Roteador determinístico para os subagentes do OpenCode Go.
 * Objetivo: Enviar tarefas difíceis para modelos caros e tarefas simples para modelos baratos.
 */
export function routeTask(request: RouteRequest): string {
    const { taskType, scopeKnown } = request;

    // 1. Análise de Causa Raiz (RCA) ou Trade-offs de Arquitetura -> GLM-5
    if (taskType === "rca" || taskType === "architecture-review") {
        return "glm-analyzer";
    }

    // 2. Planejamento (O seu /grill-with-docs) -> GPT-5.4
    // Disparado explicitamente, ou se for uma implementação grande sem escopo definido.
    if (
        taskType === "planning" ||
        (taskType === "implementation" && !scopeKnown)
    ) {
        return "grill-planner";
    }

    // 3. Operações de Repositório (Testes, Git, Shell) -> DeepSeek V4 Flash (Rápido e Barato)
    if (
        taskType === "git" ||
        taskType === "shell" ||
        taskType === "test-execution" ||
        taskType === "pr-creation"
    ) {
        return "deepseek-operator";
    }

    // 4. Implementação Contida (Escopo claro e validado) -> MiMo V2.5 Pro
    if (taskType === "implementation" && scopeKnown) {
        return "mimo-coder";
    }

    // 5. Review Final antes de fechar a tarefa -> GLM-5
    if (taskType === "review") {
        return "glm-reviewer";
    }

    // Fallback: Retorna para o Kimi 2.6 (orquestrador)
    return "auto";
}
