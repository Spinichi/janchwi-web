import { useState, useCallback } from 'react';
import { Alert } from '../components/Alert';

export const useAlert = () => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  const showAlert = useCallback((message: string) => {
    setAlertState({
      isOpen: true,
      message
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState({
      isOpen: false,
      message: ''
    });
  }, []);

  const AlertComponent = alertState.isOpen ? (
    <Alert message={alertState.message} onClose={closeAlert} />
  ) : null;

  return {
    showAlert,
    AlertComponent
  };
};
