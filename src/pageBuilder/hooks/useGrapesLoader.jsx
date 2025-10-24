import { useEffect, useState } from 'react';

export default function useGrapesLoader() {
  const [loaded, setLoaded] = useState(!!window.grapesjs);

  useEffect(() => {
    if (window.grapesjs) {
      setLoaded(true);
      return;
    }

    // CSS
    if (!document.querySelector('link[href*="grapes.min.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
      document.head.appendChild(cssLink);
    }

    // JS chain
    const s1 = document.createElement('script');
    s1.src = 'https://unpkg.com/grapesjs';
    s1.onload = () => {
      const s2 = document.createElement('script');
      s2.src = 'https://unpkg.com/grapesjs-preset-webpage';
      s2.onload = () => {
        const s3 = document.createElement('script');
        s3.src = 'https://unpkg.com/grapesjs-blocks-basic';
        s3.onload = () => setLoaded(true);
        document.body.appendChild(s3);
      };
      document.body.appendChild(s2);
    };
    document.body.appendChild(s1);
  }, []);

  return loaded;
}
