import { z } from 'zod';
import { accountService } from '@/lib/supabase/account-client';
import { DataRequestError, readCompleteList, requireResult } from '@/lib/supabase/request';
import { fundTransactionInputSchema, fundTransactionSchema, getFundMonthBounds } from '../types';

const columns = 'id,user_id,title,amount,date,note,created_at,kind,person,money_source';
// Captured-session client, as used by savings. See docs/relationship-funds.md
// for the actual database type-generation prerequisite.
export function createRelationshipFundService(getClient = accountService.getClient) {
  async function clientFor(userId: string) {
    z.string().uuid().parse(userId);
    const client = await getClient();
    if (client.userId !== userId)
      throw new DataRequestError('Your session changed. Please reload.');
    return client.supabase;
  }
  function parse<T>(schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) throw new DataRequestError('Fund data was incomplete. Please refresh.');
    return result.data;
  }
  return {
    async month(
      userId: string,
      month: string | null,
      signal?: AbortSignal,
      person: 'ALL' | 'TSO' | 'Nway' = 'ALL',
    ) {
      z.enum(['ALL', 'TSO', 'Nway']).parse(person);
      const bounds = month === null ? null : getFundMonthBounds(month);
      const client = await clientFor(userId);
      let request = client
        .from('relationship_fund_transactions')
        .select(columns, { count: 'exact' })
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('id');
      if (person !== 'ALL') request = request.eq('person', person);
      if (bounds) request = request.gte('date', bounds.start).lte('date', bounds.end);
      if (signal) request = request.abortSignal(signal);
      const result = await readCompleteList(request);
      return parse(z.array(fundTransactionSchema), result.data);
    },
    async save(userId: string, id: string, input: unknown, mode: 'create' | 'edit') {
      z.string().uuid().parse(id);
      const payload = fundTransactionInputSchema.parse(input);
      const client = await clientFor(userId);
      const request =
        mode === 'create'
          ? client.from('relationship_fund_transactions').insert({ id, ...payload })
          : client
              .from('relationship_fund_transactions')
              .update(payload)
              .eq('user_id', userId)
              .eq('id', id);
      const result = await request.select(columns).single();
      // An identical retry after a lost create response must not duplicate transactions.
      if (mode === 'create' && result.error?.code === '23505') {
        const existing = await client
          .from('relationship_fund_transactions')
          .select(columns)
          .eq('user_id', userId)
          .eq('id', id)
          .single();
        const row = parse(fundTransactionSchema, requireResult(existing));
        if (
          row.title === payload.title &&
          row.amount === payload.amount &&
          row.date === payload.date &&
          row.note === payload.note &&
          row.kind === payload.kind &&
          row.person === payload.person &&
          row.money_source === payload.money_source
        )
          return row;
        throw new DataRequestError(
          'This transaction was already saved with different details. Refresh to review it.',
        );
      }
      return parse(
        fundTransactionSchema,
        requireResult(result, 'Could not save the transaction. Please try again.'),
      );
    },
    async remove(userId: string, id: string) {
      z.string().uuid().parse(id);
      const client = await clientFor(userId);
      const result = await client
        .from('relationship_fund_transactions')
        .delete()
        .eq('user_id', userId)
        .eq('id', id)
        .select(columns)
        .single();
      return parse(
        fundTransactionSchema,
        requireResult(result, 'Could not delete the transaction. Refresh and try again.'),
      );
    },
  };
}
export const relationshipFundService = createRelationshipFundService();
