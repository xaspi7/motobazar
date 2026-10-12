import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This repository is hosted at https://xaspi7.github.io/motobazar/.
export default defineConfig({ plugins: [react], base: '/motobazar/' });
