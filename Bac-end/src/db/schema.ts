import { pgTable, text, uuid, boolean, timestamp, date, time, pgEnum } from "drizzle-orm/pg-core";

export const userTipoEnum = pgEnum("user_tipo", ["aluno", "professor"]);
export const userCargoEnum = pgEnum("user_cargo", ["instrutor", "instrutor_substituto", "encarregado"]);
export const turmaEnum = pgEnum("turma", ["irmaos", "irmas"]);
export const frequenciaStatusEnum = pgEnum("frequencia_status", ["presente", "falta", "justificada"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  login: text("login").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  tipo: userTipoEnum("tipo").notNull(),
  cargo: userCargoEnum("cargo"),
  ativo: boolean("ativo").notNull().default(true),
  updatedBy: uuid("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const perfis = pgTable("perfis", {
  userId: uuid("user_id").primaryKey().references(() => users.id),
  nomeCompleto: text("nome_completo").notNull(),
  dataNascimento: date("data_nascimento").notNull(),
  nomePai: text("nome_pai"),
  nomeMae: text("nome_mae"),
  paiBatizado: boolean("pai_batizado"),
  maeBatizado: boolean("mae_batizado"),
  dataBatismo: date("data_batismo"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  uf: text("uf"),
  telefone: text("telefone"),
  comum: text("comum"),
  instrumento: text("instrumento"),
  anciao: text("anciao"),
  cooperadorOficial: text("cooperador_oficial"),
  cooperadorJovens: text("cooperador_jovens"),
  encarregadoLocal: text("encarregado_local"),
  encarregadoRegional: text("encarregado_regional"),
  examinadoraResponsavel: text("examinadora_responsavel"),
  turma: turmaEnum("turma"),
  dataInicioGem: date("data_inicio_gem"),
  necessidadeEspecial: text("necessidade_especial"),
  instrutorResponsavel1Id: uuid("instrutor_responsavel_1_id").references(() => users.id),
  instrutorResponsavel2Id: uuid("instrutor_responsavel_2_id").references(() => users.id),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const frequencia = pgTable("frequencia", {
  id: uuid("id").primaryKey().defaultRandom(),
  alunoId: uuid("aluno_id").notNull().references(() => users.id),
  data: date("data").notNull(),
  status: frequenciaStatusEnum("status").notNull(),
  observacao: text("observacao"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const avisosAusencia = pgTable("avisos_ausencia", {
  id: uuid("id").primaryKey().defaultRandom(),
  alunoId: uuid("aluno_id").notNull().references(() => users.id),
  dataAula: date("data_aula"),
  mensagem: text("mensagem").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cronograma = pgTable("cronograma", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: date("data").notNull(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const avisos = pgTable("avisos", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarioEscolar = pgTable("calendario_escolar", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: text("titulo").notNull(),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim"),
  descricao: text("descricao"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const horarioAula = pgTable("horario_aula", {
  id: uuid("id").primaryKey().defaultRandom(),
  diaSemana: text("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFim: time("hora_fim").notNull(),
  descricao: text("descricao"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Perfil = typeof perfis.$inferSelect;
export type NewPerfil = typeof perfis.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Frequencia = typeof frequencia.$inferSelect;
export type NewFrequencia = typeof frequencia.$inferInsert;
export type AvisoAusencia = typeof avisosAusencia.$inferSelect;
export type NewAvisoAusencia = typeof avisosAusencia.$inferInsert;
export type Cronograma = typeof cronograma.$inferSelect;
export type NewCronograma = typeof cronograma.$inferInsert;
export type Aviso = typeof avisos.$inferSelect;
export type NewAviso = typeof avisos.$inferInsert;
export type CalendarioEscolar = typeof calendarioEscolar.$inferSelect;
export type NewCalendarioEscolar = typeof calendarioEscolar.$inferInsert;
export type HorarioAula = typeof horarioAula.$inferSelect;
export type NewHorarioAula = typeof horarioAula.$inferInsert;
