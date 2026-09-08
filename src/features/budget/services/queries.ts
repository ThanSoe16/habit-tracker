'use client';
import { useQueryIdentity } from '@/components/providers/query-provider';
import { budgetKeys } from './query-keys';
import { useQuery } from '@tanstack/react-query';
import budgetApiService from './api';
import { BudgetFilterParams } from '../types';

export const useGetBudgetData = (params?: BudgetFilterParams) => {
  const userId = useQueryIdentity();
  return useQuery({
    queryKey: budgetKeys.list(userId, params),
    retry: false,
    queryFn: () => budgetApiService.getBudgetData(params),
    enabled: Boolean(userId),
  });
};
