import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { Providers } from './app/providers';
import { router } from './app/router';
import { unlockAudioOnFirstGesture } from './lib/sound';
import { reloadOnStaleBuild } from './lib/stale-build';
import '@fontsource-variable/inter';
import '@fontsource-variable/geist-mono';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import './styles/index.css';

reloadOnStaleBuild();
unlockAudioOnFirstGesture();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
