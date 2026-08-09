import React from 'react';
import NicknameDialog from './NicknameDialog';
import { getUserIdFromToken } from '../utils/authHelper';
import { useNavigate } from 'react-router-dom';

const NicknamesPage = () => {
  const userId = getUserIdFromToken() || 1;
  const navigate = useNavigate();

  return (
    <NicknameDialog
      open={true}
      onClose={() => navigate('/student')}
      userId={userId}
      onEquipSuccess={() => {
        window.dispatchEvent(new Event('nickname-changed'));
      }}
    />
  );
};

export default NicknamesPage;
