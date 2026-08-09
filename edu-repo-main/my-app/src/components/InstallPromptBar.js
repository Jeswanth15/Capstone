import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import CloseIcon from '@mui/icons-material/Close';

const InstallPromptBar = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    setIsStandalone(standaloneMode);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Demo fallback if browser install prompt event isn't active
      alert('To install EduAI: Click the 3 dots menu in your browser -> "Install App" or "Add to Home Screen"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the EduAI PWA installation');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (isStandalone) return null; // Already installed!

  return (
    <>
      {/* Material UI Install Banner Dialog */}
      <Dialog
        open={showPrompt}
        onClose={() => setShowPrompt(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1, bgcolor: '#ffffff' },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: '#1e293b',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            📱
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#1e293b" lineHeight={1.2}>
              Install EduAI App
            </Typography>
            <Chip
              label="Fast • Works Offline"
              size="small"
              sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: 10, mt: 0.5 }}
            />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 1 }}>
          <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>
            Install EduAI on your home screen for quick access, offline study materials, and real-time push notifications!
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setShowPrompt(false)}
            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none' }}
          >
            Not Now
          </Button>
          <Button
            variant="contained"
            onClick={handleInstallClick}
            startIcon={<GetAppIcon />}
            sx={{
              borderRadius: 3,
              bgcolor: '#2563eb',
              fontWeight: 800,
              px: 3,
              textTransform: 'none',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Install EduAI
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstallPromptBar;
