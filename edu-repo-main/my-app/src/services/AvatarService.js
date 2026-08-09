import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/avatar';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

class AvatarService {
    getCurrent(userId) {
        return axios.get(`${API_BASE_URL}/${userId}`, getConfig());
    }

    getItems(userId) {
        return axios.get(`${API_BASE_URL}/items/${userId}`, getConfig());
    }

    save(userId, configData) {
        return axios.post(`${API_BASE_URL}/save/${userId}`, configData, getConfig());
    }

    buy(userId, itemId) {
        return axios.post(`${API_BASE_URL}/buy/${userId}`, { itemId }, getConfig());
    }

    equip(userId, category, itemKey) {
        return axios.post(`${API_BASE_URL}/equip/${userId}`, { category, itemKey }, getConfig());
    }
}

export default new AvatarService();
