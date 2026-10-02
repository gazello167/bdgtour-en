export async function queryD1(sql: string, params: unknown[] = []) {
  const env = (k: string) => process.env[k] ?? import.meta.env[k];
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env('CF_ACCOUNT_ID')}/d1/database/${env('CF_DATABASE_ID')}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env('CF_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    }
  );
  const data = await res.json();
  if (!data.success) {
    throw new Error('D1 query gagal: ' + JSON.stringify(data.errors));
  }
  return (data.result?.[0]?.results ?? []) as any[];
}