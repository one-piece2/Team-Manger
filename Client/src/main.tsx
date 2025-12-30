
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import QueryProvider from "./context/query-provider.tsx";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Toaster } from "@/components/ui/sonner"
createRoot(document.getElementById('root')!).render(
    
    <QueryProvider>
        <NuqsAdapter>
            <Toaster />
            <App />
        </NuqsAdapter>
    </QueryProvider>
)
