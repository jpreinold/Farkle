import React, { useEffect } from 'react';
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
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Check for updates periodically
      r &&
        setInterval(() => {
          r.update();
        }, intervalMS);
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error);
    },
  });

  // Auto-dismiss offlineReady notification after a short delay
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => {
        setOfflineReady(false);
      }, 2000); // Auto-dismiss after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [offlineReady, setOfflineReady]);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true); // Reload page after update
  };

  // Only show modal when there's an actual update needed, not for offlineReady
  const showModal = needRefresh;

  return (
    <Modal
      visible={showModal}
      onRequestClose={close}
      animationType="fade"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Update Available
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          A new version of the app is available. Would you like to update now?
        </p>
        <div className="flex gap-3 justify-end">
          <CustomButton
            onPress={close}
            variant="secondary"
            title="Later"
            style={{ padding: '0.5rem 1rem' }}
          />
          <CustomButton
            onPress={handleUpdate}
            variant="primary"
            title="Update Now"
            style={{ padding: '0.5rem 1rem' }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UpdateNotification;

