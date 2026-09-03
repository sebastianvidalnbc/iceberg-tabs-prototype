import { useEffect, useState } from "react";

// Tiny hash router. Returns the current location.hash (e.g. "#/design-system"
// or ""). Unknown/empty hash means the default editor view.
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}
