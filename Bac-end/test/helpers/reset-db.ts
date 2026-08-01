import { sql } from "drizzle-orm";
import { db } from "../../src/db/client.js";

const TABLES_IN_FK_ORDER = [
  "sessions",
  "frequencia",
  "avisos_ausencia",
  "cronograma",
  "avisos",
  "calendario_escolar",
  "horario_aula",
  "perfis",
  "users",
];

export async function resetDb(): Promise<void> {
  await db.execute(sql.raw(`TRUNCATE TABLE ${TABLES_IN_FK_ORDER.join(", ")} RESTART IDENTITY CASCADE`));
}
