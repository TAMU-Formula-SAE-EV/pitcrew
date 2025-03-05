import type { Metadata } from "next";
import { Montserrat } from 'next/font/google';
import AuthProvider from "./api/context/AuthProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
});

const queryClient = new QueryClient();

export const metadata: Metadata = {
  title: "PitCrew | Formula Electric Recruiting",
  description: "Formula Electric recruiting platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}