import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Modal from './Modal';
import CustomButton from './CustomButton';

const UpdateNotification: React.FC = () => {
  const intervalMS = 60 * 60 * 1000; // Check for updates every hour

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates periodically
      r &&
        setInterval(() => {
          r.update();
        }, intervalMS);
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true); // Reload page after update
  };

  const showModal = needRefresh || offlineReady;

  return (
    <Modal
      visible={showModal}
      onRequestClose={close}
      animationType="fade"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {offlineReady ? 'App Ready' : 'Update Available'}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {offlineReady
            ? 'App ready to work offline.'
            : 'A new version of the app is available. Would you like to update now?'}
        </p>
        <div className="flex gap-3 justify-end">
          <CustomButton
            onPress={close}
            variant="secondary"
            title={offlineReady ? 'Close' : 'Later'}
            style={{ padding: '0.5rem 1rem' }}
          />
          {needRefresh && (
            <CustomButton
              onPress={handleUpdate}
              variant="primary"
              title="Update Now"
              style={{ padding: '0.5rem 1rem' }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UpdateNotification;

