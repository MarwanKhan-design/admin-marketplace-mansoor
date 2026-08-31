import React, { useEffect, useState } from "react";
import "./SellerWithdraw.css";

export default function SellerWithdraw({
  client,
  sellerId,
  onBack,
  recordsOnly = false,
  onNewWithdrawal,
}) {
  const [method, setMethod] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [tradePassword, setTradePassword] = useState("");
  const [records, setRecords] = useState([]);
  const [notice, setNotice] = useState("");
  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const visibleRecords =
    statusFilter === "All"
      ? records
      : records.filter((record) => record.status === statusFilter);

  const loadCloudRecords = async () => {
    if (!client || !sellerId) return;
    setLoading(true);
    const { data } = await client
      .from("withdrawals")
      .select("*")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });
    setRecords(
      (data || []).map((item) => ({
        id: item.id.toString().slice(0, 8).toUpperCase() + "...",
        dbId: item.id,
        amount: Number(item.amount),
        method: item.method,
        account: item.account_details,
        date: new Date(item.created_at).toLocaleString(),
        updated: item.updated_at ? new Date(item.updated_at).toLocaleString() : new Date(item.created_at).toLocaleString(),
        status: item.status,
        reason: item.rejection_reason,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    loadCloudRecords();
    if (!client) return;
    const channel = client
      .channel("seller-withdrawals")
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, loadCloudRecords)
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, sellerId]);

  const selectMethod = (selectedMethod) => {
    setMethod(selectedMethod);
    setAccount("");
    setMethodPickerOpen(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!client || !sellerId) return;
    const { error } = await client.from("withdrawals").insert({
      seller_id: sellerId,
      amount: Number(amount),
      method,
      account_details: account,
      status: "Pending",
    });
    if (error) {
      console.log("WITHDRAW SUBMIT ERROR:", error);
      return;
    }
    setAmount("");
    setTradePassword("");
    setNotice("Withdrawal request submitted for review.");
    window.setTimeout(() => setNotice(""), 2200);
  };

  return (
    <main className="seller-withdraw-page">
      <div className="seller-withdraw-shell">
        <header>
          <button type="button" onClick={onBack}>
            ‹
          </button>
          <h1>{recordsOnly ? "Withdrawal Records" : "Withdraw"}</h1>
          {recordsOnly ? (
            <button
              className="withdraw-header-refresh"
              type="button"
              onClick={loadCloudRecords}
            >
              Refresh
            </button>
          ) : (
            <span />
          )}
        </header>
        {!recordsOnly && (
          <>
            {notice && <div className="withdraw-success-notice">{notice}</div>}
            <div className="withdraw-info">
              Withdrawal requests are reviewed by our team and processed within
              1–3 business days. Your balance will be held until the request is
              approved.
            </div>
            <form className="withdraw-form" onSubmit={submit}>
              <label>
                Withdraw Method
                <button
                  className={`withdraw-method-trigger${method ? " selected" : ""}`}
                  type="button"
                  onClick={() => setMethodPickerOpen(true)}
                >
                  <span>{method || "Select withdraw method"}</span>
                  <span>›</span>
                </button>
              </label>
              <label>
                Account Details
                <input
                  required
                  placeholder={
                    method === "Bank Card"
                      ? "Bank account number / name"
                      : method === "E-Wallet"
                        ? "E-wallet account number / name"
                        : method === "Crypto"
                          ? "Wallet address / network"
                          : "Enter account details"
                  }
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                />
              </label>
              <label>
                Amount $
                <input
                  required
                  min="1"
                  step="0.01"
                  type="number"
                  placeholder="Enter withdraw amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              <label>
                Trade Password
                <input
                  required
                  type="password"
                  placeholder="Enter trade password"
                  value={tradePassword}
                  onChange={(event) => setTradePassword(event.target.value)}
                />
              </label>
              <button type="submit">Withdraw</button>
            </form>
          </>
        )}
        {recordsOnly && (
          <nav className="withdraw-record-filters">
            {["All", "Pending", "Approved", "Rejected"].map((filter) => (
              <button
                className={statusFilter === filter ? "active" : ""}
                type="button"
                key={filter}
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </nav>
        )}
        <section
          className={`withdraw-records${recordsOnly ? " records-only" : ""}`}
        >
          {!recordsOnly && (
            <div>
              <h2>Withdrawal Records</h2>
              <button type="button" onClick={loadCloudRecords}>
                Refresh
              </button>
            </div>
          )}
          {visibleRecords.length ? (
            visibleRecords.map((record) => (
              <article key={record.dbId}>
                <span
                  className={`seller-withdraw-status ${record.status.toLowerCase()}`}
                >
                  {record.status === "Approved"
                    ? "✓"
                    : record.status === "Rejected"
                      ? "⊗"
                      : "◷"}{" "}
                  {record.status}
                </span>
                <div className="withdraw-record-grid">
                  <dl>
                    <dt>WITHDRAWAL ID</dt>
                    <dd>{record.id}</dd>
                    <dt>AMOUNT</dt>
                    <dd>${record.amount.toFixed(2)}</dd>
                    <dt>ACCOUNT / WALLET</dt>
                    <dd>{record.account}</dd>
                    <dt>REQUESTED ON</dt>
                    <dd>{record.date}</dd>
                    {recordsOnly && (
                      <>
                        <dt>LAST UPDATED</dt>
                        <dd>{record.updated || record.date}</dd>
                      </>
                    )}
                  </dl>
                  <dl>
                    <dt>METHOD</dt>
                    <dd>{record.method}</dd>
                  </dl>
                </div>
                {record.reason && (
                  <div className="withdraw-rejection">
                    <strong>REJECTION REASON</strong>
                    <p>{record.reason}</p>
                  </div>
                )}
              </article>
            ))
          ) : (
            <div className="withdraw-empty">
              <b>!</b>
              <strong>No withdrawal records</strong>
              <span>
                {loading
                  ? "Loading..."
                  : `No ${statusFilter.toLowerCase()} withdrawals found.`}
              </span>
              <button type="button" onClick={onNewWithdrawal}>
                Make a Withdrawal
              </button>
            </div>
          )}
        </section>
        {recordsOnly && (
          <div className="withdraw-new-action">
            <button type="button" onClick={onNewWithdrawal}>
              Submit New Withdrawal
            </button>
          </div>
        )}
        {!recordsOnly && methodPickerOpen && (
          <div
            className="withdraw-method-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setMethodPickerOpen(false);
            }}
          >
            <section
              className="withdraw-method-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Choose withdrawal method"
            >
              <p>Please bind a payment method first</p>
              {["Bank Card", "E-Wallet", "Crypto"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => selectMethod(option)}
                >
                  <span>{option}</span>
                  <span>›</span>
                </button>
              ))}
              <button
                className="withdraw-method-cancel"
                type="button"
                onClick={() => setMethodPickerOpen(false)}
              >
                Cancel
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}