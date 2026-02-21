import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { theme } from './theme';

// Create a new router instance
const basepath = import.meta.env.PROD ? '/cmtat-icma-tokenized-bonds' : '/';
const router = createRouter({ routeTree, basepath });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
            <RouterProvider router={router} />
        </MantineProvider>
    </React.StrictMode>,
);
