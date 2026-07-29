// Deferred to Phase 3 — theme tokens (data-theme) are already wired via
// style.css so these just need content once Editor/Analyst copy is ready.
export default function PlaceholderMode({ id, theme }) {
  return <div className="mode-view" id={id} data-theme={theme} />;
}
