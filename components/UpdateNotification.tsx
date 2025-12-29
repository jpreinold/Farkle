import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Modal from './Modal';
import CustomButton from './CustomButton';

const UpdateNotification: React.FC = () => {
  const intervalMS = 60 * 60 * 1000; // Check for updates every hour
  const [isClient, setIsClient] = useState(false);

  // Only initialize on client side to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Check for updates periodically
      if (r) {
        setInterval(() => {
          r.update();
        }, intervalMS);
      }
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error);
    },
  });

  // Auto-dismiss offlineReady notification immediately (don't show it)
  useEffect(() => {
    if (offlineReady) {
      setOfflineReady(false);
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
  // Also only render if we're on the client side
  if (!isClient || !needRefresh) {
    return null;
  }

  return (
    <Modal
      visible={true}
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

