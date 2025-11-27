import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube Comment Analyzer | Deep Audience Insights",
  description: "Analyze YouTube comments to uncover sentiments, knowledge gaps, demand signals, myths, and pain points. Powered by AI.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased noise-bg">
        {children}
      </body>
    </html>
  );
}
