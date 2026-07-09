import './globals.css';
import { Inter, Playfair_Display, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });

export const metadata = {
  title: 'XLCHESS — Excel at Chess',
  description: 'Build the future of online chess. Play, learn, compete, and grow — with the strongest AI on the web, puzzles, cloud save and a premium responsive board.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${grotesk.variable}`}>
      <body className="font-sans antialiased bg-neutral-950 text-white">
        {children}
      </body>
    </html>
  );
}
