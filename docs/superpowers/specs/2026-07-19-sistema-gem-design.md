# Sistema GEM Jardim Floresta — Design

**Data:** 2026-07-19
**Status:** Aprovado (Fase 1 detalhada; Fases 2 e 3 em visão geral)

## 1. Contexto

Sistema de gestão para o GEM (Grupo de Estudos Musical) da congregação Jardim Floresta,
CCB, Rio Verde - GO. Substitui controle manual de frequência, notas, conteúdo, atividades
e relatórios de aula prática por um sistema web simples, usado pela equipe (instrutores e
encarregado) e pelos alunos.

Projeto novo, sem código existente. Duas pastas já criadas na raiz do repositório:
- `Bac-end/` — API
- `Front-end!/` — interface web

## 2. Escopo e fases de entrega

O sistema completo é grande, então a entrega foi dividida em três fases. Cada fase já é
utilizável sozinha.

- **Fase 1 (este documento detalha por completo):** login único com dois tipos de usuário,
  cadastro de alunos/professores, frequência, avisos gerais, aviso de ausência do aluno,
  cronograma de aula (conteúdo), calendário escolar, horário de aula.
- **Fase 2 (visão geral, seção 8):** notas por semestre, atividades/trabalhos/provas com
  prazo e anexo/resposta no sistema.
- **Fase 3 (visão geral, seção 8):** relatório de aula prática assinado pelo instrutor,
  materiais compartilhados entre instrutores, recado para mãe de aluna menor.

## 3. Papéis e permissões

Existe **uma única tela de login**. O campo `tipo` do usuário define a área do sistema:

- **`aluno`**: acesso só aos próprios dados. Nunca edita frequência, notas, conteúdo,
  cronograma, calendário, horário ou relatórios — só visualiza. Pode enviar aviso de
  ausência para a equipe.
- **`professor`**: acesso livre a todos os alunos (ver, lançar e alterar qualquer coisa).
  Dentro desse tipo existe um `cargo` (`instrutor`, `instrutor_substituto` ou `encarregado`)
  usado só para identificar quem fez cada lançamento/alteração — as permissões dos três
  cargos são idênticas, sem restrição para o instrutor substituto.

Cadastro de novos usuários (aluno ou professor) só pode ser feito por um usuário do tipo
`professor`. Toda alteração em dado de aluno ou professor registra quem fez (campos
`created_by` / `updated_by`), atendendo ao requisito de auditoria do sistema.

As duas turmas do GEM (Irmãos e Irmãs) são só um campo de agrupamento/filtro no cadastro do
aluno — não têm conteúdo, atividades ou horário próprios e separados. Qualquer professor
enxerga as duas turmas livremente.

## 4. Stack técnica

**Backend** (`Bac-end/`):
- Node.js + TypeScript + Fastify (API REST)
- Drizzle ORM + PostgreSQL
- Autenticação por sessão em cookie httpOnly, tabela `sessions` no Postgres (sem Redis)
- Validação de entrada com Zod em toda rota
- Upload de arquivo (a partir da Fase 2) salvo em disco local do próprio servidor, com
  metadado no banco
- Camadas simples: `routes/` → `services/` → `db/` (schema Drizzle + queries)

**Frontend** (`Front-end!/`):
- React + Vite + TypeScript (SPA)
- React Router, com rotas separadas por papel (`/aluno/*`, `/professor/*`)
- TanStack Query para chamadas de API
- Tailwind CSS + shadcn/ui para os componentes

**Ambiente**: Postgres local via Docker Compose em desenvolvimento; produção em um único
VPS simples, com arquivos de upload em disco local (decisão registrada na seção 9).

Cada pasta é um projeto Node independente — sem monorepo/workspace tooling.

## 5. Modelo de dados — Fase 1

**`users`** (autenticação)
- `id`, `login` (nome de usuário, não precisa ser e-mail), `senha_hash`
- `tipo`: `aluno` | `professor`
- `cargo` (obrigatório só quando `tipo = professor`): `instrutor` | `instrutor_substituto` | `encarregado`
- `ativo` (boolean), `updated_by` (FK `users.id`, nullable), `created_at`, `updated_at`

**`perfis`** (dados de cadastro, relação 1:1 com `users`)
- Comuns a aluno e professor: `nome_completo`, `data_nascimento`, `nome_pai`, `nome_mae`,
  `pai_batizado` (boolean), `mae_batizado` (boolean), `data_batismo` (nullable), `endereco`,
  `cidade`, `uf`, `telefone`, `comum`, `instrumento`
- Campos informativos de hierarquia da igreja (texto livre, sem relação com permissões do
  sistema): `anciao`, `cooperador_oficial`, `cooperador_jovens`, `encarregado_local`,
  `encarregado_regional`, `examinadora_responsavel`
- Só para `tipo = aluno` (nulos quando é professor): `turma` (`irmaos` | `irmas`),
  `data_inicio_gem`, `necessidade_especial` (nullable), `instrutor_responsavel_1_id` (FK
  `users.id`, nullable), `instrutor_responsavel_2_id` (FK `users.id`, nullable)
- Auditoria: `created_by` (FK `users.id`), `updated_by` (FK `users.id`), `created_at`,
  `updated_at`

**`frequencia`**
- `id`, `aluno_id` (FK `users.id`), `data`, `status` (`presente` | `falta` | `justificada`),
  `observacao` (nullable), `created_by` (FK `users.id`), `created_at`, `updated_at`

**`avisos_ausencia`** (aluno avisa a equipe sobre ausência)
- `id`, `aluno_id` (FK `users.id`), `data_aula` (nullable), `mensagem`, `created_at`

**`cronograma`** (unifica "Lançamento de Conteúdo" e "Cronograma de Aula" — mesmo conceito:
post com data do que foi/será ensinado, aluno só visualiza)
- `id`, `data`, `titulo`, `descricao`, `created_by` (FK `users.id`), `created_at`, `updated_at`

**`avisos`** (comunicados gerais para todos os alunos)
- `id`, `titulo`, `mensagem`, `created_by` (FK `users.id`), `created_at`, `updated_at`

**`calendario_escolar`**
- `id`, `titulo`, `data_inicio`, `data_fim` (nullable), `descricao` (nullable), `created_by`
  (FK `users.id`), `created_at`, `updated_at`

**`horario_aula`** (sem vínculo estrutural com turma — turma é só filtro; se necessário,
distinguir turma na própria `descricao`)
- `id`, `dia_semana`, `hora_inicio`, `hora_fim`, `descricao` (nullable), `created_by` (FK
  `users.id`), `created_at`, `updated_at`

**`sessions`**
- `id`, `user_id` (FK `users.id`), `expires_at`, `created_at`

## 6. Fluxos principais — Fase 1

**Login**: tela única → `POST /auth/login` (login + senha) → backend valida contra `users`,
cria sessão e seta cookie httpOnly → frontend redireciona para o dashboard de aluno ou de
professor conforme `tipo`.

**Cadastro** (só `tipo = professor` acessa): formulário com seletor de tipo (Aluno /
Instrutor / Instrutor Substituto / Encarregado) que mostra só os campos pertinentes.
Backend cria `users` + `perfis` numa transação, gera uma senha inicial, grava `created_by`.

**Esqueci a senha**: dentro do cadastro de qualquer aluno ou professor, um usuário `professor`
pode gerar uma nova senha temporária para aquela conta. Não existe fluxo de recuperação por
e-mail — quem reseta é sempre alguém da equipe.

**Frequência**: professor escolhe uma data, marca presente/falta/justificada por aluno,
salva. Aluno só visualiza o próprio histórico.

**Aviso de ausência**: aluno envia uma mensagem (com data da aula opcional) → lista
cronológica visível para toda a equipe.

**Avisos, Cronograma, Calendário, Horário**: CRUD simples para a equipe (criar, editar,
listar); aluno só visualiza, em ordem cronológica.

## 7. Tratamento de erros e permissões

- Validação de entrada com Zod em toda rota Fastify. Erro retorna padronizado
  (`{ error, details }`) com status HTTP apropriado: 400 (validação), 401 (não logado), 403
  (sem permissão — ex.: aluno tentando editar), 404, 409 (ex.: login duplicado).
- Toda rota que lida com dado específico de um aluno filtra pelo `user_id` da sessão no
  backend — nunca confia em um `aluno_id` vindo do cliente para decidir "são meus dados".
  É essa regra que impede um aluno de ver dado de outro aluno.
- Guarda de rota no frontend (redireciona se o papel não bate) e, principalmente, no
  backend, em cada endpoint — a validação de permissão nunca depende só do frontend.

## 8. Testes

- Backend: testes de integração com Vitest + Postgres de teste (Docker), priorizando as
  regras de permissão (aluno não edita, não vê dado de outro aluno) e os fluxos de
  cadastro/login.
- Frontend: testes leves de fumaça (login, cadastro) com Vitest + Testing Library, sem
  meta de cobertura completa.

## 9. Visão geral das Fases 2 e 3 (não detalhado neste documento)

**Fase 2 — Notas e avaliações**
- `notas`: lançamento por semestre de ponto de atividade, prova e teste; nota total
  **calculada automaticamente** pelo sistema a partir dos lançamentos (decisão registrada).
- `atividades` / `trabalhos` / `provas`: cada lançamento tem prazo (data/hora início e fim).
  Aluno responde em campo de texto livre dentro do sistema **ou** anexa PDF/scan. Correção é
  **manual pelo instrutor** (sem motor de múltipla escolha/gabarito automático).
- Prazo expirado **bloqueia o envio**; instrutor ou encarregado pode reabrir manualmente
  para um aluno específico em caso justificado.
- Armazenamento de anexos: disco local do VPS (mesma decisão da Fase 1).

**Fase 3 — Relatório de aula prática, materiais e recados**
- `relatorio_aula_pratica`: um relatório por aluno por aula, com os campos fixos Anotações,
  Estudo/Lições, Hinos, Exercícios, Escala e Observações. **Não é salvo enquanto não for
  assinado** pelo instrutor (campo com nome do professor que avaliou). O relatório mais
  recente de cada aluno fica fixado no topo do histórico; aluno tem acesso somente de
  visualização.
- `materiais`: espaço para instrutores compartilharem material entre si (sem acesso de aluno).
- Recado para mãe de aluna menor: **não é envio externo** (WhatsApp/SMS/e-mail) — fica
  visível como um aviso na própria conta da aluna, marcado como destinado à mãe (decisão
  registrada, evita integração com serviço de mensageria externo).

## 10. Decisões registradas durante o brainstorming

| Tema | Decisão |
|---|---|
| Instrutor Substituto | Mesmas permissões completas de Instrutor/Encarregado; só muda o cargo exibido |
| Campos de hierarquia (Ancião, Cooperador etc.) | Texto informativo, sem login nem permissão associada |
| Correção de atividade/prova respondida no sistema | Manual pelo instrutor, sem múltipla escolha automática |
| Escopo das turmas (Irmãos/Irmãs) | Só agrupamento/filtro, sem conteúdo/atividade/horário separado por turma |
| Entrega do recado para mãe de aluna menor | Visível na própria conta da aluna, sem envio externo |
| Hospedagem/armazenamento de arquivo | VPS simples com disco local |
| Cálculo da nota total do semestre | Automático, a partir dos lançamentos individuais |
| Prazo expirado sem entrega | Bloqueia envio; professor pode reabrir manualmente |
| Fases de entrega | Divididas em 3 fases (esta spec detalha a Fase 1) |
| Framework de frontend | React + Vite + TypeScript (proposto e aprovado como Abordagem A) |
