# Supabase Migrations

These SQL files are intended to be applied to the live Supabase project in order.

## Current Migration

`20260514002000_create_analytics_tables.sql`

Creates the analytics tables used by:

- `app/api/analytics/view/route.ts`
- `app/api/analytics/cta/route.ts`

This migration is needed because runtime testing against the live Supabase project returned:

```text
Could not find the table 'public.analytics_views' in the schema cache
```

## How To Apply

Use the Supabase SQL editor for project `japmukyzwrpamgnlbgti`, or run the file through the Supabase CLI if the project is linked locally.

The migration is idempotent and ends with:

```sql
NOTIFY pgrst, 'reload schema';
```

so PostgREST should see the new tables immediately after the SQL succeeds.
