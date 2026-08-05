import { useQuery } from '@tanstack/react-query';
import budgetApiService from './api';
import { BudgetFilterParams } from '../types';

export const useGetBudgetData = (params?: BudgetFilterParams) => {
  return useQuery({
    queryKey: ['budget', params],
    queryFn: () => budgetApiService.getBudgetData(params),
  });
};
