/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // más variables de entorno aquí si es necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'sonner';
declare module 'next-themes';
declare module 'class-variance-authority';
declare module 'react-hook-form';
