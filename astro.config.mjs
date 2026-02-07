// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://angel-manuel.github.io',
  base: '/datacenter-map',
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ['react-leaflet', 'react-leaflet-cluster'],
    },
  },
});
