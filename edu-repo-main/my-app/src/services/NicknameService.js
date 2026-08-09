import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/nicknames';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

class NicknameServiceAPI {
  getUserNicknames(userId) {
    return axios.get(`${API_BASE_URL}/user/${userId}`, getConfig());
  }

  checkAndUnlock(userId) {
    return axios.post(`${API_BASE_URL}/check/${userId}`, {}, getConfig());
  }

  equipNickname(userId, nicknameId) {
    return axios.post(`${API_BASE_URL}/equip`, { userId, nicknameId }, getConfig());
  }
}

export default new NicknameServiceAPI();
