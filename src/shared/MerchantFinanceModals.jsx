import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./MerchantFinanceModals.css";

const blankPayment = {
  bankName: "",
  bankBranch: "",
  bankAccount: "",
  bankOwner: "",
  walletName: "",
  walletEmail: "",
  walletAccount: "",
  walletOwner: "",
  trc20: "",
  erc20: "",
};

export default function MerchantFinanceModals({
  client,
  merchant,
  action,
  onClose,
  actor = "Admin",
  onChanged,
}) {
  const [mode, setMode] = useState("Add");
  const [paymentTab, setPaymentTab] = useState("credit");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [lockUntil, setLockUntil] = useState("");
  const [logs, setLogs] = useState([]);
  const [logCurrency, setLogCurrency] = useState("USD");
  const [logType, setLogType] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [payment, setPayment] = useState(blankPayment);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [activeLocks, setActiveLocks] = useState([]);
  const totalFrozen = activeLocks.reduce((sum, lock) => sum + Number(lock.amount || 0), 0);

  const loadActiveLocks = async () => {
    if (!merchant?.userId) return;
    const { data } = await client
      .from("balance_locks")
      .select("*")
      .eq("seller_id", merchant.userId)
      .eq("status", "Active")
      .order("created_at", { ascending: false });
    setActiveLocks(data || []);
  };

  useEffect(() => {
    if (!merchant?.userId || !client) return;
    if (action === "Logs") loadLogs();
    if (action === "Payment") {
      setMode("Add");
      setPaymentTab("credit");
      loadPayments();
    }
    if (action === "Freeze" || action === "Unfreeze") loadActiveLocks();
  }, [action, merchant?.userId]);

  const loadLogs = async () => {
    const { data } = await client
      .from("wallet_transactions")
      .select("*")
      .eq("seller_id", merchant.userId)
      .order("created_at", { ascending: false });
    setLogs(data || []);
  };

  const loadPayments = async () => {
    const { data } = await client
      .from("payment_methods")
      .select("method_type,details")
      .eq("seller_id", merchant.userId);
    const next = { ...blankPayment };
    (data || []).forEach(({ method_type: type, details = {} }) => {
      if (type === "bank_card")
        Object.assign(next, {
          bankName: details.bankName || details.bank_name || "",
          bankBranch: details.branchName || details.branch_name || "",
          bankAccount: details.cardNumber || details.account_no || "",
          bankOwner: details.name || "",
        });
      if (type === "e_wallet")
        Object.assign(next, {
          walletName: details.walletName || details.wallet_name || "",
          walletEmail: details.walletEmail || details.wallet_email || "",
          walletAccount: details.walletNumber || details.account_no || "",
          walletOwner: details.name || "",
        });
      if (type === "digital_currency")
        Object.assign(next, {
          trc20: details.trc20 || details.usdt_trc20 || "",
          erc20: details.erc20 || details.usdt_erc20 || "",
        });
    });
    setPayment(next);
  };

  const requireLiveMerchant = () => {
    if (merchant?.userId) return true;
    setMessage("This preview merchant is not connected to a Supabase account.");
    return false;
  };

  const saveBalance = async (event) => {
    event.preventDefault();
    if (!requireLiveMerchant()) return;
    const numeric = Number(amount);
    if (!numeric || numeric < 0) return setMessage("Enter a valid amount.");
    setBusy(true);
    const signed = mode === "Deduct" ? -numeric : numeric;
    const { error } = await client.from("wallet_transactions").insert({
      seller_id: merchant.userId,
      type: `${actor} ${mode === "Deduct" ? "Debit" : "Credit"}`,
      amount: signed,
      note: `${currency}${remark ? ` · ${remark}` : ""}`,
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    onChanged?.();
    onClose();
  };

  const freezeMoney = async (event) => {
    event.preventDefault();
    if (!requireLiveMerchant()) return;
    const numeric = Number(amount || 0);
    if (!numeric || numeric <= 0)
      return setMessage("Enter an amount greater than zero to freeze.");
    setBusy(true);
    const { data: auth } = await client.auth.getUser();
    const { error } = await client.from("balance_locks").insert({
      seller_id: merchant.userId,
      amount: numeric,
      reason: remark || "Balance protection hold",
      status: "Active",
      lock_until: lockUntil || null,
      created_by: auth.user?.id,
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    onChanged?.();
    onClose();
  };

  const unfreezeMoney = async (event) => {
    event.preventDefault();
    if (!activeLocks.length) return;
    const numeric = Number(amount || 0);
    if (!numeric || numeric <= 0)
      return setMessage("Enter an amount greater than zero to unfreeze.");
    if (numeric > totalFrozen)
      return setMessage(`Cannot unfreeze more than the total frozen amount ($${totalFrozen.toFixed(2)}).`);
    setBusy(true);
    let remaining = numeric;
    const now = new Date().toISOString();
    // Release oldest locks first, partially releasing the last one if needed.
    for (const lock of [...activeLocks].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) {
      if (remaining <= 0) break;
      const lockAmount = Number(lock.amount || 0);
      if (remaining >= lockAmount) {
        await client.from("balance_locks").update({ status: "Released", released_at: now }).eq("id", lock.id);
        remaining -= lockAmount;
      } else {
        await client.from("balance_locks").update({ amount: lockAmount - remaining, reason: `${lock.reason || ""} (partially unfrozen)`.trim() }).eq("id", lock.id);
        remaining = 0;
      }
    }
    setBusy(false);
    onChanged?.();
    onClose();
  };

  const saveShopPayment = async (event) => {
    event.preventDefault();
    if (!requireLiveMerchant()) return;
    const numeric = Number(amount);
    if (!numeric || numeric <= 0)
      return setMessage("Enter a valid amount greater than zero.");
    setBusy(true);
    const { error } = await client.from("wallet_transactions").insert({
      seller_id: merchant.userId,
      type: `${actor} Credit`,
      amount: numeric,
      note: `${currency} · Shop payment${remark ? ` · ${remark}` : ""}`,
    });
    setBusy(false);
    if (error) return setMessage(error.message);
    onChanged?.();
    onClose();
  };

  const savePayment = async (event) => {
    event.preventDefault();
    if (!requireLiveMerchant()) return;
    setBusy(true);
    const rows = [
      {
        seller_id: merchant.userId,
        method_type: "bank_card",
        details: {
          name: payment.bankOwner,
          bankName: payment.bankName,
          branchName: payment.bankBranch,
          cardNumber: payment.bankAccount,
        },
        updated_at: new Date().toISOString(),
      },
      {
        seller_id: merchant.userId,
        method_type: "e_wallet",
        details: {
          name: payment.walletOwner,
          walletName: payment.walletName,
          walletEmail: payment.walletEmail,
          walletNumber: payment.walletAccount,
        },
        updated_at: new Date().toISOString(),
      },
      {
        seller_id: merchant.userId,
        method_type: "digital_currency",
        details: { trc20: payment.trc20, erc20: payment.erc20 },
        updated_at: new Date().toISOString(),
      },
    ];
    const { error } = await client
      .from("payment_methods")
      .upsert(rows, { onConflict: "seller_id,method_type" });
    setBusy(false);
    if (error) return setMessage(error.message);
    onChanged?.();
    onClose();
  };

  const filteredLogs = logs.filter((item) => {
    const created = item.created_at?.slice(0, 10) || "";
    return (
      (logType === "All" || item.type === logType) &&
      (!fromDate || created >= fromDate) &&
      (!toDate || created <= toDate)
    );
  });
  const updatePayment = (key) => (event) =>
    setPayment((current) => ({ ...current, [key]: event.target.value }));

  if (!merchant || !action) return null;

  const overlay = (
    <div
      className="merchant-finance-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      {action === "Balance" && (
        <form className="merchant-finance-modal compact" onSubmit={saveBalance}>
          <header>
            <div>
              <h3>Adjust Balance</h3>
              <p>{merchant.email}</p>
            </div>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </header>
          <div className="merchant-mode">
            <button
              type="button"
              className={mode === "Add" ? "active" : ""}
              onClick={() => setMode("Add")}
            >
              Add
            </button>
            <button
              type="button"
              className={mode === "Deduct" ? "active deduct" : ""}
              onClick={() => setMode("Deduct")}
            >
              Deduct
            </button>
          </div>
          <label>
            Currency
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CNY</option>
            </select>
          </label>
          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Please enter Amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <label>
            Remark
            <input
              placeholder="User remark (optional)"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
            />
          </label>
          {message && <p className="merchant-modal-error">{message}</p>}
          <footer>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={busy}>
              Confirm
            </button>
          </footer>
        </form>
      )}
      {action === "Freeze" && (
        <form className="merchant-finance-modal compact" onSubmit={freezeMoney}>
          <header>
            <div>
              <h3>Freeze Money</h3>
              <p>{merchant.email}</p>
            </div>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </header>
          <div className="merchant-available">
            <span>Available</span>
            <strong>{merchant.balance || "$0.00"}</strong>
          </div>
          {totalFrozen > 0 && (
            <p className="merchant-currently-frozen">
              Already frozen: <strong>${totalFrozen.toFixed(2)}</strong> — this will add to it.
            </p>
          )}
          <label>
            Amount to Freeze
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>
          <label>
            Freeze Until <small>(leave empty = permanent)</small>
            <input
              type="datetime-local"
              value={lockUntil}
              onChange={(event) => setLockUntil(event.target.value)}
            />
          </label>
          <label>
            Remark
            <input
              placeholder="Reason for freezing (optional)"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
            />
          </label>
          {message && <p className="merchant-modal-error">{message}</p>}
          <footer>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="lock-confirm" disabled={busy}>
              Freeze Money
            </button>
          </footer>
        </form>
      )}
      {action === "Unfreeze" && (
        <form className="merchant-finance-modal compact" onSubmit={unfreezeMoney}>
          <header>
            <div>
              <h3>Unfreeze Money</h3>
              <p>{merchant.email}</p>
            </div>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </header>
          <div className="merchant-available">
            <span>Currently Frozen</span>
            <strong>${totalFrozen.toFixed(2)}</strong>
          </div>
          {!activeLocks.length ? (
            <p>No frozen balance to release.</p>
          ) : (
            <>
              <label>
                Amount to Unfreeze
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={totalFrozen}
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              {message && <p className="merchant-modal-error">{message}</p>}
              <footer>
                <button type="button" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="lock-confirm" disabled={busy}>
                  Unfreeze Money
                </button>
              </footer>
            </>
          )}
        </form>
      )}
      {action === "Logs" && (
        <section className="merchant-finance-modal logs">
          <header>
            <div>
              <h3>Logs — {merchant.email}</h3>
            </div>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </header>
          <div className="merchant-log-tools">
            <select
              value={logCurrency}
              onChange={(event) => setLogCurrency(event.target.value)}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CNY</option>
            </select>
            <select
              value={logType}
              onChange={(event) => setLogType(event.target.value)}
            >
              <option value="All">Type</option>
              <option>Admin Credit</option>
              <option>Admin Debit</option>
              <option>Agent Credit</option>
              <option>Agent Debit</option>
              <option>Order</option>
              <option>Withdrawal</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
            <button type="button" onClick={loadLogs}>
              Search
            </button>
          </div>
          <div className="merchant-log-results">
            {filteredLogs.map((item) => (
              <article key={item.id}>
                <time>{new Date(item.created_at).toLocaleString()}</time>
                <strong>{item.type}</strong>
                <span>{item.note || "—"}</span>
                <b className={Number(item.amount) >= 0 ? "credit" : "debit"}>
                  {Number(item.amount) >= 0 ? "+" : ""}
                  {logCurrency} {Number(item.amount).toFixed(2)}
                </b>
              </article>
            ))}
            {!filteredLogs.length && <p>No transactions found.</p>}
          </div>
          <footer>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </footer>
        </section>
      )}
      {action === "Payment" && (
        <form
          className="merchant-finance-modal payment"
          onSubmit={paymentTab === "credit" ? saveShopPayment : savePayment}
        >
          <header>
            <div>
              <h3>Payment — {merchant.email}</h3>
              <p>Credit the shop or bind payout methods.</p>
            </div>
            <button type="button" onClick={onClose}>
              ×
            </button>
          </header>
          <div className="merchant-mode">
            <button
              type="button"
              className={paymentTab === "credit" ? "active" : ""}
              onClick={() => setPaymentTab("credit")}
            >
              Shop payment
            </button>
            <button
              type="button"
              className={paymentTab === "methods" ? "active" : ""}
              onClick={() => setPaymentTab("methods")}
            >
              Payment info
            </button>
          </div>
          {paymentTab === "credit" ? (
            <>
              <div className="merchant-available">
                <span>Current balance</span>
                <strong>{merchant.balance || "$0.00"}</strong>
              </div>
              <label>
                Currency
                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>CNY</option>
                </select>
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required={paymentTab === "credit"}
                  placeholder="Amount to add"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              <label>
                Remark
                <input
                  placeholder="Payment note (optional)"
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <h4>BANK CARD</h4>
              <div className="payment-grid">
                <input
                  placeholder="Bank name"
                  value={payment.bankName}
                  onChange={updatePayment("bankName")}
                />
                <input
                  placeholder="Branch"
                  value={payment.bankBranch}
                  onChange={updatePayment("bankBranch")}
                />
                <input
                  placeholder="Account number"
                  value={payment.bankAccount}
                  onChange={updatePayment("bankAccount")}
                />
                <input
                  placeholder="Account owner"
                  value={payment.bankOwner}
                  onChange={updatePayment("bankOwner")}
                />
              </div>
              <h4>E-WALLET</h4>
              <div className="payment-grid">
                <input
                  placeholder="Wallet name"
                  value={payment.walletName}
                  onChange={updatePayment("walletName")}
                />
                <input
                  placeholder="Wallet email"
                  value={payment.walletEmail}
                  onChange={updatePayment("walletEmail")}
                />
                <input
                  placeholder="Wallet account"
                  value={payment.walletAccount}
                  onChange={updatePayment("walletAccount")}
                />
                <input
                  placeholder="Wallet owner"
                  value={payment.walletOwner}
                  onChange={updatePayment("walletOwner")}
                />
              </div>
              <h4>DIGITAL CURRENCY</h4>
              <input
                placeholder="USDT TRC20"
                value={payment.trc20}
                onChange={updatePayment("trc20")}
              />
              <input
                placeholder="USDT ERC20"
                value={payment.erc20}
                onChange={updatePayment("erc20")}
              />
            </>
          )}
          {message && <p className="merchant-modal-error">{message}</p>}
          <footer>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={busy}>
              {paymentTab === "credit" ? "Add Payment" : "Save Methods"}
            </button>
          </footer>
        </form>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
