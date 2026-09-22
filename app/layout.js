import "./base.css";
import "./style.css";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";
import FloatingChatHub from "@/components/FloatingChatHub";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) || '';
                if (msg.indexOf('Loading chunk') !== -1 || msg.indexOf('ChunkLoadError') !== -1) {
                  if (!window.__chunkReloaded) {
                    window.__chunkReloaded = true;
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <a href="#stage" className="skip-link">Skip to content</a>
        <SessionProviderWrapper>
          {children}
          <FloatingChatHub />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
