import "./base.css";
import "./style.css";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";

export const metadata = {
  title: "GV — Ganesh Varma",
  description: "Ganesh Varma — Editor, Data Analyst, Software Developer. A personal portfolio across three disciplines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <a href="#stage" className="skip-link">Skip to content</a>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
