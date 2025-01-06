# Bulk Populate Function

This function performs a one-time bulk population of company profiles from Financial Modeling Prep API.

It:
1. Fetches all company profiles in bulk
2. Clears existing data from the company_profiles table
3. Inserts new profiles in batches of 100

## Invocation

```typescript
const { data, error } = await supabase.functions.invoke('bulk-populate')
```

## Required Environment Variables

- FMP_API_KEY: Financial Modeling Prep API key
- SUPABASE_URL: Your project's Supabase URL
- SUPABASE_SERVICE_ROLE_KEY: Your project's service role key