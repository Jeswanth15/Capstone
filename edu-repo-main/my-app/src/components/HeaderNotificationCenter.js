import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, Badge, Popover,
  Button, List, ListItem, Divider, Chip, Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const STORAGE_KEY = 'eduai_notification_items';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: '🎯 Daily Mission Available!',
    body: 'Complete your Daily AI Mock Test today to earn +100 XP & +50 Coins!',
    category: 'dailyMissions',
    url: '/student/missions',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    read: false,
  },
  {
    id: 'notif-2',
    title: '⚡ Offline Progress Synced',
    body: 'Your offline quiz results & practice notes were automatically synchronized.',
    category: 'achievements',
    url: '/student/offline-materials',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    read: false,
  },
  {
    id: 'notif-3',
    title: '⚔️ Weekly Boss Challenge',
    body: 'The Weekly Challenge "Algorithm Arena" is live! Challenge classmates now.',
    category: 'weeklyChallenges',
    url: '/student/daily-challenge',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hrs ago
    read: false,
  },
  {
    id: 'notif-4',
    title: '📚 Syllabus Update',
    body: 'New study materials for Physics Unit 3 have been uploaded.',
    category: 'announcements',
    url: '/student/syllabus',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hrs ago
    read: true,
  },
];

const HeaderNotificationCenter = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Listen for incoming system notifications (from PWA / Test Notification / Offline Sync)
  useEffect(() => {
    const handleNewNotif = (e) => {
      const { title, body, category, url } = e.detail || {};
      if (!title) return;
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: title || 'New Notification',
        body: body || '',
        category: category || 'announcements',
        url: url || '/',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    window.addEventListener('eduai-notification-received', handleNewNotif);
    return () => window.removeEventListener('eduai-notification-received', handleNewNotif);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Actions
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDeleteSingle = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenNotification = (notif) => {
    // Mark as read and navigate
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    handleClose();
    if (notif.url) {
      navigate(notif.url);
    }
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      {/* Header Bell Button */}
      <Tooltip title="Notification Center">
        <IconButton
          onClick={handleClick}
          sx={{
            p: '7px',
            borderRadius: 2.5,
            bgcolor: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            color: unreadCount > 0 ? '#3b82f6' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
            position: 'relative',
            '&:hover': {
              bgcolor: 'var(--surface-3)',
              color: 'var(--text-primary)',
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 800,
                fontSize: 10,
                height: 18,
                minWidth: 18,
              },
            }}
          >
            <NotificationsIcon sx={{ fontSize: 20 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Popover Notifications Drawer */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxWidth: '90vw',
            maxHeight: 520,
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            border: '1px solid var(--border-medium)',
            bgcolor: 'var(--surface-1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Top Control Bar */}
        <Box
          sx={{
            p: 2,
            px: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'var(--surface-2)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} color="var(--text-primary)">
              Notifications
            </Typography>
            {unreadCount > 0 ? (
              <Chip
                label={`${unreadCount} Unread`}
                size="small"
                sx={{
                  bgcolor: 'rgba(59,130,246,0.12)',
                  color: '#3b82f6',
                  fontWeight: 800,
                  fontSize: 11,
                  height: 22,
                }}
              />
            ) : (
              <Chip
                label="All Read"
                size="small"
                sx={{
                  bgcolor: 'rgba(16,185,129,0.12)',
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
          </Box>

          {/* Quick Action Buttons: Read All / Delete All */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <Button
                  size="small"
                  onClick={handleMarkAllRead}
                  startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'none',
                    color: '#3b82f6',
                    px: 1,
                  }}
                >
                  Read All
                </Button>
              </Tooltip>
            )}

            {notifications.length > 0 && (
              <Tooltip title="Clear all notifications">
                <Button
                  size="small"
                  onClick={handleDeleteAll}
                  startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'none',
                    color: '#ef4444',
                    px: 1,
                  }}
                >
                  Clear All
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 36, mb: 1 }}>🔔</Typography>
              <Typography fontWeight={700} color="var(--text-primary)">
                No notifications right now
              </Typography>
              <Typography fontSize={12} color="var(--text-tertiary)" sx={{ mt: 0.5 }}>
                You are all caught up! New alerts will appear here.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <Divider sx={{ borderColor: 'var(--border-subtle)' }} />}
                  <ListItem
                    onClick={() => handleOpenNotification(item)}
                    sx={{
                      p: 2,
                      px: 2.5,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      cursor: 'pointer',
                      bgcolor: item.read ? 'transparent' : 'rgba(59,130,246,0.04)',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: 'var(--surface-2)',
                      },
                    }}
                  >
                    {/* Unread Glow Dot */}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: item.read ? 'transparent' : '#3b82f6',
                        boxShadow: item.read ? 'none' : '0 0 8px #3b82f6',
                        mt: 0.8,
                        flexShrink: 0,
                      }}
                    />

                    {/* Notification Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                        <Typography
                          fontSize={13.5}
                          fontWeight={item.read ? 600 : 800}
                          color="var(--text-primary)"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            pr: 1,
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography fontSize={10.5} color="var(--text-tertiary)" fontWeight={500} flexShrink={0}>
                          {formatTimeAgo(item.timestamp)}
                        </Typography>
                      </Box>

                      <Typography fontSize={12} color="var(--text-secondary)" sx={{ lineHeight: 1.4, mb: 1 }}>
                        {item.body}
                      </Typography>

                      {/* Action buttons on notification item */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Button
                          size="small"
                          startIcon={<LaunchIcon sx={{ fontSize: '13px !important' }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenNotification(item);
                          }}
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'none',
                            py: 0.2,
                            px: 1,
                            borderRadius: 1.5,
                            bgcolor: 'var(--surface-3)',
                            color: 'var(--primary-color)',
                            '&:hover': { bgcolor: 'rgba(59,130,246,0.15)' },
                          }}
                        >
                          Open
                        </Button>

                        <Tooltip title={item.read ? 'Mark as unread' : 'Mark as read'}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleToggleRead(item.id, e)}
                            sx={{ color: item.read ? 'var(--text-tertiary)' : '#10b981', p: 0.5 }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete notification">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteSingle(item.id, e)}
                            sx={{ color: '#ef4444', p: 0.5, opacity: 0.8, '&:hover': { opacity: 1 } }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default HeaderNotificationCenter;
