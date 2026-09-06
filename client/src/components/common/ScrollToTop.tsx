import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that whenever the route pathname or search parameters change,
 * the window scrolls back to the top instantly (scrollY = 0).
 * If a hash is provided (e.g. #reviews-section), it attempts to scroll to that element.
 * It also disables browser native scrollRestoration to avoid conflicts in SPAs.
 */
export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      // If element not rendered yet, retry once shortly
      const timeoutId = setTimeout(() => {
        const delayedElement = document.getElementById(id);
        if (delayedElement) {
          delayedElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    // Instantly reset scroll to top on page transition
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname, search, hash]);

  return null;
};
