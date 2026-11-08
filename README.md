# 🍅 Tomato Pomodoro

Site para gerenciar o tempo com a técnica Pomodoro: períodos de foco intercalados com pausas curtas e, a cada alguns ciclos, uma pausa longa.

## Funcionalidades

- **Timer** com foco, pausa curta e pausa longa, com botões para iniciar, pausar, reiniciar e pular. O tempo restante também aparece no título da aba.
- **Tempos configuráveis**: duração de cada fase e quantos focos até a pausa longa.
- **Nome da sessão** (ex.: "Estudar Roma Antiga"), que pode ser editado a qualquer momento.
- **Histórico** agrupado por dia, com sessões concluídas e interrompidas. Dá para renomear, apagar uma sessão ou limpar tudo.
- **Estatísticas**: totais de hoje, dos últimos 7 dias e geral, gráfico de minutos por dia e tempo gasto em cada sessão.
- **Avisos** ao fim de cada fase: som e notificação do navegador, que chegam na hora certa mesmo com a aba em segundo plano.
- **Tema escuro e claro**, alternados por um botão no topo. O site lembra a sua escolha.

Os dados ficam salvos no próprio navegador (localStorage). Não precisa de conta nem de servidor.

## Tecnologias

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vitest](https://vitest.dev/) para os testes

## Como rodar

Precisa do [Node.js](https://nodejs.org/) 20 ou mais novo.

```bash
npm install     # instala as dependências (só na primeira vez)
npm run dev     # abre o site em http://localhost:5173
```

Outros comandos:

| Comando           | O que faz                                    |
| ----------------- | -------------------------------------------- |
| `npm test`        | roda os testes                               |
| `npm run build`   | gera a versão final na pasta `dist/`         |
| `npm run preview` | abre a versão final para conferir            |
| `npm run lint`    | procura problemas no código                  |

## Estrutura

```
src/
  types.ts         tipos dos dados (configurações, sessões, fases)
  lib/             lógica sem interface: timer, estatísticas, armazenamento, som e notificações
  hooks/           estado do React: timer, configurações, histórico, tema
  components/      telas e partes visuais
  App.tsx          junta tudo: cabeçalho, abas e modal de configurações
```

## Próximos passos

- Login com servidor para sincronizar entre dispositivos. Os componentes só usam a interface `Repository` de `src/lib/storage.ts`, então basta criar uma nova implementação dela que fale com uma API.
