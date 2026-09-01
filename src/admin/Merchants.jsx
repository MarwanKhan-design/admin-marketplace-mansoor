import React, { useEffect, useMemo, useState } from "react";
import "./Merchants.css";
import MerchantFinanceModals from "../shared/MerchantFinanceModals";
import MerchantControlModals from "../shared/MerchantControlModals";
import MerchantActivityModals from "../shared/MerchantActivityModals";
import { adminSupabase } from "../shared/supabase";
import { merchantActionKind } from "../shared/merchantActions";
import {
  fetchPagedRows,
  fetchWalletTransactions,
  formatUsd,
  parseMoney,
  rowSellerId,
  walletTotalsBySeller,
} from "../shared/wallet";

const LIST_ACTIONS = [
  ["Balance", "green"],
  ["Lock", "yellow"],
  ["Logs", "gray"],
  ["Payment", "blue"],
  ["Reset Pwd", "orange"],
  ["Kick", "red"],
  ["Login", "dark"],
  ["Showcase", "teal"],
  ["Add Clicks", "cyan"],
  ["Stop Clicks", "amber"],
  ["Lock Shop", "crimson"],
  ["Unlock Shop", "green"],
  ["Edit", "slate"],
  ["Risk Control", "purple"],
  ["Order", "indigo"],
  ["Click Logs", "gray"],
];

export default function Merchants() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [shopFilter, setShopFilter] = useState("All shops");
  const [trafficFilter, setTrafficFilter] = useState("All traffic");
  const [creditFilter, setCreditFilter] = useState("All credit");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [merchants, setMerchants] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const openMerchantAction = (merchant, action) =>
    setModal({
      merchant,
      action,
      kind: merchantActionKind(action),
    });

  const loadMerchants = async () => {
    if (!adminSupabase) return;
    setLoading(true);
    setLoadError("");
    const [
      { data: profiles, error: profilesError },
      transactions,
      lockRows,
      rechargeRows,
      withdrawalRows,
    ] = await Promise.all([
      adminSupabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      fetchWalletTransactions(adminSupabase),
      fetchPagedRows(adminSupabase, "balance_locks"),
      fetchPagedRows(adminSupabase, "recharge_requests"),
      fetchPagedRows(adminSupabase, "withdrawals"),
    ]);
    if (profilesError) {
      setMerchants([]);
      setLoadError(`Could not load seller accounts: ${profilesError.message}`);
    } else if (profiles) {
      const sellerProfiles = profiles.filter(
        (profile) =>
          String(profile.role || "")
            .trim()
            .toLowerCase() === "seller",
      );
      const totals = walletTotalsBySeller(
        transactions,
        rechargeRows,
        withdrawalRows,
      );
      const frozen = (lockRows || [])
        .filter(
          (entry) =>
            String(entry.status || "").toLowerCase() === "active" &&
            (!entry.lock_until || new Date(entry.lock_until) > new Date()),
        )
        .reduce((map, entry) => {
          const id = rowSellerId(entry);
          if (!id) return map;
          map[id] = (map[id] || 0) + parseMoney(entry.amount);
          return map;
        }, {});
      setMerchants(
        sellerProfiles.map((profile) => {
          const id = String(profile.id);
          const frozenAmount = frozen[id] || 0;
          const walletTotal = totals.has(id)
            ? totals.get(id)
            : parseMoney(
                profile.balance ?? profile.wallet_balance ?? profile.available_balance,
              );
          return {
            userId: profile.id,
            id: profile.id.slice(0, 8).toUpperCase(),
            name: profile.display_name || profile.email.split("@")[0],
            email: profile.email,
            balance: formatUsd(walletTotal),
            frozen: `${formatUsd(frozenAmount)} frozen`,
            frozenAmount,
            credit: profile.credit_score ?? 100,
            status: profile.allow_login === false ? "Suspended" : "Active",
            shopLocked: !!profile.shop_locked,
            trafficEnabled: profile.traffic_enabled !== false,
            agentId: profile.agent_id || "",
            joined: profile.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
          };
        }),
      );
    }
    setLoading(false);
  };
  useEffect(() => {
    loadMerchants();
  }, []);
  const visible = useMemo(
    () =>
      merchants.filter((merchant) => {
        const matchesStatus =
          statusFilter === "All" || merchant.status === statusFilter;
        const matchesShop =
          shopFilter === "All shops" ||
          (shopFilter === "Locked" && merchant.shopLocked) ||
          (shopFilter === "Open" && !merchant.shopLocked);
        const matchesTraffic =
          trafficFilter === "All traffic" ||
          (trafficFilter === "On" && merchant.trafficEnabled) ||
          (trafficFilter === "Paused" && !merchant.trafficEnabled);
        const matchesCredit =
          creditFilter === "All credit" ||
          (creditFilter === "Low" && merchant.credit < 100) ||
          (creditFilter === "Full" && merchant.credit >= 100);
        const matchesSearch = [
          merchant.name,
          merchant.email,
          merchant.id,
          merchant.agentId,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        );
        return (
          matchesStatus &&
          matchesShop &&
          matchesTraffic &&
          matchesCredit &&
          matchesSearch
        );
      }),
    [
      merchants,
      statusFilter,
      shopFilter,
      trafficFilter,
      creditFilter,
      search,
    ],
  );
  return (
    <div className="merchants-page">
      <div className="merchants-header">
        <div>
          <h2>Merchant List</h2>
          <p>
            Active registered merchants. {visible.length} of {merchants.length}{" "}
            shown
          </p>
        </div>
        <div className="merchants-header-actions">
          <button
            type="button"
            className={`merchant-top-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters((open) => !open)}
          >
            ⌕ Filters
          </button>
          <button
            type="button"
            className="merchant-icon-btn"
            onClick={loadMerchants}
            disabled={loading}
          >
            {loading ? "…" : "↻"}
          </button>
        </div>
      </div>
      <div className="merchant-toolbar">
        <div className="merchant-search-box">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search by name, email, ID, referral code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="merchant-filter-buttons">
          {["All", "Active", "Suspended"].map((item) => (
            <button
              type="button"
              key={item}
              className={`merchant-filter-btn ${statusFilter === item ? "active" : ""}`}
              onClick={() => setStatusFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {showFilters && (
        <div className="merchant-extra-filters">
          <label>
            Shop
            <select
              value={shopFilter}
              onChange={(event) => setShopFilter(event.target.value)}
            >
              <option>All shops</option>
              <option>Open</option>
              <option>Locked</option>
            </select>
          </label>
          <label>
            Traffic
            <select
              value={trafficFilter}
              onChange={(event) => setTrafficFilter(event.target.value)}
            >
              <option>All traffic</option>
              <option>On</option>
              <option>Paused</option>
            </select>
          </label>
          <label>
            Credit
            <select
              value={creditFilter}
              onChange={(event) => setCreditFilter(event.target.value)}
            >
              <option>All credit</option>
              <option>Full</option>
              <option>Low</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setShopFilter("All shops");
              setTrafficFilter("All traffic");
              setCreditFilter("All credit");
              setStatusFilter("All");
              setSearch("");
            }}
          >
            Clear
          </button>
        </div>
      )}
      {loadError && (
        <div className="merchant-load-message error">{loadError}</div>
      )}
      {!loading && !loadError && merchants.length === 0 && (
        <div className="merchant-load-message">
          No seller profile exists in Supabase yet. Create the seller Auth user,
          then assign that profile the <strong>seller</strong> role.
        </div>
      )}
      <div className="merchant-table-wrapper">
        <table className="merchant-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>MERCHANT</th>
              <th>EMAIL</th>
              <th>BALANCE</th>
              <th>CREDIT</th>
              <th>STATUS</th>
              <th>JOINED</th>
              <th>ACTIONS</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((merchant) => (
              <tr key={merchant.userId}>
                <td className="merchant-id">{merchant.id}</td>
                <td>
                  <div className="merchant-profile">
                    <div className="merchant-avatar">
                      {merchant.name[0].toUpperCase()}
                    </div>
                    <strong>{merchant.name}</strong>
                  </div>
                </td>
                <td className="merchant-email">{merchant.email}</td>
                <td className="merchant-balance">
                  <b>{merchant.balance}</b>
                  <small
                    className={
                      merchant.frozenAmount > 0 ? "merchant-frozen" : ""
                    }
                  >
                    {merchant.frozenAmount > 0 ? "▣ " : ""}
                    {merchant.frozen}
                  </small>
                </td>
                <td>
                  <span
                    className={`credit-pill ${merchant.credit < 100 ? "warning" : ""}`}
                  >
                    {merchant.credit}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-pill ${merchant.status === "Active" ? "active-status" : ""}`}
                  >
                    {merchant.status}
                  </span>
                  {merchant.shopLocked && (
                    <span className="status-pill locked-status">Shop locked</span>
                  )}
                </td>
                <td className="merchant-joined">{merchant.joined}</td>
                <td>
                  <div className="merchant-action-buttons">
                    {LIST_ACTIONS.map(([label, tone]) => (
                      <button
                        type="button"
                        className={`action-btn ${tone}`}
                        key={label}
                        onClick={() => openMerchantAction(merchant, label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="merchant-manage-links">
                    <button
                      type="button"
                      onClick={() => openMerchantAction(merchant, "Details")}
                    >
                      Details ›
                    </button>
                    <button
                      type="button"
                      className="manage"
                      onClick={() => openMerchantAction(merchant, "Manage")}
                    >
                      Manage ›
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal?.kind === "finance" && (
        <MerchantFinanceModals
          client={adminSupabase}
          merchant={modal.merchant}
          action={modal.action}
          actor="Admin"
          onClose={() => setModal(null)}
          onChanged={loadMerchants}
        />
      )}
      {modal?.kind === "control" && (
        <MerchantControlModals
          client={adminSupabase}
          merchant={modal.merchant}
          action={modal.action}
          onClose={() => setModal(null)}
          onChanged={loadMerchants}
        />
      )}
      {modal?.kind === "activity" && (
        <MerchantActivityModals
          client={adminSupabase}
          merchant={modal.merchant}
          action={modal.action}
          onClose={() => setModal(null)}
          onChanged={loadMerchants}
          openAction={(action) =>
            setModal({
              merchant: modal.merchant,
              action,
              kind: merchantActionKind(action),
            })
          }
        />
      )}
    </div>
  );
}
