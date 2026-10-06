import { useEffect } from "react";

/*
 * Adds the "is-visible" class to every element with the "reveal" class
 * when it scrolls into view (CSS in animations.css does the fade/slide).
 * `deps` lets pages re-scan after their content changes.
 */
export default function useReveal(deps = []) {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal:not(.is-visible)");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
