import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        py: 1,
        px: 2,
        bgcolor: isOnline ? '#16a34a' : '#ef4444',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
      }}
    >
      {isOnline ? (
        <>
          <WifiIcon fontSize="small" />
          <Typography fontSize={13} fontWeight={800}>
            Back Online 🟢 — Synchronizing offline progress & study data...
          </Typography>
        </>
      ) : (
        <>
          <WifiOffIcon fontSize="small" />
          <Typography fontSize={13} fontWeight={800}>
            You are Offline 📡 — Downloaded study materials & cached pages remain available.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OfflineBanner;
