import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7f8fc' : '#080d1b');
    try { localStorage.setItem('showroom-theme', theme); } catch { /* Private browsing can disable storage. */ }
  }, [theme]);
  useEffect(() => {
    const sync = event => {
      if (event.key === 'showroom-theme') setTheme(event.newValue === 'light' ? 'light' : 'dark');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
  return <button className="theme-toggle" type="button" aria-label={label} title={label}
    onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {theme === 'dark' ? <><circle cx="12" cy="12" r="4"/><path strokeLinecap="round" d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>
        : <path strokeLinecap="round" strokeLinejoin="round" d="M20.4 15.4A8.6 8.6 0 0 1 8.6 3.6a8.6 8.6 0 1 0 11.8 11.8Z"/>}
    </svg>
  </button>;
}
