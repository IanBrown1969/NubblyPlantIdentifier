import React from 'react';
import { useScanController } from '../../controllers/useScanController';
import { useAuthController } from '../../controllers/useAuthController';
import { ScanView } from '../../views/screens/ScanView';
import { PaywallView } from '../../views/screens/PaywallView';

/**
 * Scan AI Camera Tab Routing Entry.
 * Glues useScanController parameters to ScanView, including subscription lock checks.
 */
export default function ScanRoute() {
  const controller = useScanController();
  const authController = useAuthController();

  return (
    <>
      <ScanView
        status={controller.status}
        scanMode={controller.scanMode}
        progress={controller.progress}
        telemetryMessage={controller.telemetryMessage}
        scannedResult={controller.scannedResult}
        selectedImageUri={controller.selectedImageUri}
        showPaywall={controller.showPaywall}
        scanError={controller.scanError}
        setScanMode={controller.setScanMode}
        onCapturePhoto={controller.onCapturePhoto}
        onChoosePhoto={controller.onChoosePhoto}
        onTriggerSimulatedScan={controller.onTriggerSimulatedScan}
        onResetScanner={controller.onResetScanner}
        onDismissPaywall={controller.onDismissPaywall}
      />

      {/* Slide-up frosted glassmorphic Paywall overlay if access is locked */}
      {controller.showPaywall && (
        <PaywallView
          onUnlockSubscription={async () => {
            await authController.onToggleSubscription(true);
            controller.onDismissPaywall(); // Auto dismiss after unlock
          }}
          onDismiss={controller.onDismissPaywall}
        />
      )}
    </>
  );
}
