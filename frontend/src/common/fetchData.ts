import axiosClient from './axiosClient';

export interface IFetchParams {
  status?: number | string | null;
  user_ids?: string;
}

export const fetchData = async (path: string, params: IFetchParams) => {
  try {
    const response = await axiosClient.get(path, {
      params: params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
