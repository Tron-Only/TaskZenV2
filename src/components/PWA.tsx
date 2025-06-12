'use client';

import { useEffect } from 'react';

export default function PWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.workbox !== undefined) {
      const wb = window.workbox;
      // Add event listeners to handle any of PWA lifecycle event
      wb.addEventListener('installed', (event: any) => {
        console.log(`Event ${event.type} is triggered.`);
        console.log(event);
      });

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      wb.addEventListener('waiting', (event: any) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.

        // Send a message to the service worker to activate the waiting service worker.
        wb.messageSkipWaiting();
      });

      wb.addEventListener('controlling', (event: any) => {
        window.location.reload();
      });

      // Register the service worker after event listeners have been added.
      wb.register();
    }
  }, []);

  return null;
}
