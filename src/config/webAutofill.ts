import { Platform } from 'react-native';
import { theme } from '../theme';

const STYLE_ID = 'controle-financeiro-autofill-style';

export function setupWebAutofillStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    html, body {
      scrollbar-color: ${theme.colors.surface} ${theme.colors.background};
      scrollbar-width: thin;
    }

    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }

    ::-webkit-scrollbar-track {
      background: ${theme.colors.background};
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${theme.colors.surface};
      border-radius: 999px;
      border: 2px solid ${theme.colors.background};
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: ${theme.colors.surfaceLight};
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-text-fill-color: ${theme.colors.text} !important;
      -webkit-box-shadow: 0 0 0px 1000px ${theme.colors.background} inset !important;
      box-shadow: 0 0 0px 1000px ${theme.colors.background} inset !important;
      caret-color: ${theme.colors.text} !important;
      border: 1px solid ${theme.colors.border} !important;
      transition: background-color 99999s ease-out 0s;
    }

    input::selection {
      color: ${theme.colors.text};
      background: ${theme.colors.surface};
    }
  `;

  document.head.appendChild(style);
}
