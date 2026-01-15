(function () {
  const STORAGE_KEY = 'wobbla-theme-preference';
  const VALID_THEMES = ['auto', 'light', 'dark'];

  function getEffectiveTheme(preference) {
    if (preference === 'light' || preference === 'dark') {
      return preference;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function getStoredPreference() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_THEMES.indexOf(stored) !== -1) {
        return stored;
      }
    } catch (e) {
      console.warn('localStorage not available for theme persistence');
    }
    return 'auto';
  }

  function storePreference(preference) {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch (e) {
      console.warn('Could not save theme preference');
    }
  }

  function getNextTheme(current) {
    const index = VALID_THEMES.indexOf(current);
    return VALID_THEMES[(index + 1) % VALID_THEMES.length];
  }

  function getThemeLabel(preference) {
    const labels = {
      auto: 'Auto',
      light: 'Light',
      dark: 'Dark',
    };
    return labels[preference] || 'Auto';
  }

  function getThemeIconClass(preference) {
    const icons = {
      auto: 'theme-icon-auto',
      light: 'theme-icon-light',
      dark: 'theme-icon-dark',
    };
    return icons[preference] || 'theme-icon-auto';
  }

  const initialPreference = getStoredPreference();
  applyTheme(getEffectiveTheme(initialPreference));

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = function () {
      const preference = getStoredPreference();
      if (preference === 'auto') {
        applyTheme(getEffectiveTheme('auto'));
        if (window.wobblaThemeScope) {
          window.wobblaThemeScope.$apply(function () {
            window.wobblaThemeScope.effectiveTheme = getEffectiveTheme('auto');
          });
        }
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) {
      const newPreference = event.newValue || 'auto';
      applyTheme(getEffectiveTheme(newPreference));
      if (window.wobblaThemeScope) {
        window.wobblaThemeScope.$apply(function () {
          window.wobblaThemeScope.themePreference = newPreference;
          window.wobblaThemeScope.effectiveTheme = getEffectiveTheme(newPreference);
        });
      }
    }
  });

  window.WobblaTheme = {
    getStoredPreference,
    storePreference,
    getEffectiveTheme,
    applyTheme,
    getNextTheme,
    getThemeLabel,
    getThemeIconClass,
    STORAGE_KEY,
  };
})();
