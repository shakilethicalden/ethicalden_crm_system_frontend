export function DashboardFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-1 border-t border-line pt-4 text-xs text-muted sm:flex-row">
      <p>Copyright © {new Date().getFullYear()} Ethical Den. All rights reserved.</p>
      <p>
        Developed By <span className="font-bold text-brand-dark">Ethical Den</span>
      </p>
    </footer>
  );
}
