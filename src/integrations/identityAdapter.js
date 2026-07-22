function normalizeIdentityAccount(account = {}) {
  return {
    ...account,
    provider: String(account.provider || '').trim().toLowerCase(),
    email: String(account.email || '').trim().toLowerCase(),
    active: account.active !== false
  };
}

function buildIdentityProjection(accounts = []) {
  const normalizedAccounts = accounts.map(normalizeIdentityAccount);
  const validation = normalizedAccounts.map((account) => ({
    id: account.id,
    ok: Boolean(account.id && account.provider && account.email)
  }));
  const ok = validation.every((entry) => entry.ok);

  return {
    ok,
    accounts: normalizedAccounts,
    validation,
    summary: {
      total: normalizedAccounts.length,
      active: normalizedAccounts.filter((account) => account.active).length
    }
  };
}

export {
  normalizeIdentityAccount,
  buildIdentityProjection
};
