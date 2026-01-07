import { useState, useCallback } from 'react';
import { Alert } from '../components/Alert';

export const useAlert = () => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: undefined
  });

  const showAlert = useCallback((message: string, onConfirm?: () => void) => {
    setAlertState({
      isOpen: true,
      message,
      onConfirm
    });
  }, []);

  const closeAlert = useCallback(() => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    setAlertState({
      isOpen: false,
      message: '',
      onConfirm: undefined
    });
  }, [alertState.onConfirm]);

  const AlertComponent = alertState.isOpen ? (
    <Alert message={alertState.message} onClose={closeAlert} />
  ) : null;

  return {
    showAlert,
    AlertComponent
  };
};
