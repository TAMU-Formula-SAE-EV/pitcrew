import type { Metadata } from "next";

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}