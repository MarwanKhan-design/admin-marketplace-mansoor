import React, { useEffect, useMemo, useState } from "react";
import "./SellerLogin.css";
import "./SellerPortal.css";
import SellerMessages from "./SellerMessages";
import SellerWallet from "./SellerWallet";
import SellerShowcase from "./SellerShowcase";
import SellerOrders from "./SellerOrders";
import SellerInvite from "./SellerInvite";
import SellerFeedback from "./SellerFeedback";
import SellerService from "./SellerService";
import {
  adminSupabase,
  agentSupabase,
  sellerSupabase,
} from "../shared/supabase";
import { translations } from "./translations";

const periodKeys = ["today", "thisWeek", "thisMonth", "total"];
const periodLabels = ["Today", "This Week", "This Month", "Total"];
const faqs = [
  [
    "What is the MarketHub online store?",
    "It is a demo marketplace where sellers can showcase products and manage orders.",
  ],
  [
    "Why can't I stop selling?",
    "Please complete or cancel any pending orders before stopping store activity.",
  ],
  [
    "Why can't I recharge?",
    "Confirm your payment method and contact support if the issue continues.",
  ],
  [
    "Can I become a supplier?",
    "Supplier applications can be submitted through the Service section.",
  ],
  [
    "How long does shipping take?",
    "Shipping time depends on the product and destination, but is normally shown on each order.",
  ],
];

export default function SellerPortal({ onLogout, previewMerchant = null }) {
  const [period, setPeriod] = useState("Today");
  const [language, setLanguage] = useState("en");
  const t = translations[language] || translations.en;
  const [openFaq, setOpenFaq] = useState(null);
  const [shopName, setShopName] = useState(previewMerchant?.name || "My Shop");
  const [shopNameDraft, setShopNameDraft] = useState(
    previewMerchant?.name || "My Shop",
  );
  const [showNameModal, setShowNameModal] = useState(false);
  const [sellerView, setSellerView] = useState("home");
  const [sellerId, setSellerId] = useState(previewMerchant?.userId || null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [portalClient, setPortalClient] = useState(sellerSupabase);

  const resolvePortalClient = async () => {
    if (!previewMerchant) return sellerSupabase;
    const [adminSession, agentSession] = await Promise.all([
      adminSupabase.auth.getSession(),
      agentSupabase.auth.getSession(),
    ]);
    return adminSession.data.session
      ? adminSupabase
      : agentSession.data.session
        ? agentSupabase
        : sellerSupabase;
  };

  const loadSellerData = async () => {
    const client = await resolvePortalClient();
    if (client !== portalClient) setPortalClient(client);
    let id = previewMerchant?.userId || sellerId;
    if (!id) {
      const { data } = await client.auth.getUser();
      id = data.user?.id;
      if (id) setSellerId(id);
    }
    if (!id) return;
    const [profileRes, ordersRes, clicksRes] = await Promise.all([
      client.from("profiles").select("*").eq("id", id).maybeSingle(),
      client
        .from("orders")
        .select("*")
        .eq("seller_id", id)
        .order("created_at", { ascending: false }),
      client
        .from("merchant_clicks")
        .select("id", { count: "exact" })
        .eq("seller_id", id),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data);
      setShopName(profileRes.data.display_name || shopName);
      if (profileRes.data.language) setLanguage(profileRes.data.language);
    }
    setOrders(ordersRes.data || []);
    setClickCount(clicksRes.count || clicksRes.data?.length || 0);
  };
  useEffect(() => {
    loadSellerData();
    const channel = sellerId
      ? portalClient
          .channel(`seller-home-${sellerId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
              filter: `seller_id=eq.${sellerId}`,
            },
            loadSellerData,
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "merchant_clicks",
              filter: `seller_id=eq.${sellerId}`,
            },
            loadSellerData,
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${sellerId}`,
            },
            (payload) => {
              if (payload.new?.allow_login === false && !previewMerchant) {
                portalClient.auth.signOut();
                onLogout?.();
              }
            },
          )
          .subscribe()
      : null;
    return () => {
      if (channel) portalClient.removeChannel(channel);
    };
  }, [sellerId, portalClient]);
  const periodStart = (label) => {
    const now = new Date();
    if (label === "Today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (label === "This Week") {
      const start = new Date(now);
      const day = start.getDay();
      const diff = (day === 0 ? 6 : day - 1); // week starts Monday
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    if (label === "This Month") {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return null; // "Total" — no lower bound
  };

  const ordersInPeriod = useMemo(() => {
    const start = periodStart(period);
    if (!start) return orders;
    return orders.filter((row) => new Date(row.created_at) >= start);
  }, [orders, period]);

  const metrics = useMemo(
    () =>
      ordersInPeriod.reduce(
        (result, row) => {
          const quantity = Number(row.quantity || 1);
          result.sales += Number(row.sell_price || 0) * quantity;
          result.profit +=
            (Number(row.sell_price || 0) - Number(row.cost_price || 0)) *
            quantity;
          result.quantity += quantity;
          return result;
        },
        { sales: 0, profit: 0, quantity: 0 },
      ),
    [ordersInPeriod],
  );

  // Build hourly sales totals for today's chart (00:00–22:00 in 2-hour buckets, matching the existing 12-bar layout)
  const chartBuckets = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => 0);
    const start = periodStart("Today");
    orders.forEach((row) => {
      const created = new Date(row.created_at);
      if (created < start) return;
      const bucketIndex = Math.min(11, Math.floor(created.getHours() / 2));
      const quantity = Number(row.quantity || 1);
      buckets[bucketIndex] += Number(row.sell_price || 0) * quantity;
    });
    const max = Math.max(1, ...buckets);
    return buckets.map((value) => ({ value, heightPct: Math.round((value / max) * 100) }));
  }, [orders]);

  const toggleLanguage = async () => {
    const next = language === "en" ? "zh" : "en";
    setLanguage(next);
    if (sellerId && portalClient)
      await portalClient.from("profiles").update({ language: next }).eq("id", sellerId);
  };

  const saveShopName = async (event) => {
    event.preventDefault();
    const nextName = shopNameDraft.trim();
    if (!nextName || profile?.name_changed) return;
    setShopName(nextName);
    if (sellerId && portalClient)
      await portalClient
        .from("profiles")
        .update({ display_name: nextName, name_changed: true })
        .eq("id", sellerId);
    setProfile((current) => (current ? { ...current, display_name: nextName, name_changed: true } : current));
    setShowNameModal(false);
  };

  if (sellerView === "messages")
    return (
      <SellerMessages
        client={portalClient}
        sellerId={sellerId}
        language={language}
        onBack={() => setSellerView("home")}
      />
    );
  if (sellerView === "wallet")
    return (
      <SellerWallet
        client={portalClient}
        sellerId={sellerId}
        onBack={() => setSellerView("home")}
      />
    );
  if (sellerView === "showcase")
    return (
      <SellerShowcase
        client={portalClient}
        sellerId={sellerId}
        shopLocked={profile?.shop_locked === true}
        onBack={() => setSellerView("home")}
      />
    );
  if (sellerView === "orders")
    return (
      <SellerOrders
        client={portalClient}
        sellerId={sellerId}
        onBack={() => setSellerView("home")}
      />
    );
  if (sellerView === "invite")
    return (
      <SellerInvite
        client={portalClient}
        sellerId={sellerId}
        onBack={() => setSellerView("home")}
      />
    );
  if (sellerView === "feedback")
    return (
      <SellerFeedback
        client={portalClient}
        sellerId={sellerId}
        onBack={() => setSellerView("home")}
      />
    );
  if (sellerView === "service")
    return (
      <SellerService
        client={portalClient}
        sellerId={sellerId}
        onBack={() => setSellerView("home")}
      />
    );

  return (
    <main className="seller-center-page">
      <div className="seller-center-shell">
        <header className="seller-center-topbar">
          <button type="button" onClick={onLogout} aria-label="Sign out">
            ↪
          </button>
          <h1>{t.sellerCenter}</h1>
          <div>
            <button
              type="button"
              onClick={() => setSellerView("messages")}
              aria-label="Messages"
            >
              ◌
            </button>
            <button type="button" onClick={toggleLanguage} aria-label="Language" title={language === "en" ? "中文" : "English"}>
              {language === "en" ? "EN" : "中文"}
            </button>
          </div>
        </header>
        <section className="seller-profile-row">
          <div className="seller-avatar">
            {shopName.charAt(0).toUpperCase()}
          </div>
          <div className="seller-profile-copy">
            <div>
              <h2>{shopName}</h2>
              <button
                type="button"
                disabled={profile?.name_changed === true}
                onClick={() => {
                  setShopNameDraft(shopName);
                  setShowNameModal(true);
                }}
                aria-label="Edit shop name"
              >
                ✎
              </button>
            </div>
            <span>Credit Score {profile?.credit_score ?? 100}</span>
          </div>
          <button
            className="seller-wallet-btn"
            type="button"
            onClick={() => setSellerView("wallet")}
          >
            {t.wallet}
          </button>
        </section>
        <nav className="seller-primary-links">
          <button type="button" onClick={() => setSellerView("showcase")}>
            ▣ <strong>{t.showcase}</strong>
          </button>
          <button type="button" onClick={() => setSellerView("orders")}>
            ▤ <strong>{t.orders}</strong>
          </button>
        </nav>
        <section className="seller-traffic-banner">
          <strong>
            Market<span>·</span>
            <br />
            Hub
          </strong>
          <div>
            Grow with <b>Marketplace Traffic</b>
            <br />
            <em>Demo</em> product exposure
          </div>
          <i />
        </section>
        <div className="seller-period-tabs">
          {periodKeys.map((key, index) => {
            const label = periodLabels[index];
            return (
              <button
                type="button"
                key={label}
                className={period === label ? "active" : ""}
                onClick={() => setPeriod(label)}
              >
                {t[key]}
              </button>
            );
          })}
        </div>
        <section className="seller-metrics">
          <h2>{t.keyMetrics}</h2>
          <div className="seller-metric-grid">
            <article className="sales-card">
              <span>{t.totalSales}</span>
              <strong>${metrics.sales.toFixed(2)}</strong>
            </article>
            <article>
              <span>{t.expectedProfit}</span>
              <strong>${metrics.profit.toFixed(2)}</strong>
            </article>
            <article>
              <span>{t.orderQuantity}</span>
              <strong>{metrics.quantity}</strong>
            </article>
            <article>
              <span>{t.productClicks}</span>
              <strong>{clickCount.toLocaleString()}</strong>
            </article>
          </div>
        </section>
        <section className="seller-sales-chart">
          <h2>Total Sales</h2>
          <div className="chart-area">
            <div className="chart-y">
              <span>4</span>
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>
            <div className="chart-plot">
              <div className="chart-line">
                {chartBuckets.map((bucket, index) => (
                  <i key={index} style={{ height: `${Math.max(4, bucket.heightPct)}%` }} title={`$${bucket.value.toFixed(2)}`} />
                ))}
              </div>
              <div className="chart-times">
                {[
                  "00:00",
                  "02:00",
                  "04:00",
                  "06:00",
                  "08:00",
                  "10:00",
                  "12:00",
                  "14:00",
                  "16:00",
                  "18:00",
                  "20:00",
                  "22:00",
                ].map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <i /> Total Sales
          </div>
        </section>
        <nav className="seller-help-links">
          <button type="button" onClick={() => setSellerView("invite")}>
            <b>♙＋</b>
            <span>Invite</span>
          </button>
          <button type="button" onClick={() => setSellerView("feedback")}>
            <b>⌕</b>
            <span>Feedback</span>
          </button>
          <button type="button" onClick={() => setSellerView("service")}>
            <b>♧</b>
            <span>Service</span>
          </button>
        </nav>
        <section className="seller-faq">
          <h2>FAQ</h2>
          {faqs.map(([question, answer], index) => (
            <article key={question}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{question}</span>
                <b>{openFaq === index ? "⌄" : "›"}</b>
              </button>
              {openFaq === index && <p>{answer}</p>}
            </article>
          ))}
        </section>
      </div>
      {showNameModal && (
        <div
          className="shop-name-modal-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setShowNameModal(false)
          }
        >
          <form className="shop-name-modal" onSubmit={saveShopName}>
            <div className="shop-name-modal-header">
              <button type="button" onClick={() => setShowNameModal(false)}>
                ×
              </button>
              <h2>Edit Shop Name</h2>
              <span />
            </div>
            <div className="shop-name-modal-body">
              <p>Shop name can only be changed once</p>
              <input
                autoFocus
                maxLength="40"
                value={shopNameDraft}
                onChange={(event) => setShopNameDraft(event.target.value)}
                aria-label="Shop name"
              />
              <button type="submit" disabled={!shopNameDraft.trim()}>
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
