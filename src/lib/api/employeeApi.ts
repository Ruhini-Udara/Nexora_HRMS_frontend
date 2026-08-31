import api from '../axiosInstance';

export const getDistinctBranches = async (): Promise<string[]> => {
    const response = await api.get('/api/employees/branches');
    return response.data;
};
