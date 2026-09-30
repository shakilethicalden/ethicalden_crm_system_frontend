import { useNavigation } from "react-router";

/** Thin animated bar at the very top while React Router is loading the next page. */
export function NavigationProgress() {
  const navigation = useNavigation();

  if (navigation.state === "idle") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-brand/20" role="progressbar" aria-label="Loading page">
      <div className="h-full w-full origin-left animate-progress bg-brand-dark" />
    </div>
  );
}
