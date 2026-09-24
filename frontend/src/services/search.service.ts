import api from './api';
import { SearchResultResponse } from '../types/search.types';

export const SearchService = {
  async searchGlobal(keyword: string): Promise<SearchResultResponse> {
    const response = await api.get<SearchResultResponse>(`/search?q=${encodeURIComponent(keyword)}`);
    return response.data;
  },
};
