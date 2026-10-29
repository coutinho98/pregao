import { useSession } from '@/features/auth/hooks/use-session';
import { roleLabel } from '@/features/auth/role-labels';
import { paths } from '@/app/paths';
import { GuideLink } from './guide-link';
import { GuideStep } from './guide-step';

/** First stop: sign in with a test account, and come back here afterwards. */
export function AccountStep({ number }: { number: number }) {
  const { user } = useSession();
  return (
    <GuideStep
      number={number}
      title="Entre com uma conta de teste"
      actions={
        <GuideLink to={`${paths.login}?next=${encodeURIComponent(paths.guide)}`}>
          {user ? 'Trocar de conta' : 'Escolher uma conta'}
        </GuideLink>
      }
    >
      <p>Ana e Bruno dão lances; a Casa Verzeilão monta os lotes. Um clique, sem senha.</p>
      {user && (
        <p>
          Você está como <b className="font-[560] text-ink">{user.name}</b> (
          {roleLabel[user.role].toLowerCase()}).
        </p>
      )}
    </GuideStep>
  );
}
