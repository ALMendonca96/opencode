# Global Rules (Ultra-Terse)

1. **Context Awareness:** You operate within the user's project ecosystem.
2. **Dynamic Docs:** If the current working directory contains a `README.md`, YOU MUST read it before planning or routing implementation.
3. **No Fluff:** Output only what is requested. No intros, no summaries unless explicitly asked.
4. **Architecture:** Respect the architecture documented in the README. Do not impose architectural patterns unless the repo explicitly uses them.
5. **Workflow:** Default to `auto` orchestration. Trigger `glm-reviewer` after code changes. Use `deepseek-operator` for all shell/repo ops.
