import { Joti_One } from "next/font/google";
import "./globals.css";

const jotiOne = Joti_One({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-joti-one"
});

export const metadata = {
  title: "Tic-Tac-Toe Game",
  description: "A classic Tic-Tac-Toe game with two-player and AI modes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jotiOne.variable}`} style={{ fontFamily: 'var(--font-joti-one)' }}>{children}</body>
    </html>
  );
}
