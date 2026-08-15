import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Makka El Halawany` : 'Makka El Halawany';
    return () => { document.title = prev; };
  }, [title]);
}
