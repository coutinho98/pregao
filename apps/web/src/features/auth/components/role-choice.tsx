import { Role } from '@pregao/shared';
import { Gavel } from 'lucide-react';
import type { ComponentType } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { PaddleMark } from '@/components/icons/paddle-mark';

interface RoleOption {
  role: Role;
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string }>;
}

const roleOptions: RoleOption[] = [
  {
    role: Role.BIDDER,
    title: 'Quero dar lances',
    description: 'Deposite na carteira e arremate obras.',
    Icon: ({ className }) => <PaddleMark className={className} />,
  },
  {
    role: Role.AUCTIONEER,
    title: 'Quero leiloar',
    description: 'Monte lotes com obras do acervo.',
    Icon: ({ className }) => <Gavel className={className} strokeWidth={1.8} />,
  },
];

interface RoleChoiceProps {
  field: UseFormRegisterReturn<'role'>;
  error?: string;
}

export function RoleChoice({ field, error }: RoleChoiceProps) {
  return (
    <fieldset className="flex flex-col gap-1.5" aria-describedby={error ? 'role-error' : undefined}>
      <legend className="mb-1.5 ml-1 text-[13px] font-medium text-ink-2">
        Como você vai participar?
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {roleOptions.map(({ role, title, description, Icon }) => (
          <label
            key={role}
            className="flex cursor-pointer flex-col gap-2 rounded-[16px] bg-surface p-3.5 transition-[background-color,box-shadow] has-[:checked]:bg-card has-[:checked]:shadow-[0_0_0_2px_var(--ink)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink"
          >
            <input type="radio" value={role} className="sr-only" {...field} />
            <Icon className="size-5 text-ink" />
            <span className="text-[14.5px] font-semibold">{title}</span>
            <span className="text-[12.5px] leading-snug text-ink-2">{description}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id="role-error" role="alert" className="ml-1 text-[12.5px] text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
