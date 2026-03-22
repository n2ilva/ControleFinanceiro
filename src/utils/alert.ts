import { Alert, Platform } from 'react-native';

interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Cross-platform alert that works on both native and web.
 * On native: uses React Native's Alert.alert
 * On web: uses window.alert / window.confirm
 */
export function crossAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  // Web fallback
  if (!buttons || buttons.length === 0) {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  // Single button (OK) — just show alert and call onPress
  if (buttons.length === 1) {
    window.alert(message ? `${title}\n\n${message}` : title);
    buttons[0].onPress?.();
    return;
  }

  // Two buttons: treat as cancel + confirm (confirm dialog)
  // Three buttons: treat as cancel + option1 + option2 (sequential confirms)
  const cancelButton = buttons.find((b) => b.style === 'cancel');
  const actionButtons = buttons.filter((b) => b.style !== 'cancel');

  if (actionButtons.length === 1) {
    // Simple confirm: Cancel / Action
    const confirmed = window.confirm(
      message ? `${title}\n\n${message}` : title,
    );
    if (confirmed) {
      actionButtons[0].onPress?.();
    } else {
      cancelButton?.onPress?.();
    }
    return;
  }

  // Multiple action buttons — show sequential confirms
  // First ask the main question
  if (actionButtons.length >= 2) {
    const firstChoice = window.confirm(
      `${title}\n\n${message || ''}\n\n[OK] = ${actionButtons[0].text || 'Opção 1'}\n[Cancelar] = ver próxima opção`,
    );
    if (firstChoice) {
      actionButtons[0].onPress?.();
      return;
    }

    const secondChoice = window.confirm(
      `${title}\n\n${actionButtons[1].text || 'Opção 2'}?`,
    );
    if (secondChoice) {
      actionButtons[1].onPress?.();
      return;
    }

    cancelButton?.onPress?.();
  }
}
