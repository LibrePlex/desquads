import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
require("@solana/wallet-adapter-react-ui/styles.css");
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Desquadinator",
  description: "Removes collection from squads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
