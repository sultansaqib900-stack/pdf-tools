/**
 * Blocking theme bootstrap. Runs before paint to avoid a flash of the wrong
 * theme.
 *
 * Stored preference is one of "light" | "dark" | "system" (default: system).
 * Previously this hardcoded `classList.add('dark')` with three dark-only
 * novelty themes and no light mode at all.
 */
export default function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(function(){try{
  var p = localStorage.getItem('theme');
  if (p !== 'light' && p !== 'dark' && p !== 'system') {
    // Migrate the old midnight/amber/ocean values, which were all dark.
    p = p ? 'dark' : 'system';
  }
  var dark = p === 'dark' || (p === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  document.documentElement.removeAttribute('data-theme');
}catch(e){}})();`,
      }}
    />
  );
}
