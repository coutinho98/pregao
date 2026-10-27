import { useTheme } from '@/lib/theme';
import { Button } from '../ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Acender as luzes' : 'Apagar as luzes';

  return (
    <Button
      variant="onWall"
      size="sm"
      onClick={toggleTheme}
      aria-label={`${label} (alternar tema)`}
    >
      {label}
    </Button>
  );
}
