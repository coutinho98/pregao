import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, Role } from '@pregao/shared';
import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email('Informe um e-mail válido.'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome.')
    .max(NAME_MAX_LENGTH, `Use até ${NAME_MAX_LENGTH} caracteres.`),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `A senha precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`)
    .max(PASSWORD_MAX_LENGTH, `Use até ${PASSWORD_MAX_LENGTH} caracteres.`),
  role: z.enum([Role.BIDDER, Role.AUCTIONEER], 'Escolha como você vai participar.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
