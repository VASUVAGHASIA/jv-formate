import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  const homeDir = os.homedir();
  const certPath = path.resolve(homeDir, ".office-addin-dev-certs", "localhost.crt");
  const keyPath = path.resolve(homeDir, ".office-addin-dev-certs", "localhost.key");

  return {
    plugins: [react()],
    server: {
      https: {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
      port: 3000,
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          taskpane: './src/taskpane/taskpane.html',
          commands: './src/commands/commands.html',
          'oauth-callback': './public/oauth-callback.html',
        },
      },
    },
    define: {
      // Make env variables available to the app
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      'import.meta.env.VITE_DEV_SERVER_URL': JSON.stringify(env.VITE_DEV_SERVER_URL),
    },
  };
});





// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';
// import fs from 'node:fs';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default defineConfig(({ mode }) => {
//   // Load env file based on `mode` in the current working directory.
//   const env = loadEnv(mode, process.cwd(), '');

//   return {
//     plugins: [react()],
//     server: {
//       https: {
//         // mkcert output files (run: mkcert localhost 127.0.0.1 ::1)
//         key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
//         cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
//       },
//       port: 3000,
//     },
//     build: {
//       outDir: 'dist',
//       rollupOptions: {
//         input: {
//           taskpane: './src/taskpane/taskpane.html',
//           commands: './src/commands/commands.html',
//           'oauth-callback': './public/oauth-callback.html',
//         },
//       },
//     },
//     define: {
//       // Make env variables available to the app
//       'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
//       'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
//       'import.meta.env.VITE_DEV_SERVER_URL': JSON.stringify(env.VITE_DEV_SERVER_URL),
//     },
//   };
// });
