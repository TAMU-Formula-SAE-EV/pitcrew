import type { Metadata } from "next";
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
});

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
        {children}
      </body>
    </html>
  );
}