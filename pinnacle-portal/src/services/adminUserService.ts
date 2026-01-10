import api from '../lib/api';

const API_BASE_PATH = '/admin/users';

const adminUserService = {
  getAllUsers: (pageNumber = 1, category?: string) => {
    let url = `${API_BASE_PATH}?pageNumber=${pageNumber}`;
    if (category && category !== 'All') {
      url += `&category=${category}`;
    }
    return api.get(url);
  },

  updateUser: (userId: string, userData: any) => {
    return api.put(`${API_BASE_PATH}/${userId}`, userData);
  },

  deleteUser: (userId: string) => {
    return api.delete(`${API_BASE_PATH}/${userId}`);
  },

  sendEmailToUsers: ({ userIds, subject, message }: { userIds: string[], subject: string, message: string }) => {
    return api.post(`${API_BASE_PATH}/email`, { userIds, subject, message });
  },
};

export default adminUserService;
