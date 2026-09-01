import React, { useEffect, useMemo, useState } from "react";
import "./SellerWithdraw.css";

const METHOD_TYPE = {
  "Bank Card": "bank_card",
  "E-Wallet": "e_wallet",
  Crypto: "digital_currency",
};

const CRYPTO_NETWORKS = [
  { key: "trc20", label: "USDT (TRC20)" },
  { key: "erc20", label: "USDT (ERC20)" },
  { key: "bep20", label: "USDT (BEP20)" },
];

export default function SellerWithdraw({
  client,
  sellerId,
  onBack,
  recordsOnly = false,
  onNewWithdrawal,
  onBindMethod,
  availableBalance = 0,
}) {
  const [method, setMethod] = useState("");
  const [network, setNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [tradePassword, setTradePassword] = useState("");
  const [records, setRecords] = useState([]);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({});

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
        updated: item.updated_at
          ? new Date(item.updated_at).toLocaleString()
          : new Date(item.created_at).toLocaleString(),
        status: item.status,
        reason: item.rejection_reason,
      })),
    );
    setLoading(false);
  };

  const loadPaymentMethods = async () => {
    if (!client || !sellerId) return;
    const { data, error } = await client
      .from("payment_methods")
      .select("method_type,details")
      .eq("seller_id", sellerId);
    if (error) {
      console.log("PAYMENT METHODS LOAD ERROR:", error);
      return;
    }
    const map = {};
    (data || []).forEach((row) => {
      map[row.method_type] = row.details || {};
    });
    setPaymentMethods(map);
  };

  useEffect(() => {
    loadCloudRecords();
    loadPaymentMethods();
    if (!client) return;
    const channel = client
      .channel("seller-withdrawals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "withdrawals" },
        loadCloudRecords,
      )
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, sellerId]);

  const boundDetails = method ? paymentMethods[METHOD_TYPE[method]] : null;
  const availableNetworks = useMemo(() => {
    if (method !== "Crypto" || !boundDetails) return [];
    return CRYPTO_NETWORKS.filter((item) => boundDetails[item.key]);
  }, [method, boundDetails]);

  const selectMethod = (selectedMethod) => {
    const bound = paymentMethods[METHOD_TYPE[selectedMethod]];
    if (!bound) {
      setMethodPickerOpen(false);
      const view =
        selectedMethod === "Bank Card"
          ? "bank-card"
          : selectedMethod === "E-Wallet"
            ? "e-wallet"
            : "digital-currency";
      onBindMethod?.(view);
      return;
    }
    setMethod(selectedMethod);
    if (selectedMethod === "Crypto") {
      const firstNetwork = CRYPTO_NETWORKS.find((item) => bound[item.key]);
      setNetwork(firstNetwork?.key || "");
    } else {
      setNetwork("");
    }
    setMethodPickerOpen(false);
  };

  const accountSummary = () => {
    if (!method || !boundDetails) return "";
    if (method === "Bank Card")
      return `${boundDetails.name} · ${boundDetails.bankName} · ${boundDetails.cardNumber}`;
    if (method === "E-Wallet")
      return `${boundDetails.walletName} · ${boundDetails.walletNumber} (${boundDetails.walletEmail})`;
    if (method === "Crypto" && network)
      return `${CRYPTO_NETWORKS.find((item) => item.key === network)?.label} · ${boundDetails[network]}`;
    return "";
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!client || !sellerId) return;
    setFormError("");
    if (!method || !boundDetails) {
      setFormError("Select a bound withdrawal method first.");
      return;
    }
    if (method === "Crypto" && !network) {
      setFormError("Select a network for your crypto withdrawal.");
      return;
    }
    const requested = Number(amount);
    if (!requested || requested <= 0) {
      setFormError("Enter a valid withdrawal amount.");
      return;
    }
    if (availableBalance <= 0) {
      setFormError("You have no available balance to withdraw.");
      return;
    }
    if (requested > availableBalance) {
      setFormError(
        `You can withdraw up to $${availableBalance.toFixed(2)}. That exceeds your available balance.`,
      );
      return;
    }
    const { error } = await client.from("withdrawals").insert({
      seller_id: sellerId,
      amount: requested,
      method,
      account_details: accountSummary(),
      status: "Pending",
    });
    if (error) {
      console.log("WITHDRAW SUBMIT ERROR:", error);
      setFormError(
        error.message || "Something went wrong submitting your withdrawal.",
      );
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
            {formError && (
              <div className="withdraw-error-notice">{formError}</div>
            )}
            <div className="withdraw-info">
              Available to withdraw: ${availableBalance.toFixed(2)}
            </div>
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
              {method && boundDetails && (
                <label>
                  Account Details
                  <div className="withdraw-bound-details">
                    {method === "Crypto" && availableNetworks.length > 1 && (
                      <select
                        value={network}
                        onChange={(event) => setNetwork(event.target.value)}
                      >
                        {availableNetworks.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    )}
                    <span>{accountSummary()}</span>
                  </div>
                </label>
              )}
              {method && !boundDetails && (
                <div className="withdraw-error-notice">
                  No {method} on file. Please bind one first.
                </div>
              )}
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
              <button
                type="submit"
                disabled={availableBalance <= 0 || !boundDetails}
              >
                Withdraw
              </button>
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
              <p>Select a bound payment method</p>
              {["Bank Card", "E-Wallet", "Crypto"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => selectMethod(option)}
                >
                  <span>
                    {option}
                    {!paymentMethods[METHOD_TYPE[option]] && " — not bound"}
                  </span>
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