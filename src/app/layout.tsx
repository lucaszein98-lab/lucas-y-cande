import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/hooks/useApp";
import { FeedbackProvider } from "@/components/ui/Feedback";
import { site } from "@/config/site";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-display" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: site.name,
  description: site.subtitle,
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1C2340",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body>
        <AppProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </AppProvider>
      </body>
    </html>
  );
}
