const THEMES = ["midnight", "amber", "ocean"];

export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              document.documentElement.classList.add('dark');
              var theme = localStorage.getItem('theme');
              if (theme && ${JSON.stringify(THEMES)}.includes(theme)) {
                document.documentElement.setAttribute('data-theme', theme);
              } else {
                document.documentElement.setAttribute('data-theme', 'midnight');
              }
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
