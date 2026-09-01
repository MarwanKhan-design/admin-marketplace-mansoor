// Parses any value (string, number, null) into a safe number.
export const parseMoney = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

// Formats a numeric or string amount as a USD currency string, e.g. "$1,234.56".
export const formatUsd = (value) => {
  const amount = parseMoney(value);
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Fetches all rows from a table in pages, to avoid Supabase's default row cap.
export const fetchPagedRows = async (client, table, pageSize = 1000) => {
  if (!client) return [];
  let allRows = [];
  let from = 0;
  while (true) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error || !data?.length) break;
    allRows = allRows.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return allRows;
};

// Fetches all wallet_transactions rows (paged).
export const fetchWalletTransactions = async (client) => {
  return fetchPagedRows(client, "wallet_transactions");
};

// Determines whether a wallet_transactions row represents a credit (money added).
export const isCreditTxn = (row) => {
  const type = String(row.type || "").toLowerCase();
  if (type.includes("debit")) return false;
  if (type.includes("credit")) return true;
  return parseMoney(row.amount) > 0;
};

// Reads a row's seller id from whichever column name it uses.
export const rowSellerId = (row) => {
  const id = row.seller_id ?? row.sellerId ?? row.user_id ?? row.userId;
  return id ? String(id) : "";
};

// Builds a Map of seller_id -> wallet balance, combining wallet_transactions,
// approved recharge requests, and approved withdrawals into one running total.
export const walletTotalsBySeller = (
  transactions = [],
  rechargeRows = [],
  withdrawalRows = [],
) => {
  const totals = new Map();
  const add = (id, amount) => {
    if (!id) return;
    totals.set(id, (totals.get(id) || 0) + amount);
  };

  (transactions || []).forEach((row) => {
    const id = rowSellerId(row);
    add(id, parseMoney(row.amount));
  });

  // Only fold in recharge_requests as balance if no wallet_transactions exist yet
  // for that seller (wallet_transactions is the source of truth once populated,
  // since approving a recharge request already inserts a wallet_transactions row).
  const hasTxns = new Set((transactions || []).map((row) => rowSellerId(row)));
  (rechargeRows || []).forEach((row) => {
    const id = rowSellerId(row);
    if (hasTxns.has(id)) return;
    if (String(row.status || "").toLowerCase() === "approved") {
      add(id, parseMoney(row.amount));
    }
  });

  (withdrawalRows || []).forEach((row) => {
    const id = rowSellerId(row);
    if (hasTxns.has(id)) return;
    if (String(row.status || "").toLowerCase() === "approved") {
      add(id, -Math.abs(parseMoney(row.amount)));
    }
  });

  return totals;
};
