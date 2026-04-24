import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "The AI Picker — We Research AI Tools So You Don't Have To",
    template: "%s | The AI Picker",
  },
  description: "Independent AI tool reviews scored out of 100. Compare tools, browse rankings, and find the right AI for your needs.",
  metadataBase: new URL("https://theaipicker.com"),
  openGraph: {
    siteName: "The AI Picker",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
