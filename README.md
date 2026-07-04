# opencode setup

Configuração pessoal do opencode para ser clonada em outras máquinas.

## Estrutura

- `opencode.json`: configuração principal
- `AGENTS.md`: regras globais
- `agents/`: agentes customizados
- `skills/`: skills locais
- `plugins/` e `tools/`: extensões auxiliares

## Instalação em outra máquina

```bash
git clone git@github.com:ALMendonca96/opencode.git ~/.config/opencode
cd ~/.config/opencode
npm install
```

Depois, reinicie o opencode.

## Observações

- `node_modules/` não é versionado.
- As dependências são restauradas com `npm install`.
- Se algum provider exigir credenciais locais, mantenha-as fora do repositório e configure por variáveis de ambiente ou outro mecanismo local.
