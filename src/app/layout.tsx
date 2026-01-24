import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { LanguageProvider } from "@/context/LanguageContext"; // Import du provider
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Spordateur - Sport Dating App",
  description: "Rencontrez des partenaires sportifs pour vos séances d'Afroboost et plus",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Spordateur',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#7B1FA2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-body">
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
            <SonnerToaster 
              position="bottom-center" 
              theme="dark"
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid rgba(123, 31, 162, 0.3)',
                },
              }}
            />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
