import api from '../axios';

export interface SelectableType {
  type: string;
  displayName: string;
}

export interface SelectableValue {
  _id: string;
  name?: string;
  value?: string;
  dictionary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SelectableListResponse {
  total: number;
  items: SelectableValue[];
}

export interface BulkCreateRequest {
  items: Partial<SelectableValue>[];
}

export interface BulkCreateResponse {
  message: string;
  items?: SelectableValue[];
  errors?: string[];
  created?: SelectableValue[];
}

// Get all selectable types
export const getSelectableTypes = async (): Promise<SelectableType[]> => {
  const response = await api.get('/selectable/types');
  return response.data;
};

// Get all values for a specific type (for dropdowns)
export const getAllSelectableValues = async (type: string): Promise<SelectableValue[]> => {
  const response = await api.get(`/selectable/${type}/all`);
  return response.data;
};

// Get paginated list of selectable values
export const getSelectableList = async (
  type: string,
  params?: {
    pageIndex?: number;
    pageSize?: number;
    search?: string;
  }
): Promise<SelectableListResponse> => {
  const response = await api.get(`/selectable/${type}`, { params });
  return response.data;
};

// Get one selectable value
export const getSelectableValue = async (type: string, id: string): Promise<SelectableValue> => {
  const response = await api.get(`/selectable/${type}/${id}`);
  return response.data;
};

// Create new selectable value
export const createSelectableValue = async (
  type: string,
  data: Partial<SelectableValue>
): Promise<SelectableValue> => {
  const response = await api.post(`/selectable/${type}`, data);
  return response.data;
};

// Update selectable value
export const updateSelectableValue = async (
  type: string,
  id: string,
  data: Partial<SelectableValue>
): Promise<SelectableValue> => {
  const response = await api.put(`/selectable/${type}/${id}`, data);
  return response.data;
};

// Delete selectable value
export const deleteSelectableValue = async (type: string, id: string): Promise<void> => {
  await api.delete(`/selectable/${type}/${id}`);
};

// Bulk create selectable values
export const bulkCreateSelectableValues = async (
  type: string,
  data: BulkCreateRequest
): Promise<BulkCreateResponse> => {
  const response = await api.post(`/selectable/${type}/bulk`, data);
  return response.data;
}; 