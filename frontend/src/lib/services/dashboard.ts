import api from '../axios';

export interface DashboardStats {
  totals: {
    records: number;
    users: number;
    procedures: number;
    bulks: number;
  };
  today: {
    records: number;
    procedures: number;
    bulks: number;
  };
  week: {
    records: number;
    procedures: number;
  };
  month: {
    records: number;
    procedures: number;
  };
  procedureStats: {
    overdue: number;
    processing: number;
    steps: { step: number; count: number }[];
    archived: number;
  };
  byStatus: {
    records: Array<{ _id: string; count: number }>;
    procedures: Array<{ _id: string; count: number }>;
  };
  trends: {
    records: Array<{ _id: string; count: number }>;
    procedures: Array<{ _id: string; count: number }>;
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
}; 