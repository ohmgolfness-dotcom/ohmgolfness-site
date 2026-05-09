import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "OHMGolfness — Smart Leagues. Better Golf.",
  description:
    "OHMGolfness helps golf clubs and leagues run smarter with digital scorecards, live leaderboards, and easy handicap tracking. Join the waitlist.",
  metadataBase: new URL("https://ohmgolfness.com"),
  openGraph: {
    title: "OHMGolfness — Smart Leagues. Better Golf.",
    description:
      "Digital scorecards, live leaderboards, and easy handicap tracking for golf clubs and leagues.",
    url: "https://ohmgolfness.com",
    siteName: "OHMGolfness",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OHMGolfness — Smart Leagues. Better Golf.",
    description:
      "Digital scorecards, live leaderboards, and easy handicap tracking for golf clubs and leagues.",
  },
  keywords: [
    "golf league software",
    "golf scorecard app",
    "golf handicap tracker",
    "golf club management",
    "live golf leaderboard",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
