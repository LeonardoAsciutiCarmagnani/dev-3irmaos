// src/config/env.ts
import { config } from "dotenv";
import { z } from "zod";

// Garante que o .env seja carregado
config();

// Define o schema com valores padrão opcionais
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production"])
    .optional()
    .default("development"),
  CORS_ORIGIN: z.string().optional().default("*"),
  HIPER_API_URL: z
    .string()
    .optional()
    .default("http://ms-ecommerce.hiper.com.br/api/v1"),
  API_SECRET_KEY: z.string({
    required_error: "API_SECRET_KEY é obrigatória no arquivo .env",
  }),
});

// Faz o parse das variáveis de ambiente
const env = envSchema.parse(process.env);

// Exportação padrão
export default env;

// Se ocorrer erro no parse, o processo será encerrado
if (!env.API_SECRET_KEY) {
  console.error("API_SECRET_KEY é obrigatória no arquivo .env");
  process.exit(1);
}
