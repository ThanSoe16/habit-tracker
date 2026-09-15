import { z } from 'zod';
import { accountService } from '@/lib/supabase/account-client';
import { DataRequestError, readCompleteList, requireResult } from '@/lib/supabase/request';
import {
  savingsGoalInputSchema,
  savingsGoalSchema,
  savingsPageSchema,
  savingsTransactionInputSchema,
  savingsTransactionSchema,
  savingsBalanceSchema,
} from '../types';

const goalColumns =
  'id,user_id,name,currency,target_amount,unlock_date,unlock_rule,note,balance,target_reached_at,created_at';
const transactionColumns = 'id,user_id,goal_id,kind,amount,person,note,to_budget,created_at';
export const SAVINGS_PAGE_SIZE = 10;
type AccountClient = Awaited<ReturnType<typeof accountService.getClient>>;

// Uses the approved captured-session client. Generate Database types from the migrated
// database before introducing SupabaseClient<Database> (see docs/savings.md).
export function createSavingsService(getClient = accountService.getClient) {
  async function clientFor(userId: string): Promise<AccountClient> {
    z.string().uuid().parse(userId);
    const client = await getClient();
    if (client.userId !== userId)
      throw new DataRequestError('Your session changed. Please reload.');
    return client;
  }
  function parse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) throw new DataRequestError('Savings data was incomplete. Please refresh.');
    return result.data;
  }
  return {
    async balances(userId: string, signal?: AbortSignal) {
      const { supabase } = await clientFor(userId);
      let request = supabase
        .from('savings_goals')
        .select('id,currency,balance', { count: 'exact' })
        .eq('user_id', userId)
        .order('id');
      if (signal) request = request.abortSignal(signal);
      const result = await readCompleteList(request);
      return parse(z.array(savingsBalanceSchema), result.data);
    },
    async list(userId: string, page: number, signal?: AbortSignal) {
      savingsPageSchema.parse(page);
      const { supabase } = await clientFor(userId);
      let request = supabase
        .from('savings_goals')
        .select(goalColumns, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .order('id')
        .range((page - 1) * SAVINGS_PAGE_SIZE, page * SAVINGS_PAGE_SIZE - 1);
      if (signal) request = request.abortSignal(signal);
      const result = await request;
      const rows = parse(z.array(savingsGoalSchema), requireResult(result));
      if (
        result.count === null ||
        result.count < 0 ||
        !Number.isSafeInteger(result.count) ||
        rows.length !==
          Math.min(SAVINGS_PAGE_SIZE, Math.max(0, result.count - (page - 1) * SAVINGS_PAGE_SIZE))
      )
        throw new DataRequestError('Savings data changed or was incomplete. Please refresh.');
      return { rows, total: result.count };
    },
    async history(userId: string, goalId: string, page: number, signal?: AbortSignal) {
      z.string().uuid().parse(goalId);
      savingsPageSchema.parse(page);
      const { supabase } = await clientFor(userId);
      let request = supabase
        .from('savings_transactions')
        .select(transactionColumns, { count: 'exact' })
        .eq('user_id', userId)
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .order('id')
        .range((page - 1) * SAVINGS_PAGE_SIZE, page * SAVINGS_PAGE_SIZE - 1);
      if (signal) request = request.abortSignal(signal);
      const result = await request;
      const rows = parse(z.array(savingsTransactionSchema), requireResult(result));
      if (
        result.count === null ||
        !Number.isSafeInteger(result.count) ||
        result.count < 0 ||
        rows.length !==
          Math.min(SAVINGS_PAGE_SIZE, Math.max(0, result.count - (page - 1) * SAVINGS_PAGE_SIZE))
      )
        throw new DataRequestError('Savings history was incomplete. Please refresh.');
      return { rows, total: result.count };
    },
    async create(userId: string, requestId: string, input: unknown) {
      z.string().uuid().parse(requestId);
      const payload = savingsGoalInputSchema.parse(input);
      const { supabase } = await clientFor(userId);
      const result = await supabase
        .rpc('create_savings_goal', {
          p_id: requestId,
          p_name: payload.name,
          p_currency: payload.currency,
          p_target_amount: payload.target_amount,
          p_unlock_date: payload.unlock_date,
          p_unlock_rule: payload.unlock_rule,
          p_note: payload.note,
        })
        .single();
      return parse(
        savingsGoalSchema,
        requireResult(result, 'Could not create savings. Please try again.'),
      );
    },
    async transact(userId: string, requestId: string, input: unknown) {
      z.string().uuid().parse(requestId);
      const payload = savingsTransactionInputSchema.parse(input);
      const { supabase } = await clientFor(userId);
      const result = await supabase
        .rpc('record_savings_transaction', {
          p_id: requestId,
          p_goal_id: payload.goal_id,
          p_kind: payload.kind,
          p_amount: payload.amount,
          p_person: payload.person,
          p_note: payload.note,
          p_to_budget: payload.to_budget,
        })
        .single();
      const message =
        result.error?.code === 'P0001'
          ? 'This saving is still locked. Refresh to check its rules.'
          : result.error?.code === 'P0002'
            ? 'The amount exceeds your savings balance.'
            : 'Could not save this transaction. Retry with the same details to avoid duplicates.';
      return parse(savingsGoalSchema, requireResult(result, message));
    },
  };
}
export const savingsService = createSavingsService();
