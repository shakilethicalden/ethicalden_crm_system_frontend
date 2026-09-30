import type { ComponentType } from "react";

export type PageModule = { default: ComponentType };
type PageLoader = () => Promise<PageModule>;

const loaders = new Set<PageLoader>();
let hasPreloaded = false;

/** Called by routes.tsx for every lazy page. */
export function registerPage(load: PageLoader) {
  loaders.add(load);
  return load;
}

/**
 * Download every page chunk in the background (once), so clicking a link renders instantly
 * instead of waiting for the chunk. Runs when the browser is idle to avoid competing with
 * the current page's own requests.
 */
export function preloadPages() {
  if (hasPreloaded) {
    return;
  }

  hasPreloaded = true;

  const run = () => {
    loaders.forEach((load) => {
      load().catch(() => {
        // Ignore: the route will retry the import when it is actually visited.
      });
    });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 300);
  }
}
