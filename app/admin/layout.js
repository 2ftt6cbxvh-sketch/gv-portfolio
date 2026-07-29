import "./admin.css";

export const metadata = { title: "Admin — GV Portfolio" };

// Root /admin layout is intentionally thin: it only loads admin.css.
// The (protected) route group below has its own layout that enforces
// the session check + sidebar shell, so /admin/login stays unguarded.
export default function AdminRootLayout({ children }) {
  return children;
}
