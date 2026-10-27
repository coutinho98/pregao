import { Role } from '@pregao/shared';
import type { ComponentType, ComponentProps } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { GavelIcon } from '@/components/icons/gavel-icon';
import { PaddleIcon } from '@/components/icons/paddle-icon';

interface RoleOption {
  role: Role;
  title: string;
  description: string;
  Icon: ComponentType<ComponentProps<'svg'>>;
}

const roleOptions: RoleOption[] = [
  {
    role: Role.BIDDER,
    title: 'Quero dar lances',
    description: 'Deposite na carteira, levante a raquete e arremate obras.',
    Icon: PaddleIcon,
  },
  {
    role: Role.AUCTIONEER,
    title: 'Quero leiloar obras',
    description: 'Monte lotes com obras do acervo e acompanhe os resultados.',
    Icon: GavelIcon,
  },
];

interface RoleChoiceProps {
  field: UseFormRegisterReturn<'role'>;
  error?: string;
}

export function RoleChoice({ field, error }: RoleChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? 'role-error' : undefined}>
      <legend className="mb-1.5 font-label text-lg font-semibold">Como você vai participar?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {roleOptions.map(({ role, title, description, Icon }) => (
          <label
            key={role}
            className="flex cursor-pointer gap-3 rounded-xs border border-nevoa p-3 has-[:checked]:border-latao has-[:checked]:bg-latao/10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-latao"
          >
            <input type="radio" value={role} className="sr-only" {...field} />
            <Icon className="mt-1 h-8 w-8 shrink-0 text-latao" />
            <span className="flex flex-col">
              <span className="font-label text-lg font-semibold">{title}</span>
              <span className="text-sm text-nevoa-texto">{description}</span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id="role-error" role="alert" className="text-sm text-lacre">
          {error}
        </p>
      )}
    </fieldset>
  );
}
