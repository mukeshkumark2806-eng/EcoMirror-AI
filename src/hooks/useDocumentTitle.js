/**
 * @fileoverview Hook that sets the browser document title for the current page.
 * Restores the original title on unmount.
 * @module hooks/useDocumentTitle
 */

import { useEffect } from 'react';

const BASE_TITLE = 'EcoMirror AI';

/**
 * Sets document.title to `${pageTitle} — EcoMirror AI`.
 * Reverts to the base title when the component unmounts.
 *
 * @param {string} pageTitle - The page-specific portion of the title.
 */
export function useDocumentTitle(pageTitle) {
  useEffect(() => {
    const previous = document.title;
    document.title = pageTitle ? `${pageTitle} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
