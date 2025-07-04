import api from "../axios";

export interface ActivityLog {
  _id: string;
  action: string;
  resource: string;
  documentId: string;
  description: string;
  userId: {
    _id: string;
    username: string;
    fullName: string;
  };
  createdAt: string;
}

export interface ActivityLogsResponse {
  total: number;
  items: ActivityLog[];
}

export const logsService = {
  getList: async (params?: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
    resource?: string;
  }): Promise<ActivityLogsResponse> => {
    const response = await api.get("/logs", { params });
    return response.data;
  },

  getOne: async (id: string): Promise<ActivityLog> => {
    const response = await api.get(`/logs/${id}`);
    return response.data;
  },
}; 