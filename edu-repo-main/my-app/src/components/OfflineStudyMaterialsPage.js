import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  Grid, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import { getOfflineStudyMaterials, deleteOfflineStudyMaterial } from '../utils/offlineStorage';

const OfflineStudyMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchMaterials = async () => {
    const data = await getOfflineStudyMaterials();
    setMaterials(data);
  };

  useEffect(() => {
    fetchMaterials();
    window.addEventListener('offline-materials-changed', fetchMaterials);
    return () => window.removeEventListener('offline-materials-changed', fetchMaterials);
  }, []);

  const handleDelete = async (id) => {
    await deleteOfflineStudyMaterial(id);
    fetchMaterials();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#1e293b">
            📂 Downloaded Offline Materials
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Access notes, syllabus, and study resources anywhere — even without internet.
          </Typography>
        </Box>
        <Chip
          icon={<DownloadDoneIcon />}
          label={`${materials.length} Materials Saved`}
          sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 800, fontSize: 13, py: 2, px: 1 }}
        />
      </Box>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            border: '2px dashed #e2e8f0',
            bgcolor: '#ffffff',
          }}
        >
          <Typography sx={{ fontSize: 48, mb: 1 }}>📚</Typography>
          <Typography variant="h6" fontWeight={800} color="#1e293b">
            No Offline Materials Downloaded Yet
          </Typography>
          <Typography fontSize={14} color="text.secondary" sx={{ mt: 1, maxWidth: 450, mx: 'auto' }}>
            Go to the Syllabus or Study Materials hub and click <b>"Download Offline"</b> on any module to save it for offline reading.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {materials.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ height: 6, bgcolor: '#3b82f6' }} />
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip
                      icon={<DownloadDoneIcon sx={{ fontSize: '14px !important' }} />}
                      label="Offline Available ⚡"
                      size="small"
                      sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 800, fontSize: 11 }}
                    />
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" fontWeight={800} color="#1e293b" sx={{ mb: 0.5 }}>
                    {item.moduleName || item.title || 'Study Unit'}
                  </Typography>

                  <Typography fontSize={12} color="text.secondary" sx={{ mb: 2 }}>
                    Subject: {item.subjectName || 'General Academic'}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<MenuBookIcon />}
                    onClick={() => setSelectedDoc(item)}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#1e293b',
                      color: 'white',
                      fontWeight: 800,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#0f172a' },
                    }}
                  >
                    Read Offline
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Offline Reader Dialog */}
      <Dialog
        open={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={800}>
              {selectedDoc?.moduleName || selectedDoc?.title}
            </Typography>
            <Chip label="Offline Reader 📖" size="small" color="success" sx={{ fontWeight: 800 }} />
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, minHeight: 300 }}>
          <Typography fontSize={14} color="#334155" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {selectedDoc?.content || selectedDoc?.description || 'Content saved offline for student reference.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedDoc(null)} variant="contained" sx={{ fontWeight: 800, borderRadius: 3 }}>
            Close Reader
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfflineStudyMaterialsPage;
