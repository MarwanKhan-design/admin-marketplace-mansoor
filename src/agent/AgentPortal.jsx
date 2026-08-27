import React, { useEffect, useMemo, useState } from "react";
import { agentSupabase } from "../shared/supabase";
import MerchantFinanceModals from "../shared/MerchantFinanceModals";
import MerchantControlModals from "../shared/MerchantControlModals";
import MerchantActivityModals from "../shared/MerchantActivityModals";
import "./AgentPortal.css";
import "./AgentTeam.css";
import "./AgentUnregistered.css";
import "./AgentApplications.css";
import "./AgentMerchantList.css";
import "./AgentShowcase.css";
import "./AgentBoundAddresses.css";
import "./AgentCreditLogs.css";
import "./AgentBalanceLocks.css";
import "./AgentOrderManagement.css";
import "./AgentOrderList.css";
import "./AgentBatchShip.css";
import "./AgentBatchReceive.css";
import "./AgentAutoOrder.css";
import "./AgentOrderRecords.css";
import "./AgentGeneralConfig.css";
import "./AgentMessages.css";
import "./AgentAnnouncements.css";
import "./AgentRechargeOrders.css";
import "./AgentWithdrawOrders.css";
import "./AgentSellerChat.css";
import "./AgentVirtualBuyers.css";
import "./AgentBuyerMessages.css";
import "./AgentFinalPages.css";

const groups = [
  { label: "", items: [["Dashboard", "▦"]] },
  { label: "AGENT SYSTEM", items: [["Agents", "♧"]] },
  {
    label: "MERCHANTS",
    items: [
      ["Unregistered", "♙"],
      ["Applications", "▤"],
      ["Merchant List", "♧"],
      ["Showcases", "⌂"],
      ["Bound Addresses", "⌖"],
      ["Credit Logs", "▭"],
      ["Balance Locks", "▣"],
    ],
  },
  {
    label: "ORDERS",
    items: [
      ["Order Management", "▣"],
      ["Order List", "▤"],
      ["Batch Ship", "♧"],
      ["Batch Receive", "◇"],
      ["Auto Order", "ϟ"],
      ["Order Records", "◴"],
      ["General Config", "⚙"],
      ["Messages", "✉"],
      ["Announcements", "▤"],
    ],
  },
  {
    label: "FINANCE",
    items: [
      ["Recharge Orders", "▣"],
      ["Withdraw Orders", "▥"],
      ["Chat", "◯"],
      ["Virtual Buyer – Shop", "♙"],
      ["Buyer Messages", "✉"],
      ["Shop – System", "▣"],
    ],
  },
  {
    label: "OTHER",
    items: [
      ["Earnings", "$"],
      ["Feedbacks", "▤"],
      ["Audit Logs", "▧"],
      ["My Account", "♧"],
    ],
  },
];

const notifications = [
  [
    "Order Paid — Pending Shipment",
    "Order TT6133610796740 has been paid ($160.08). The seller will ship it shortly.",
    "Aug 10, 2026",
  ],
  ["📣 orders", "hey", "Aug 8, 2026"],
  ["Seller Replied", "Khan321 replied: “Hello”", "Aug 8, 2026"],
  ["Seller Replied", "Khan replied: “Hello”", "Aug 5, 2026"],
  ["Seller Replied", "Khan replied: “Yes this available”", "Aug 5, 2026"],
  [
    "New Withdrawal Request",
    "Khan has submitted a withdrawal request of $155.00 via Bank Card.",
    "Aug 4, 2026",
  ],
  ["Seller Replied", "Khan replied: “Yes”", "Aug 4, 2026"],
  [
    "Order Shipped — Pending Receipt",
    "Order TT5768241121650 (HEADPHONES) has been shipped by the seller.",
    "Aug 3, 2026",
  ],
];

const stats = [
  ["♧", "3", "Total Sellers", "mint"],
  ["◷", "0", "Pending Applications", "amber"],
  ["⊙", "3", "Approved Sellers", "mint"],
  ["⊗", "0", "Rejected Sellers", "red"],
  ["▤", "7", "Total Orders", "blue"],
  ["↗", "$340.10", "Total Revenue", "indigo"],
  ["$", "$0.00", "Total Commission", "violet"],
  ["▣", "$0.00", "Wallet Balance", "pink"],
];

export default function AgentPortal({ onLogout }) {
  const [active, setActive] = useState("Dashboard");
  const [copied, setCopied] = useState("");
  const inviteCode = "P516326U";
  const inviteLink = `${window.location.origin}/seller/register?code=${inviteCode}`;

  const copy = async (text, label) => {
    await navigator.clipboard?.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  };

  return (
    <main className="agent-portal">
      <aside className="agent-sidebar">
        <header>
          <h1>Agent Portal</h1>
        </header>
        <div className="agent-id-card">
          <span>
            AGENT ID <b>AGT000004</b>
          </span>
          <span>INVITATION CODE</span>
          <strong>{inviteCode}</strong>
          <button
            type="button"
            aria-label="Copy invitation code"
            onClick={() => copy(inviteCode, "sidebar")}
          >
            ▢
          </button>
          {copied === "sidebar" && <small>Copied</small>}
        </div>
        <nav>
          {groups.map((group, groupIndex) => (
            <section key={`${group.label}-${groupIndex}`}>
              {group.label && <h2>{group.label}</h2>}
              {group.items.map(([label, icon]) => (
                <button
                  key={label}
                  type="button"
                  className={active === label ? "active" : ""}
                  onClick={() => setActive(label)}
                >
                  <i>{icon}</i>
                  <span>{label}</span>
                </button>
              ))}
            </section>
          ))}
        </nav>
        <button className="agent-signout" type="button" onClick={onLogout}>
          <i>↪</i> Sign Out
        </button>
      </aside>

      <section className="agent-workspace">
        <header className="agent-topbar">
          <span>Agent Control Panel</span>
          <div>
            <b>K</b>
            <span>khan</span>
          </div>
        </header>
        {active === "Dashboard" ? (
          <AgentDashboard
            inviteCode={inviteCode}
            inviteLink={inviteLink}
            copy={copy}
            copied={copied}
          />
        ) : active === "Agents" ? (
          <AgentTeam />
        ) : active === "Unregistered" ? (
          <AgentUnregistered />
        ) : active === "Applications" ? (
          <AgentApplications />
        ) : active === "Merchant List" ? (
          <AgentMerchantList />
        ) : active === "Showcases" ? (
          <AgentShowcase />
        ) : active === "Bound Addresses" ? (
          <AgentBoundAddresses />
        ) : active === "Credit Logs" ? (
          <AgentCreditLogs />
        ) : active === "Balance Locks" ? (
          <AgentBalanceLocks />
        ) : active === "Order Management" ? (
          <AgentOrderManagement />
        ) : active === "Order List" ? (
          <AgentOrderList />
        ) : active === "Batch Ship" ? (
          <AgentBatchShip />
        ) : active === "Batch Receive" ? (
          <AgentBatchReceive />
        ) : active === "Auto Order" ? (
          <AgentAutoOrder />
        ) : active === "Order Records" ? (
          <AgentOrderRecords />
        ) : active === "General Config" ? (
          <AgentGeneralConfig />
        ) : active === "Messages" ? (
          <AgentMessages />
        ) : active === "Announcements" ? (
          <AgentAnnouncements />
        ) : active === "Recharge Orders" ? (
          <AgentRechargeOrders />
        ) : active === "Withdraw Orders" ? (
          <AgentWithdrawOrders />
        ) : active === "Chat" ? (
          <AgentSellerChat />
        ) : active === "Virtual Buyer – Shop" ? (
          <AgentVirtualBuyers />
        ) : active === "Buyer Messages" ? (
          <AgentBuyerMessages />
        ) : active === "Shop – System" ? (
          <AgentShopSystem />
        ) : active === "Earnings" ? (
          <AgentEarnings />
        ) : active === "Feedbacks" ? (
          <AgentFeedbacks />
        ) : active === "Audit Logs" ? (
          <AgentAuditLogs />
        ) : active === "My Account" ? (
          <AgentMyAccount />
        ) : (
          <section className="agent-coming-soon">
            <div>◇</div>
            <h2>{active}</h2>
            <p>
              This section is ready for the design and features you send next.
            </p>
            <button type="button" onClick={() => setActive("Dashboard")}>
              Back to Dashboard
            </button>
          </section>
        )}
      </section>
    </main>
  );
}

const demoOrderRecords = [
  ["Aug 23, 2026 02:05 AM", "Auto orders generated", "1 demo order"],
  ["Aug 10, 2026 02:01 AM", "Batch shipped", "Order DEMO-SHIP-01"],
  ["Aug 8, 2026 01:16 AM", "Batch received", "Order DEMO-RECV-01"],
  ["Aug 8, 2026 01:13 AM", "Order created", "#DEMO-1001 · Pink Kids Backpack"],
  ["Aug 4, 2026 12:36 AM", "Batch received", "Order DEMO-RECV-02"],
  ["Aug 3, 2026 07:44 PM", "Order created", "#DEMO-1004 · Headphones"],
  ["Aug 2, 2026 11:03 AM", "Batch shipped", "Order DEMO-SHIP-02"],
  ["Jul 31, 2026 12:57 AM", "Order created", "#DEMO-1005 · Data Cable"],
  ["Jul 29, 2026 01:30 AM", "Order created", "#DEMO-1002 · Demo Phone"],
  ["Jul 28, 2026 10:17 PM", "Order created", "#DEMO-1006 · Headphones"],
];

const defaultAgentConfig = {
  displayName: "Demo Agent",
  company: "Demo Company",
  phone: "+1 ••• ••• 0100",
  emailNotifications: true,
  newOrderAlerts: true,
  timezone: "UTC",
  currency: "USD",
};

function AgentMessages() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agent_admin_messages") || "[]");
    } catch {
      return [];
    }
  });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const fileInput = React.useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: auth } = await agentSupabase.auth.getUser();
      if (!auth?.user) return;
      const { data } = await agentSupabase
        .from("messages")
        .select("*")
        .eq("channel", "agent")
        .order("created_at");
      const { data: admins } = await agentSupabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");
      const adminIds = new Set((admins || []).map((item) => item.id));
      const adminMessages = (data || []).filter(
        (item) =>
          adminIds.has(item.sender_id) || adminIds.has(item.recipient_id),
      );
      if (mounted && adminMessages.length)
        setMessages(
          adminMessages.map((item) => ({
            id: item.id,
            mine: item.sender_id === auth.user.id,
            text: item.body,
            image: item.image_url,
            date: new Date(item.created_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
          })),
        );
    };
    load();
    const channel = agentSupabase
      .channel("agent-admin-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        load,
      )
      .subscribe();
    return () => {
      mounted = false;
      agentSupabase.removeChannel(channel);
    };
  }, []);

  const persist = (next) => {
    setMessages(next);
    localStorage.setItem("agent_admin_messages", JSON.stringify(next));
  };
  const send = async (event) => {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const text = message.trim();
    const fallback = {
      id: Date.now(),
      mine: true,
      text,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    const { data: auth } = await agentSupabase.auth.getUser();
    const { data: admins } = await agentSupabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1);
    let saved;
    if (auth?.user && admins?.[0]) {
      const response = await agentSupabase
        .from("messages")
        .insert({
          sender_id: auth.user.id,
          recipient_id: admins[0].id,
          channel: "agent",
          body: text,
        })
        .select()
        .single();
      saved = response.data;
    }
    persist([...messages, saved ? { ...fallback, id: saved.id } : fallback]);
    setMessage("");
    setSending(false);
  };
  const attach = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      persist([
        ...messages,
        {
          id: Date.now(),
          mine: true,
          text: file.name,
          image: reader.result,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  return (
    <div className="agent-messages-page">
      <header>
        <h2>Messages</h2>
        <p>Private conversation with the Super Admin.</p>
      </header>
      <section className="agent-messages-panel">
        <div className="agent-message-stream">
          {messages.map((item) => (
            <article key={item.id} className={item.mine ? "mine" : "admin"}>
              <strong>{item.mine ? "Demo Agent" : "Super Admin"}</strong>
              {item.image ? (
                <img src={item.image} alt={item.text} />
              ) : (
                <p>{item.text}</p>
              )}
              <time>{item.date}</time>
            </article>
          ))}
          {!messages.length && (
            <div className="agent-messages-empty">
              No messages yet. Send a message to start the conversation.
            </div>
          )}
        </div>
        <form onSubmit={send}>
          <button
            type="button"
            aria-label="Attach file"
            onClick={() => fileInput.current?.click()}
          >
            ⌕
          </button>
          <input
            ref={fileInput}
            hidden
            type="file"
            accept="image/*"
            onChange={attach}
          />
          <input
            aria-label="Message"
            placeholder="Type a message..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </section>
    </div>
  );
}

function AgentAnnouncements() {
  const fallback = [
    {
      id: "demo-announcement",
      title: "Welcome to the agent portal",
      message: "Admin announcements will appear here automatically.",
      created_at: "2026-08-23T12:00:00Z",
    },
  ];
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const { data, error } = await agentSupabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setAnnouncements(data || []);
    else setAnnouncements(fallback);
    setLoading(false);
  };
  useEffect(() => {
    refresh();
    const channel = agentSupabase
      .channel("agent-announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        refresh,
      )
      .subscribe();
    return () => agentSupabase.removeChannel(channel);
  }, []);
  return (
    <div className="agent-announcements-page">
      <header>
        <div>
          <h2>Announcements</h2>
          <p>Notices and messages from the Super Admin.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh announcements"
        >
          {loading ? "…" : "↻"}
        </button>
      </header>
      <section>
        {announcements.map((item) => (
          <article key={item.id}>
            <span>⚑</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <time>
                From Admin ·{" "}
                {new Date(item.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </div>
          </article>
        ))}
        {!loading && !announcements.length && (
          <div className="agent-announcements-empty">No announcements yet.</div>
        )}
      </section>
    </div>
  );
}

function AgentRechargeOrders() {
  const [tab, setTab] = useState("requests");
  const [orders, setOrders] = useState([]);
  const [methods, setMethods] = useState([]);
  const [search, setSearch] = useState("");
  const [merchantFilter, setMerchantFilter] = useState("All merchants");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showRecharge, setShowRecharge] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const [recharge, setRecharge] = useState({
    merchant: "Demo Merchant 1",
    amount: "",
    method: "manual",
    note: "",
  });
  const [method, setMethod] = useState({
    name: "",
    type: "Bank Transfer",
    bank: "",
    accountName: "",
    accountNumber: "",
    routing: "",
    order: 0,
  });
  useEffect(() => {
    try {
      setOrders(
        JSON.parse(localStorage.getItem("agent_demo_recharges") || "[]"),
      );
      setMethods(
        JSON.parse(localStorage.getItem("agent_demo_payment_methods") || "[]"),
      );
    } catch {
      /* use empty demo data */
    }
  }, []);
  const saveOrders = (next) => {
    setOrders(next);
    localStorage.setItem("agent_demo_recharges", JSON.stringify(next));
  };
  const saveMethods = (next) => {
    setMethods(next);
    localStorage.setItem("agent_demo_payment_methods", JSON.stringify(next));
  };
  const createRecharge = (event) => {
    event.preventDefault();
    const next = [
      {
        id: `DEMO-RC-${Date.now().toString().slice(-6)}`,
        ...recharge,
        amount: Number(recharge.amount),
        status: "Completed",
        date: new Date().toLocaleString(),
      },
      ...orders,
    ];
    saveOrders(next);
    setShowRecharge(false);
    setRecharge({
      merchant: "Demo Merchant 1",
      amount: "",
      method: "manual",
      note: "",
    });
  };
  const createMethod = (event) => {
    event.preventDefault();
    saveMethods([...methods, { id: Date.now(), ...method }]);
    setShowMethod(false);
    setMethod({
      name: "",
      type: "Bank Transfer",
      bank: "",
      accountName: "",
      accountNumber: "",
      routing: "",
      order: 0,
    });
  };
  const visible = orders.filter(
    (item) =>
      (merchantFilter === "All merchants" ||
        item.merchant === merchantFilter) &&
      (statusFilter === "All statuses" || item.status === statusFilter) &&
      [item.id, item.merchant, item.note].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
  );
  return (
    <div className="agent-recharge-page">
      <header>
        <h2>Recharge Orders</h2>
        <p>Manage merchant recharge requests and payment channels.</p>
      </header>
      <nav className="agent-recharge-tabs">
        <button
          type="button"
          className={tab === "requests" ? "active" : ""}
          onClick={() => setTab("requests")}
        >
          Recharge Requests
        </button>
        <button
          type="button"
          className={tab === "methods" ? "active" : ""}
          onClick={() => setTab("methods")}
        >
          ⚙ Payment Methods
        </button>
      </nav>
      {tab === "requests" ? (
        <>
          <div className="agent-recharge-tools">
            <label>
              <span>⌕</span>
              <input
                placeholder="Search no / merchant / note"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              value={merchantFilter}
              onChange={(event) => setMerchantFilter(event.target.value)}
            >
              <option>All merchants</option>
              <option>Demo Merchant 1</option>
              <option>Demo Merchant 2</option>
              <option>Demo Merchant 3</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
            <button type="button" disabled>
              ⇩ Export
            </button>
            <button
              type="button"
              className="new"
              onClick={() => setShowRecharge(true)}
            >
              ＋ New Recharge
            </button>
          </div>
          <section className="agent-recharge-list">
            {visible.map((item) => (
              <article key={item.id}>
                <code>{item.id}</code>
                <strong>{item.merchant}</strong>
                <span>${item.amount.toFixed(2)}</span>
                <span>{item.method}</span>
                <em>{item.status}</em>
                <time>{item.date}</time>
              </article>
            ))}
            {!visible.length && <p>No recharge orders yet.</p>}
          </section>
        </>
      ) : (
        <section className="agent-payment-methods">
          <header>
            <div>
              <h3>Configured Payment Channels</h3>
              <p>
                Sellers will see these methods and their demo account details
                when requesting a recharge.
              </p>
            </div>
            <button type="button" onClick={() => setShowMethod(true)}>
              ＋ Add Method
            </button>
          </header>
          {methods.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.type}</span>
              </div>
              <p>
                {item.bank || "Demo payment channel"} · Account details hidden
              </p>
              <button
                type="button"
                onClick={() =>
                  saveMethods(methods.filter((entry) => entry.id !== item.id))
                }
              >
                Remove
              </button>
            </article>
          ))}
          {!methods.length && (
            <div className="agent-method-empty">
              No payment methods configured yet.
              <small>
                Add at least one demo method to preview the seller experience.
              </small>
            </div>
          )}
        </section>
      )}
      {showRecharge && (
        <div
          className="agent-recharge-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setShowRecharge(false)
          }
        >
          <form className="agent-recharge-modal" onSubmit={createRecharge}>
            <h3>Direct Recharge (Agent)</h3>
            <label>
              Merchant
              <select
                value={recharge.merchant}
                onChange={(event) =>
                  setRecharge({ ...recharge, merchant: event.target.value })
                }
              >
                <option>Demo Merchant 1</option>
                <option>Demo Merchant 2</option>
                <option>Demo Merchant 3</option>
              </select>
            </label>
            <label>
              Amount (USD)
              <input
                required
                min="1"
                step="0.01"
                type="number"
                placeholder="100.00"
                value={recharge.amount}
                onChange={(event) =>
                  setRecharge({ ...recharge, amount: event.target.value })
                }
              />
            </label>
            <label>
              Method
              <select
                value={recharge.method}
                onChange={(event) =>
                  setRecharge({ ...recharge, method: event.target.value })
                }
              >
                <option>manual</option>
                <option>bank transfer</option>
                <option>crypto</option>
                <option>other</option>
              </select>
            </label>
            <label>
              Note
              <textarea
                value={recharge.note}
                onChange={(event) =>
                  setRecharge({ ...recharge, note: event.target.value })
                }
              />
            </label>
            <footer>
              <button type="button" onClick={() => setShowRecharge(false)}>
                Cancel
              </button>
              <button type="submit">Recharge Now</button>
            </footer>
          </form>
        </div>
      )}
      {showMethod && (
        <div
          className="agent-recharge-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setShowMethod(false)
          }
        >
          <form className="agent-method-modal" onSubmit={createMethod}>
            <h3>New Payment Method</h3>
            <div className="agent-method-fields">
              <label>
                Method Name *
                <input
                  required
                  placeholder="e.g. Bank Transfer — Demo"
                  value={method.name}
                  onChange={(event) =>
                    setMethod({ ...method, name: event.target.value })
                  }
                />
              </label>
              <label>
                Type
                <select
                  value={method.type}
                  onChange={(event) =>
                    setMethod({ ...method, type: event.target.value })
                  }
                >
                  <option>Bank Transfer</option>
                  <option>Crypto</option>
                  <option>Other</option>
                </select>
              </label>
              <h4>Account Details</h4>
              <label className="wide">
                Bank Name
                <input
                  placeholder="e.g. Demo Bank"
                  value={method.bank}
                  onChange={(event) =>
                    setMethod({ ...method, bank: event.target.value })
                  }
                />
              </label>
              <label className="wide">
                Account Name
                <input
                  placeholder="e.g. Demo Account"
                  value={method.accountName}
                  onChange={(event) =>
                    setMethod({ ...method, accountName: event.target.value })
                  }
                />
              </label>
              <label className="wide">
                Account Number
                <input
                  placeholder="Hidden in this public demo"
                  value={method.accountNumber}
                  onChange={(event) =>
                    setMethod({ ...method, accountNumber: event.target.value })
                  }
                />
              </label>
              <label className="wide">
                Routing / SWIFT
                <input
                  placeholder="Demo routing code"
                  value={method.routing}
                  onChange={(event) =>
                    setMethod({ ...method, routing: event.target.value })
                  }
                />
              </label>
              <label>
                Display Order
                <input
                  type="number"
                  min="0"
                  value={method.order}
                  onChange={(event) =>
                    setMethod({ ...method, order: event.target.value })
                  }
                />
                <small>Lower = shown first to sellers</small>
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setShowMethod(false)}>
                Cancel
              </button>
              <button type="submit">Save Method</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

const demoAgentWithdrawals = [
  {
    id: 1,
    seller: "Demo Merchant",
    amount: 155,
    method: "Bank Card",
    account: "•••• 8383",
    status: "Approved",
    note: "—",
    requested: "Aug 4, 2026 12:39 AM",
  },
  {
    id: 2,
    seller: "Demo Merchant",
    amount: 500,
    method: "Bank Card",
    account: "Demo account",
    status: "Rejected",
    note: "Payment details could not be verified.",
    requested: "Aug 3, 2026 12:49 AM",
  },
  {
    id: 3,
    seller: "Demo Merchant",
    amount: 100,
    method: "Bank Card",
    account: "•••• 2041",
    status: "Approved",
    note: "—",
    requested: "Jul 29, 2026 01:26 AM",
  },
  {
    id: 4,
    seller: "Demo Merchant",
    amount: 166,
    method: "Bank Card",
    account: "•••• 9292",
    status: "Approved",
    note: "—",
    requested: "Jul 28, 2026 12:35 AM",
  },
];

function AgentWithdrawOrders() {
  const [filter, setFilter] = useState("All");
  const [withdrawals, setWithdrawals] = useState(demoAgentWithdrawals);
  useEffect(() => {
    const load = async () => {
      const { data, error } = await agentSupabase
        .from("withdrawals")
        .select(
          "*,seller:profiles!withdrawals_seller_id_fkey(display_name,email)",
        )
        .order("created_at", { ascending: false });
      if (!error && data)
        setWithdrawals(
          data.map((row) => ({
            id: row.id,
            seller: row.seller?.display_name || row.seller?.email || "Seller",
            amount: Number(row.amount),
            method: row.method,
            account: row.account_details,
            status: row.status,
            note: row.rejection_reason || "—",
            requested: new Date(row.created_at).toLocaleString(),
          })),
        );
    };
    load();
    const channel = agentSupabase
      .channel("agent-live-withdrawals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "withdrawals" },
        load,
      )
      .subscribe();
    return () => agentSupabase.removeChannel(channel);
  }, []);
  const visible =
    filter === "All"
      ? withdrawals
      : withdrawals.filter((item) => item.status === filter);
  const pendingTotal = withdrawals
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="agent-withdraw-orders-page">
      <header>
        <h2>Finance — Withdrawals</h2>
        <p>
          Withdrawal requests from your sellers. Pending total: $
          {pendingTotal.toFixed(2)}
        </p>
      </header>
      <nav>
        {["All", "Pending", "Approved", "Rejected"].map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="agent-withdraw-table">
        <div className="agent-withdraw-head">
          <span>SELLER</span>
          <span>AMOUNT</span>
          <span>METHOD</span>
          <span>ACCOUNT</span>
          <span>STATUS</span>
          <span>NOTE</span>
          <span>REQUESTED</span>
          <span>ACTIONS</span>
        </div>
        {visible.map((item) => (
          <article key={item.id}>
            <span className="agent-withdraw-seller">
              <b>{item.seller[0]}</b>
              <strong>{item.seller}</strong>
            </span>
            <strong>${item.amount.toFixed(2)}</strong>
            <span>{item.method}</span>
            <code>{item.account}</code>
            <span>
              <em className={item.status.toLowerCase()}>{item.status}</em>
            </span>
            <span title={item.note}>{item.note}</span>
            <time>{item.requested}</time>
            <small>{item.status}</small>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-withdraw-empty">
            No {filter.toLowerCase()} withdrawal requests.
          </div>
        )}
      </section>
    </div>
  );
}

function AgentSellerChat() {
  const fallbackSellers = [
    { id: "demo-1", name: "Demo Merchant 1" },
    { id: "demo-2", name: "Demo Merchant 2" },
    { id: "demo-3", name: "Demo Merchant 3" },
  ];
  const [sellers, setSellers] = useState(fallbackSellers);
  const [sellerId, setSellerId] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agent_seller_chat") || "[]");
    } catch {
      return [];
    }
  });
  const [thread, setThread] = useState(null);
  const load = async () => {
    const { data: profiles } = await agentSupabase
      .from("profiles")
      .select("id,display_name,email")
      .eq("role", "seller")
      .order("display_name");
    if (profiles?.length)
      setSellers(
        profiles.map((item) => ({
          id: item.id,
          name: item.display_name || item.email.split("@")[0],
        })),
      );
    const { data: auth } = await agentSupabase.auth.getUser();
    if (!auth?.user) return;
    const { data } = await agentSupabase
      .from("messages")
      .select("*")
      .eq("channel", "agent")
      .order("created_at", { ascending: false });
    if (data?.length)
      setHistory(
        data.map((item) => ({
          id: item.id,
          sellerId:
            item.sender_id === auth.user.id
              ? item.recipient_id
              : item.sender_id,
          mine: item.sender_id === auth.user.id,
          text: item.body,
          read: Boolean(item.read_at),
          date: new Date(item.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        })),
      );
  };
  useEffect(() => {
    load();
    const channel = agentSupabase
      .channel("agent-seller-chat")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        load,
      )
      .subscribe();
    return () => agentSupabase.removeChannel(channel);
  }, []);
  const sellerName = (id) =>
    sellers.find((item) => item.id === id)?.name || "Demo Merchant";
  const send = async (event) => {
    event.preventDefault();
    if (!sellerId || !message.trim()) return;
    const next = {
      id: Date.now(),
      sellerId,
      mine: true,
      text: message.trim(),
      read: false,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    const { data: auth } = await agentSupabase.auth.getUser();
    if (auth?.user && !sellerId.startsWith("demo-")) {
      const { data } = await agentSupabase
        .from("messages")
        .insert({
          sender_id: auth.user.id,
          recipient_id: sellerId,
          channel: "agent",
          body: message.trim(),
        })
        .select()
        .single();
      if (data) next.id = data.id;
    }
    const updated = [next, ...history];
    setHistory(updated);
    localStorage.setItem("agent_seller_chat", JSON.stringify(updated));
    setMessage("");
  };
  return (
    <div className="agent-seller-chat-page">
      <header>
        <h2>Chat</h2>
        <p>Send messages to your sellers and reply to conversations.</p>
      </header>
      <form className="agent-chat-new" onSubmit={send}>
        <small>NEW MESSAGE</small>
        <select
          required
          value={sellerId}
          onChange={(event) => setSellerId(event.target.value)}
        >
          <option value="">Select seller...</option>
          {sellers.map((seller) => (
            <option value={seller.id} key={seller.id}>
              {seller.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Write your message..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" disabled={!sellerId || !message.trim()}>
          ➤ Send
        </button>
      </form>
      <div className="agent-chat-history-title">
        <span>Message History</span>
        <button type="button" onClick={load}>
          ↻
        </button>
      </div>
      <section className="agent-chat-history">
        {history.map((item) => (
          <article key={item.id}>
            <div>
              <strong>
                {item.mine
                  ? `To: ${sellerName(item.sellerId)}`
                  : `From: ${sellerName(item.sellerId)}`}
              </strong>
              <small>{item.mine ? "from Demo Agent" : "seller message"}</small>
              <p>{item.text}</p>
            </div>
            <aside>
              <span className={item.read ? "read" : "unread"}>
                {item.read ? "Read" : "Unread"}
              </span>
              <time>{item.date}</time>
              <button type="button" onClick={() => setThread(item.sellerId)}>
                ▢ View Thread
              </button>
            </aside>
          </article>
        ))}
        {!history.length && (
          <div className="agent-chat-empty">No message history yet.</div>
        )}
      </section>
      {thread && (
        <div
          className="agent-chat-thread-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setThread(null)
          }
        >
          <section>
            <header>
              <div>
                <h3>{sellerName(thread)}</h3>
                <p>Conversation thread</p>
              </div>
              <button type="button" onClick={() => setThread(null)}>
                ×
              </button>
            </header>
            <div>
              {history
                .filter((item) => item.sellerId === thread)
                .slice()
                .reverse()
                .map((item) => (
                  <article
                    key={item.id}
                    className={item.mine ? "mine" : "seller"}
                  >
                    <p>{item.text}</p>
                    <time>{item.date}</time>
                  </article>
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const emptyBuyer = {
  name: "",
  phone: "",
  email: "",
  country: "",
  state: "",
  city: "",
  postal: "",
  address: "",
  notes: "",
};
const safeDemoBuyers = [
  {
    id: 1,
    name: "Demo Buyer One",
    phone: "+1 ••• ••• 0101",
    email: "bu•••@example.com",
    country: "United States",
    state: "California",
    city: "Demo City",
    postal: "•••••",
    address: "Demo shipping address",
    notes: "Sample profile",
    added: "Aug 8, 2026",
  },
  {
    id: 2,
    name: "Demo Buyer Two",
    phone: "+44 •••• ••• 202",
    email: "bu•••@example.com",
    country: "United Kingdom",
    state: "Greater London",
    city: "London",
    postal: "••••••",
    address: "Demo shipping address",
    notes: "Sample profile",
    added: "Jul 28, 2026",
  },
  {
    id: 3,
    name: "Demo Buyer Three",
    phone: "+65 •••• 0303",
    email: "bu•••@example.com",
    country: "Singapore",
    state: "Central",
    city: "Singapore",
    postal: "••••••",
    address: "Demo shipping address",
    notes: "Sample profile",
    added: "Jul 26, 2026",
  },
];

function AgentVirtualBuyers() {
  const [buyers, setBuyers] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("agent_virtual_buyers") || "null") ||
        safeDemoBuyers
      );
    } catch {
      return safeDemoBuyers;
    }
  });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBuyer);
  const visible = buyers.filter((item) =>
    [item.name, item.email, item.phone].some((value) =>
      value.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const persist = (next) => {
    setBuyers(next);
    localStorage.setItem("agent_virtual_buyers", JSON.stringify(next));
  };
  const openAdd = () => {
    setForm(emptyBuyer);
    setEditing("new");
  };
  const openEdit = (item) => {
    setForm(item);
    setEditing(item.id);
  };
  const save = (event) => {
    event.preventDefault();
    const next =
      editing === "new"
        ? [
            {
              ...form,
              id: Date.now(),
              added: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            },
            ...buyers,
          ]
        : buyers.map((item) =>
            item.id === editing ? { ...item, ...form } : item,
          );
    persist(next);
    setEditing(null);
  };
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  return (
    <div className="agent-buyers-page">
      <header>
        <div>
          <h2>Virtual Buyers</h2>
          <p>
            Demo buyer profiles used to preview order creation for your sellers.
          </p>
        </div>
        <button type="button" onClick={openAdd}>
          ＋ Add Buyer
        </button>
      </header>
      <label className="agent-buyers-search">
        <span>⌕</span>
        <input
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <section className="agent-buyers-grid">
        {visible.map((item) => (
          <article key={item.id}>
            <div className="agent-buyer-info">
              <b>♙</b>
              <div>
                <h3>{item.name}</h3>
                <p>⌕ &nbsp;{item.phone || "No phone"}</p>
                <p>✉ &nbsp;{item.email || "No email"}</p>
                <p>
                  ⌖ &nbsp;
                  {[item.city, item.state, item.country]
                    .filter(Boolean)
                    .join(", ") || "No location"}
                </p>
                <p>
                  {item.address || "No shipping address"} {item.postal}
                </p>
                <p>▤ &nbsp;{item.notes || "No notes"}</p>
                <small>Added {item.added}</small>
              </div>
            </div>
            <footer>
              <button type="button" onClick={() => openEdit(item)}>
                ✎ Edit
              </button>
              <button
                type="button"
                onClick={() =>
                  persist(buyers.filter((buyer) => buyer.id !== item.id))
                }
              >
                ♲ Delete
              </button>
            </footer>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-buyers-empty">No virtual buyers found.</div>
        )}
      </section>
      {editing && (
        <div
          className="agent-buyers-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setEditing(null)
          }
        >
          <form onSubmit={save}>
            <header>
              <h3>{editing === "new" ? "Add Virtual Buyer" : "Edit Buyer"}</h3>
              <button type="button" onClick={() => setEditing(null)}>
                ×
              </button>
            </header>
            <div className="agent-buyer-fields">
              <label className="wide">
                Buyer Name *
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </label>
              <label>
                Phone
                <input
                  placeholder="+1 555 000 0000"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  placeholder="buyer@example.com"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
              <label>
                Country
                <input
                  placeholder="e.g. United States"
                  value={form.country}
                  onChange={(event) => update("country", event.target.value)}
                />
              </label>
              <label>
                Province / State
                <input
                  placeholder="e.g. California"
                  value={form.state}
                  onChange={(event) => update("state", event.target.value)}
                />
              </label>
              <label>
                City
                <input
                  placeholder="e.g. Los Angeles"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                />
              </label>
              <label>
                Postal Code
                <input
                  placeholder="e.g. 90001"
                  value={form.postal}
                  onChange={(event) => update("postal", event.target.value)}
                />
              </label>
              <label className="wide">
                Shipping Address
                <textarea
                  placeholder="Street address, apartment, suite..."
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                />
              </label>
              <label className="wide">
                Notes
                <textarea
                  placeholder="Optional notes about this buyer..."
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit">
                ✓ {editing === "new" ? "Add Buyer" : "Save Changes"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

const demoBuyerThreads = [
  {
    id: 1,
    buyer: "Demo Buyer One",
    phone: "+1 ••• ••• 0101",
    seller: "Demo Merchant 1",
    message: "Is this product available?",
    product: "Classic Laptop Bag",
    sku: "DEMO-SKU-149127",
    price: 172.79,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=160&q=80",
    date: "Aug 8, 2026 01:17 AM",
    unread: false,
    replies: [],
  },
  {
    id: 2,
    buyer: "Demo Buyer Two",
    phone: "+44 •••• ••• 202",
    seller: "Demo Merchant 1",
    message: "Can you tell me more about this item?",
    product: "Minimal Desk Accessory",
    sku: "DEMO-SKU-058814",
    price: 8,
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=160&q=80",
    date: "Aug 4, 2026 12:37 AM",
    unread: true,
    replies: [
      {
        author: "Demo Merchant 1",
        text: "Hello! Yes, it is ready to order.",
        date: "Aug 8, 2026 01:06 AM",
      },
    ],
  },
  {
    id: 3,
    buyer: "Demo Buyer Three",
    phone: "+65 •••• 0303",
    seller: "Demo Merchant 2",
    message: "Is this available in another color?",
    product: "Wireless Headphones",
    sku: "DEMO-SKU-552893",
    price: 20,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=160&q=80",
    date: "Aug 3, 2026 10:22 AM",
    unread: true,
    replies: [],
  },
];

function AgentBuyerMessages() {
  const [threads, setThreads] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("agent_buyer_messages") || "null") ||
        demoBuyerThreads
      );
    } catch {
      return demoBuyerThreads;
    }
  });
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [openThread, setOpenThread] = useState(null);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ buyer: "", seller: "", message: "" });
  const buyers = safeDemoBuyers.map((buyer) => ({
    name: buyer.name,
    phone: buyer.phone,
  }));
  const sellers = ["Demo Merchant 1", "Demo Merchant 2", "Demo Merchant 3"];
  const persist = (next) => {
    setThreads(next);
    localStorage.setItem("agent_buyer_messages", JSON.stringify(next));
  };
  const visible = threads.filter((item) =>
    [item.buyer, item.seller, item.message, item.product].some((value) =>
      value.toLowerCase().includes(search.toLowerCase()),
    ),
  );
  const unread = threads.filter((item) => item.unread).length;
  const markAllRead = () =>
    persist(threads.map((item) => ({ ...item, unread: false })));
  const viewThread = (id) => {
    const next = threads.map((item) =>
      item.id === id ? { ...item, unread: false } : item,
    );
    persist(next);
    setOpenThread(id);
  };
  const create = (event) => {
    event.preventDefault();
    const buyer = buyers.find((item) => item.name === form.buyer);
    persist([
      {
        id: Date.now(),
        buyer: form.buyer,
        phone: buyer?.phone || "•••",
        seller: form.seller,
        message: form.message.trim(),
        product: "Demo Catalog Product",
        sku: "DEMO-SKU-NEW",
        price: 29.99,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=160&q=80",
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        unread: true,
        replies: [],
      },
      ...threads,
    ]);
    setForm({ buyer: "", seller: "", message: "" });
    setCreating(false);
  };
  const sendReply = (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    persist(
      threads.map((item) =>
        item.id === openThread
          ? {
              ...item,
              replies: [
                ...item.replies,
                {
                  author: "Demo Agent",
                  text: reply.trim(),
                  date: new Date().toLocaleString(),
                },
              ],
            }
          : item,
      ),
    );
    setReply("");
  };
  const activeThread = threads.find((item) => item.id === openThread);
  return (
    <div className="agent-buyer-messages-page">
      <header>
        <div>
          <h2>Buyer Messages</h2>
          <p>
            Messages from virtual buyers about products in your sellers’ stores.
          </p>
        </div>
        <button type="button" onClick={() => setCreating(true)}>
          ＋ New Message
        </button>
      </header>
      <div className="agent-buyer-message-tools">
        <label>
          <span>⌕</span>
          <input
            placeholder="Search messages..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button type="button" onClick={markAllRead} disabled={!unread}>
          ✓ Mark all read ({unread})
        </button>
      </div>
      <section className="agent-buyer-thread-list">
        {visible.map((item) => (
          <article key={item.id} className={item.unread ? "unread" : ""}>
            <div className="agent-buyer-thread-title">
              <b>{item.buyer[5] || "B"}</b>
              <div>
                <strong>{item.buyer}</strong>
                <small>{item.phone}</small>
                <span>Store: {item.seller}</span>
                <p>{item.message}</p>
              </div>
              {item.unread && <i aria-label="Unread" />}
            </div>
            <div className="agent-buyer-product">
              <img src={item.image} alt="" />
              <div>
                <strong>{item.product}</strong>
                <span>SKU: {item.sku}</span>
                <b>${item.price.toFixed(2)}</b>
              </div>
            </div>
            {item.replies.at(-1) && (
              <div className="agent-buyer-last-reply">
                <strong>{item.replies.at(-1).author}</strong>
                <span>{item.replies.at(-1).text}</span>
                <time>{item.replies.at(-1).date}</time>
              </div>
            )}
            <footer>
              <time>{item.date}</time>
              <button type="button" onClick={() => viewThread(item.id)}>
                ▢ {item.replies.length ? "View Thread" : "Open Chat"}
              </button>
            </footer>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-buyer-message-empty">
            No buyer messages found.
          </div>
        )}
      </section>
      {creating && (
        <div
          className="agent-buyer-message-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setCreating(false)
          }
        >
          <form className="agent-buyer-message-modal" onSubmit={create}>
            <header>
              <h3>▢ &nbsp; New Buyer Message</h3>
              <button type="button" onClick={() => setCreating(false)}>
                ×
              </button>
            </header>
            <label>
              Buyer *
              <select
                required
                value={form.buyer}
                onChange={(event) =>
                  setForm({ ...form, buyer: event.target.value })
                }
              >
                <option value="">— Select buyer —</option>
                {buyers.map((buyer) => (
                  <option key={buyer.name} value={buyer.name}>
                    {buyer.name} · {buyer.phone}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Seller store *
              <select
                required
                value={form.seller}
                onChange={(event) =>
                  setForm({ ...form, seller: event.target.value })
                }
              >
                <option value="">— Select seller —</option>
                {sellers.map((seller) => (
                  <option key={seller}>{seller}</option>
                ))}
              </select>
            </label>
            <label>
              Message *
              <textarea
                required
                placeholder="Write the buyer's message..."
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
              />
            </label>
            <footer>
              <button type="button" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.buyer || !form.seller || !form.message.trim()}
              >
                Send Message
              </button>
            </footer>
          </form>
        </div>
      )}
      {activeThread && (
        <div
          className="agent-buyer-message-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setOpenThread(null)
          }
        >
          <section className="agent-buyer-chat-modal">
            <header>
              <div>
                <h3>{activeThread.buyer}</h3>
                <p>
                  {activeThread.seller} · {activeThread.product}
                </p>
              </div>
              <button type="button" onClick={() => setOpenThread(null)}>
                ×
              </button>
            </header>
            <div className="agent-buyer-chat-stream">
              <article className="buyer">
                <p>{activeThread.message}</p>
                <time>{activeThread.date}</time>
              </article>
              {activeThread.replies.map((item, index) => (
                <article className="reply" key={`${item.date}-${index}`}>
                  <strong>{item.author}</strong>
                  <p>{item.text}</p>
                  <time>{item.date}</time>
                </article>
              ))}
            </div>
            <form onSubmit={sendReply}>
              <input
                placeholder="Write a reply..."
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
              <button type="submit" disabled={!reply.trim()}>
                Send
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function AgentShopSystem() {
  const seed = [
    {
      id: 1,
      name: "Demo Merchant 1",
      visible: true,
      traffic: true,
      clicks: 10025,
      credit: 95,
    },
    {
      id: 2,
      name: "Demo Merchant 2",
      visible: true,
      traffic: false,
      clicks: 4111,
      credit: 100,
    },
    {
      id: 3,
      name: "Demo Merchant 3",
      visible: true,
      traffic: false,
      clicks: 0,
      credit: 100,
    },
  ];
  const [shops, setShops] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("agent_shop_system") || "null") || seed
      );
    } catch {
      return seed;
    }
  });
  const toggle = (id, field) => {
    const next = shops.map((shop) =>
      shop.id === id ? { ...shop, [field]: !shop[field] } : shop,
    );
    setShops(next);
    localStorage.setItem("agent_shop_system", JSON.stringify(next));
  };
  return (
    <div className="agent-final-page agent-shop-page">
      <header>
        <h2>Shop — System</h2>
        <p>
          System-level shop switches for each of your merchants. Locked shops
          can only be unlocked by the platform.
        </p>
      </header>
      <section className="agent-final-table">
        <div className="shop-head">
          <span>SHOP</span>
          <span>STATUS</span>
          <span>SHOWCASE VISIBLE</span>
          <span>TRAFFIC ENABLED</span>
          <span>CLICKS</span>
          <span>CREDIT</span>
        </div>
        {shops.map((shop) => (
          <article className="shop-row" key={shop.id}>
            <span className="final-merchant">
              <b>{shop.name.at(-1)}</b>
              <strong>{shop.name}</strong>
            </span>
            <span>
              <em className="normal">♙ Normal</em>
            </span>
            <button
              aria-label="Toggle showcase"
              type="button"
              className={`final-switch ${shop.visible ? "on" : ""}`}
              onClick={() => toggle(shop.id, "visible")}
            >
              <i />
            </button>
            <button
              aria-label="Toggle traffic"
              type="button"
              className={`final-switch ${shop.traffic ? "on" : ""}`}
              onClick={() => toggle(shop.id, "traffic")}
            >
              <i />
            </button>
            <span>{shop.clicks.toLocaleString()}</span>
            <span>{shop.credit}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

function AgentEarnings() {
  return (
    <div className="agent-final-page">
      <header>
        <h2>Earnings</h2>
        <p>Your commission history and wallet balance.</p>
      </header>
      <section className="earning-cards">
        <article>
          <b>▣</b>
          <strong>$0.00</strong>
          <span>Wallet Balance</span>
        </article>
        <article>
          <b>$</b>
          <strong>$0.00</strong>
          <span>Total Commission</span>
        </article>
        <article>
          <b>%</b>
          <strong>5.0%</strong>
          <span>Commission Rate</span>
        </article>
      </section>
      <section className="agent-final-table earning-history">
        <h3>Commission History</h3>
        <div className="earning-head">
          <span>DATE</span>
          <span>DESCRIPTION</span>
          <span>SELLER</span>
          <span>AMOUNT</span>
        </div>
        <p>No commission records yet.</p>
      </section>
    </div>
  );
}

const safeAuditRows = [
  [
    "Demo Merchant 2",
    "Automation",
    "stop_automation",
    "Agent",
    "Aug 23, 2026 02:05 AM",
  ],
  [
    "Demo Merchant 2",
    "Automation",
    "resume_automation",
    "Agent",
    "Aug 23, 2026 02:05 AM",
  ],
  [
    "Demo Merchant 1",
    "Automation",
    "stop_automation",
    "Agent",
    "Aug 23, 2026 02:05 AM",
  ],
  [
    "Demo Merchant 1",
    "Orders",
    "auto_order_run",
    "Agent",
    "Aug 23, 2026 02:05 AM",
  ],
  [
    "Demo Merchant 1",
    "Login",
    "login_success",
    "Seller",
    "Aug 20, 2026 08:09 PM",
  ],
  [
    "Demo Merchant 3",
    "Login",
    "login_success",
    "Seller",
    "Aug 16, 2026 10:02 PM",
  ],
  [
    "Demo Merchant 2",
    "Orders",
    "order_status_updated",
    "Agent",
    "Aug 10, 2026 01:58 AM",
  ],
  [
    "Demo Merchant 1",
    "Showcase",
    "showcase_enabled",
    "Agent",
    "Aug 8, 2026 04:05 PM",
  ],
];

function AgentAuditLogs() {
  const [search, setSearch] = useState("");
  const visible = safeAuditRows.filter((row) =>
    row.some((value) => value.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <div className="agent-final-page audit-page">
      <header>
        <h2>Audit Logs</h2>
        <p>Activity trail for your sellers’ accounts.</p>
      </header>
      <label className="audit-search">
        <span>⌕</span>
        <input
          placeholder="Search action, category, seller..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <section className="agent-final-table">
        <div className="audit-head">
          <span>SELLER</span>
          <span>CATEGORY</span>
          <span>ACTION</span>
          <span>ROLE</span>
          <span>IP</span>
          <span>TIME</span>
        </div>
        {visible.map((row, index) => (
          <article className="audit-row" key={`${row[2]}-${index}`}>
            <span className="final-merchant">
              <b>{row[0].at(-1)}</b>
              <strong>{row[0]}</strong>
            </span>
            <span>{row[1]}</span>
            <code>{row[2]}</code>
            <span>{row[3]}</span>
            <span>—</span>
            <time>{row[4]}</time>
          </article>
        ))}
        {!visible.length && <p>No matching audit records.</p>}
      </section>
    </div>
  );
}

function AgentFeedbacks() {
  const seed = [
    {
      id: 1,
      seller: "Demo Merchant 1",
      type: "Problem",
      title: "Demo support request",
      content: "This is a sample feedback ticket for the public demonstration.",
      status: "Open",
      submitted: "Aug 23, 2026 12:14 AM",
      reply: "",
    },
  ];
  const [tickets, setTickets] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("agent_feedback_tickets") || "null") ||
        seed
      );
    } catch {
      return seed;
    }
  });
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  useEffect(() => {
    const load = async () => {
      const { data, error } = await agentSupabase
        .from("feedback_tickets")
        .select(
          "*,seller:profiles!feedback_tickets_seller_id_fkey(display_name,email)",
        )
        .order("created_at", { ascending: false });
      if (!error && data)
        setTickets(
          data.map((row) => ({
            id: row.id,
            seller: row.seller?.display_name || row.seller?.email || "Seller",
            type: row.type,
            title: row.title,
            content: row.message,
            status: row.status,
            submitted: new Date(row.created_at).toLocaleString(),
            reply: row.admin_response || "",
          })),
        );
    };
    load();
    const channel = agentSupabase
      .channel("agent-live-feedback")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedback_tickets" },
        load,
      )
      .subscribe();
    return () => agentSupabase.removeChannel(channel);
  }, []);
  const visible = tickets.filter(
    (ticket) => filter === "All" || ticket.status === filter,
  );
  const resolve = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    await agentSupabase
      .from("feedback_tickets")
      .update({
        status: "Resolved",
        admin_response: reply.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected);
    const next = tickets.map((ticket) =>
      ticket.id === selected
        ? { ...ticket, status: "Resolved", reply: reply.trim() }
        : ticket,
    );
    setTickets(next);
    setSelected(null);
    setReply("");
  };
  const ticket = tickets.find((item) => item.id === selected);
  return (
    <div className="agent-final-page feedback-page">
      <header>
        <h2>Feedbacks</h2>
        <p>Feedback and support tickets submitted by your sellers.</p>
      </header>
      <nav className="feedback-tabs">
        {["All", "Open", "Resolved"].map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="agent-final-table feedback-table">
        <div className="feedback-head">
          <span>SELLER</span>
          <span>TYPE</span>
          <span>TITLE</span>
          <span>STATUS</span>
          <span>SUBMITTED</span>
          <span />
        </div>
        {visible.map((item) => (
          <article key={item.id}>
            <span className="final-merchant">
              <b>{item.seller.at(-1)}</b>
              <strong>{item.seller}</strong>
            </span>
            <span>{item.type}</span>
            <span>{item.title}</span>
            <span>
              <em className={item.status.toLowerCase()}>{item.status}</em>
            </span>
            <time>{item.submitted}</time>
            <button
              type="button"
              onClick={() => {
                setSelected(item.id);
                setReply(item.reply || "");
              }}
            >
              View
            </button>
          </article>
        ))}
        {!visible.length && <p>No {filter.toLowerCase()} tickets.</p>}
      </section>
      {ticket && (
        <div
          className="feedback-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelected(null)
          }
        >
          <form onSubmit={resolve}>
            <header>
              <h3>Feedback Details</h3>
              <button type="button" onClick={() => setSelected(null)}>
                ×
              </button>
            </header>
            <dl>
              <div>
                <dt>SELLER</dt>
                <dd>{ticket.seller}</dd>
              </div>
              <div>
                <dt>TYPE</dt>
                <dd>{ticket.type}</dd>
              </div>
              <div>
                <dt>TITLE</dt>
                <dd>{ticket.title}</dd>
              </div>
              <div>
                <dt>CONTENT</dt>
                <dd>{ticket.content}</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd>{ticket.status}</dd>
              </div>
            </dl>
            <label>
              REPLY TO SELLER
              <textarea
                disabled={ticket.status === "Resolved"}
                placeholder="Write a reply — it will be sent to the seller and mark this ticket as resolved..."
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
            </label>
            {ticket.status === "Open" ? (
              <button type="submit" disabled={!reply.trim()}>
                ➤ Send Reply &amp; Resolve
              </button>
            ) : (
              <div className="feedback-resolved">
                ✓ This ticket has been resolved.
              </div>
            )}
            <small>
              SUBMITTED<strong>{ticket.submitted}</strong>
            </small>
          </form>
        </div>
      )}
    </div>
  );
}

function AgentMyAccount() {
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [notice, setNotice] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    if (passwords.password.length < 6)
      return setNotice("Password must contain at least 6 characters.");
    if (passwords.password !== passwords.confirm)
      return setNotice("The passwords do not match.");
    const { error } = await agentSupabase.auth.updateUser({
      password: passwords.password,
    });
    setNotice(error ? error.message : "Password updated successfully.");
    if (!error) setPasswords({ password: "", confirm: "" });
  };
  return (
    <div className="agent-final-page account-page">
      <header>
        <h2>My Account</h2>
        <p>Your agent account details and security settings.</p>
      </header>
      <section className="account-card">
        <h3>♧ &nbsp; Profile</h3>
        <div>
          <label>
            AGENT NAME<strong>Demo Agent</strong>
          </label>
          <label>
            AGENT ID<strong>AGT000004</strong>
          </label>
          <label>
            EMAIL<strong>ag•••@example.com</strong>
          </label>
          <label>
            STATUS<strong>Active</strong>
          </label>
          <label>
            COMMISSION RATE<strong>5.0%</strong>
          </label>
          <label>
            MEMBER SINCE<strong>Aug 23, 2026</strong>
          </label>
        </div>
      </section>
      <form className="account-card" onSubmit={submit}>
        <h3>⌕ &nbsp; Change Password</h3>
        <input
          type="password"
          minLength="6"
          required
          placeholder="New password"
          value={passwords.password}
          onChange={(event) =>
            setPasswords({ ...passwords, password: event.target.value })
          }
        />
        <input
          type="password"
          minLength="6"
          required
          placeholder="Confirm new password"
          value={passwords.confirm}
          onChange={(event) =>
            setPasswords({ ...passwords, confirm: event.target.value })
          }
        />
        <button type="submit">Update Password</button>
        {notice && <p className="account-notice">{notice}</p>}
      </form>
    </div>
  );
}

function AgentGeneralConfig() {
  const [config, setConfig] = useState(() => {
    try {
      return {
        ...defaultAgentConfig,
        ...JSON.parse(
          localStorage.getItem("agent_general_preferences") || "{}",
        ),
      };
    } catch {
      return defaultAgentConfig;
    }
  });
  const [saved, setSaved] = useState(false);
  const update = (field, value) =>
    setConfig((current) => ({ ...current, [field]: value }));
  const save = (event) => {
    event.preventDefault();
    localStorage.setItem("agent_general_preferences", JSON.stringify(config));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="agent-general-page">
      <header>
        <h2>General Config</h2>
        <p>Your agent profile and portal preferences.</p>
      </header>
      <form onSubmit={save}>
        <section className="agent-general-card">
          <h3>Profile</h3>
          <div className="agent-general-grid">
            <label>
              Display name *
              <input
                required
                value={config.displayName}
                onChange={(event) => update("displayName", event.target.value)}
              />
            </label>
            <label>
              Company
              <input
                value={config.company}
                onChange={(event) => update("company", event.target.value)}
              />
            </label>
            <label>
              Phone
              <input
                value={config.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </label>
            <label>
              Login email
              <input disabled value="ag•••@example.com" />
            </label>
            <label>
              Agent number
              <input disabled value="AGT000004" />
            </label>
            <label>
              Commission rate
              <input disabled value="5.0%" />
            </label>
          </div>
        </section>
        <section className="agent-general-card agent-preferences-card">
          <h3>Preferences</h3>
          <label className="agent-general-check">
            <span>Email notifications</span>
            <input
              type="checkbox"
              checked={config.emailNotifications}
              onChange={(event) =>
                update("emailNotifications", event.target.checked)
              }
            />
          </label>
          <label className="agent-general-check">
            <span>New order alerts</span>
            <input
              type="checkbox"
              checked={config.newOrderAlerts}
              onChange={(event) =>
                update("newOrderAlerts", event.target.checked)
              }
            />
          </label>
          <div className="agent-general-grid agent-select-grid">
            <label>
              Timezone
              <select
                value={config.timezone}
                onChange={(event) => update("timezone", event.target.value)}
              >
                {[
                  "UTC",
                  "America/New_York",
                  "America/Los_Angeles",
                  "Europe/London",
                  "Asia/Singapore",
                  "Asia/Shanghai",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Currency
              <select
                value={config.currency}
                onChange={(event) => update("currency", event.target.value)}
              >
                {["USD", "EUR", "GBP", "SGD"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <div className="agent-general-save">
          <button type="submit">Save changes</button>
          {saved && <span>Changes saved</span>}
        </div>
      </form>
    </div>
  );
}

function AgentOrderRecords() {
  return (
    <div className="agent-order-records-page">
      <header>
        <h2>Order Records</h2>
        <p>
          A full trail of every order action you have performed for your
          merchants.
        </p>
      </header>
      <section>
        <div className="agent-records-head">
          <span>TIME</span>
          <span>MERCHANT</span>
          <span>ACTION</span>
          <span>DETAILS</span>
        </div>
        {demoOrderRecords.map(([time, action, details], index) => (
          <article key={`${time}-${index}`}>
            <time>{time}</time>
            <span className="agent-record-merchant">
              <b>D</b>
              <strong>Demo Merchant</strong>
            </span>
            <span>
              <em>{action}</em>
            </span>
            <span>{details}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

function AgentAutoOrder() {
  const [merchants, setMerchants] = useState([
    { id: 1, name: "Demo Merchant 1", active: true, quantity: 1, result: "" },
    { id: 2, name: "Demo Merchant 2", active: false, quantity: 1, result: "" },
    { id: 3, name: "Demo Merchant 3", active: true, quantity: 1, result: "" },
  ]);
  const [history, setHistory] = useState([]);
  const toggle = (id) =>
    setMerchants((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active, result: "" } : item,
      ),
    );
  const updateQuantity = (id, quantity) =>
    setMerchants((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
          : item,
      ),
    );
  const generate = (merchant) => {
    const orderNumbers = Array.from(
      { length: merchant.quantity },
      (_, index) => `DEMO-AUTO-${Date.now().toString().slice(-5)}${index + 1}`,
    );
    setHistory((current) => [
      {
        id: Date.now(),
        date: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        merchant: merchant.name,
        count: merchant.quantity,
        orderNumbers: orderNumbers.join(", "),
      },
      ...current,
    ]);
    setMerchants((current) =>
      current.map((item) =>
        item.id === merchant.id
          ? { ...item, result: `Created ${merchant.quantity} order(s).` }
          : item,
      ),
    );
  };
  return (
    <div className="agent-auto-order-page">
      <header>
        <h2>Auto Order</h2>
        <p>
          Automatically generate orders from each merchant’s on-shelf showcase
          products, and control per-merchant automation.
        </p>
      </header>
      <section className="agent-auto-merchants">
        <div className="agent-auto-head">
          <span>MERCHANT</span>
          <span>AUTOMATION</span>
          <span>ORDERS TO CREATE</span>
          <span>RUN</span>
          <span>RESULT</span>
        </div>
        {merchants.map((merchant) => (
          <article key={merchant.id}>
            <span className="agent-auto-name">
              <b>{merchant.name[5] || "D"}</b>
              <strong>{merchant.name}</strong>
            </span>
            <button
              type="button"
              className={merchant.active ? "active" : "paused"}
              onClick={() => toggle(merchant.id)}
            >
              {merchant.active
                ? "▷ Active — click to pause"
                : "Ⅱ Paused — click to resume"}
            </button>
            <input
              type="number"
              min="1"
              max="25"
              value={merchant.quantity}
              onChange={(event) =>
                updateQuantity(merchant.id, event.target.value)
              }
            />
            <button
              type="button"
              className="generate"
              disabled={!merchant.active}
              onClick={() => generate(merchant)}
            >
              ϟ &nbsp; Generate
            </button>
            <span className="agent-auto-result">{merchant.result}</span>
          </article>
        ))}
      </section>
      <h3>◴ &nbsp; AUTO ORDER HISTORY</h3>
      <section className="agent-auto-history">
        <div className="agent-auto-history-head">
          <span>DATE</span>
          <span>MERCHANT</span>
          <span>ORDERS CREATED</span>
          <span>ORDER NUMBERS</span>
        </div>
        {history.map((item) => (
          <article key={item.id}>
            <time>{item.date}</time>
            <span className="agent-auto-name">
              <b>{item.merchant[5] || "D"}</b>
              <strong>{item.merchant}</strong>
            </span>
            <strong>{item.count}</strong>
            <code>{item.orderNumbers}</code>
          </article>
        ))}
        {!history.length && (
          <div className="agent-auto-empty">No auto orders generated yet.</div>
        )}
      </section>
    </div>
  );
}

function AgentBatchReceive() {
  const [orders, setOrders] = useState(
    demoManagedOrders.filter((order) => order.status === "Pending Receive"),
  );
  const [selected, setSelected] = useState(
    () => new Set([demoManagedOrders[0].id]),
  );
  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected(
      selected.size === orders.length
        ? new Set()
        : new Set(orders.map((order) => order.id)),
    );
  const receiveSelected = () => {
    setOrders((current) => current.filter((order) => !selected.has(order.id)));
    setSelected(new Set());
  };
  return (
    <div className="agent-batch-receive-page">
      <header>
        <h2>Batch Receive</h2>
        <p>
          Select shipped orders and mark them as received (completed) in one
          batch.
        </p>
      </header>
      <button
        className="agent-receive-selected"
        type="button"
        disabled={!selected.size}
        onClick={receiveSelected}
      >
        ◇ &nbsp; Receive selected ({selected.size})
      </button>
      <section className="agent-batch-receive-table">
        <div className="agent-batch-receive-head">
          <span />
          <span>ORDER NO</span>
          <span>SELLER</span>
          <span>PRODUCT</span>
          <span>QTY</span>
          <span>AMOUNT</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>
        <div className="agent-select-all">
          <input
            type="checkbox"
            checked={orders.length > 0 && selected.size === orders.length}
            onChange={toggleAll}
          />{" "}
          <span>Select all ({orders.length})</span>
        </div>
        {orders.map((order) => (
          <article key={order.id}>
            <input
              type="checkbox"
              checked={selected.has(order.id)}
              onChange={() => toggle(order.id)}
            />
            <code>{order.id}</code>
            <span className="agent-receive-seller">
              <b>{order.seller[0]}</b>
              <strong>{order.seller}</strong>
            </span>
            <span>{order.product}</span>
            <span>{order.qty}</span>
            <strong>${order.sale.toFixed(2)}</strong>
            <span>
              <em>Pending Receive</em>
            </span>
            <time>{order.date}</time>
          </article>
        ))}
        {!orders.length && (
          <div className="agent-batch-receive-empty">
            No pending orders to receive.
          </div>
        )}
      </section>
    </div>
  );
}

function AgentBatchShip() {
  const [carrier, setCarrier] = useState("TT-Express");
  const selectedCount = 0;
  return (
    <div className="agent-batch-ship-page">
      <header>
        <h2>Batch Ship</h2>
        <p>
          Select pending orders and ship them in one batch. Tracking numbers are
          generated automatically.
        </p>
      </header>
      <div className="agent-batch-ship-tools">
        <select
          value={carrier}
          onChange={(event) => setCarrier(event.target.value)}
        >
          <option>TT-Express</option>
          <option>Standard Delivery</option>
          <option>Priority Courier</option>
        </select>
        <button type="button" disabled={!selectedCount}>
          ♧ &nbsp; Ship selected ({selectedCount})
        </button>
      </div>
      <section>
        <p>No pending orders to ship.</p>
      </section>
    </div>
  );
}

function AgentOrderList() {
  const [orders, setOrders] = useLiveAgentOrders();
  const [status, setStatus] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    seller: "",
    product: "Pink Kids Backpack",
    qty: 1,
  });
  const visible = orders.filter(
    (order) =>
      (status === "All Statuses" || order.status === status) &&
      [order.id, order.product, order.seller].some((value) =>
        value.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const close = () => {
    setStep(0);
    setDraft({ seller: "", product: "Pink Kids Backpack", qty: 1 });
  };
  const addOrder = (event) => {
    event.preventDefault();
    const price =
      draft.product === "Pink Kids Backpack"
        ? 200.1
        : draft.product === "Headphones"
          ? 20
          : 10;
    setOrders([
      {
        id: `DEMO-${Date.now().toString().slice(-6)}`,
        seller: draft.seller,
        product: draft.product,
        customer: "Demo Customer",
        qty: Number(draft.qty),
        sale: price * Number(draft.qty),
        profit: price * 0.2 * Number(draft.qty),
        status: "Pending Receive",
        date: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      },
      ...orders,
    ]);
    close();
  };
  return (
    <div className="agent-order-list-page">
      <header>
        <div>
          <h2>Seller Orders</h2>
          <p>
            Orders from sellers in your network. Create new orders on their
            behalf.
          </p>
        </div>
        <button type="button" onClick={() => setStep(1)}>
          ＋ New Order
        </button>
      </header>
      <div className="agent-order-list-tools">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {["All Statuses", "Pending Receive", "Completed", "Refund"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
        <label>
          <span>⌕</span>
          <input
            type="search"
            placeholder="Order no, product, seller..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <section className="agent-order-list-table">
        <div className="agent-order-list-head">
          <span>ORDER NO</span>
          <span>SELLER</span>
          <span>PRODUCT</span>
          <span>QTY</span>
          <span>AMOUNT</span>
          <span>PROFIT</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>
        {visible.map((order) => (
          <article key={order.id}>
            <code>{order.id}</code>
            <span>{order.seller}</span>
            <strong>{order.product}</strong>
            <span>{order.qty}</span>
            <strong>${order.sale.toFixed(2)}</strong>
            <strong className="profit">${order.profit.toFixed(2)}</strong>
            <span>
              <em
                className={`status-${order.status.toLowerCase().replace(" ", "-")}`}
              >
                {order.status}
              </em>
            </span>
            <time>{order.date}</time>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-order-list-empty">No orders found.</div>
        )}
      </section>
      {step > 0 && (
        <div
          className="agent-new-order-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <form
            className="agent-new-order-modal"
            onSubmit={
              step === 1
                ? (event) => {
                    event.preventDefault();
                    if (draft.seller) setStep(2);
                  }
                : addOrder
            }
          >
            <header>
              <h3>▣ &nbsp; New Order — Step {step} of 2</h3>
              <button type="button" onClick={close}>
                ×
              </button>
            </header>
            {step === 1 ? (
              <label>
                Seller *
                <select
                  required
                  value={draft.seller}
                  onChange={(event) =>
                    setDraft({ ...draft, seller: event.target.value })
                  }
                >
                  <option value="">— Select seller —</option>
                  <option>Demo Merchant</option>
                </select>
              </label>
            ) : (
              <div className="agent-new-order-fields">
                <label>
                  Product *
                  <select
                    value={draft.product}
                    onChange={(event) =>
                      setDraft({ ...draft, product: event.target.value })
                    }
                  >
                    <option>Pink Kids Backpack</option>
                    <option>Headphones</option>
                    <option>Data Cable</option>
                  </select>
                </label>
                <label>
                  Quantity *
                  <input
                    type="number"
                    min="1"
                    value={draft.qty}
                    onChange={(event) =>
                      setDraft({ ...draft, qty: event.target.value })
                    }
                  />
                </label>
              </div>
            )}
            <footer>
              <button
                type="button"
                onClick={step === 1 ? close : () => setStep(1)}
              >
                {step === 1 ? "Cancel" : "Back"}
              </button>
              <button type="submit" disabled={step === 1 && !draft.seller}>
                {step === 1 ? "Next ›" : "Create Order"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

const demoManagedOrders = [
  {
    id: "DEMO-1001",
    seller: "Demo Merchant",
    product: "Pink Kids Backpack",
    customer: "Demo Customer A",
    qty: 1,
    sale: 200.1,
    profit: 40.02,
    status: "Pending Receive",
    date: "Aug 8, 2026",
  },
  {
    id: "DEMO-1002",
    seller: "Demo Merchant",
    product: "Demo Phone",
    customer: "Demo Customer B",
    qty: 1,
    sale: 30,
    profit: 5,
    status: "Pending Receive",
    date: "Jul 29, 2026",
  },
  {
    id: "DEMO-1003",
    seller: "Demo Merchant",
    product: "Data Cable",
    customer: "Demo Customer C",
    qty: 1,
    sale: 10,
    profit: 2,
    status: "Pending Receive",
    date: "Jul 26, 2026",
  },
  {
    id: "DEMO-1004",
    seller: "Demo Merchant",
    product: "Headphones",
    customer: "Demo Customer A",
    qty: 1,
    sale: 20,
    profit: 20,
    status: "Completed",
    date: "Aug 3, 2026",
  },
  {
    id: "DEMO-1005",
    seller: "Demo Merchant",
    product: "Data Cable",
    customer: "Demo Customer B",
    qty: 1,
    sale: 10,
    profit: 2,
    status: "Completed",
    date: "Jul 31, 2026",
  },
  {
    id: "DEMO-1006",
    seller: "Demo Merchant",
    product: "Headphones",
    customer: "Demo Customer C",
    qty: 2,
    sale: 40,
    profit: 40,
    status: "Completed",
    date: "Jul 28, 2026",
  },
  {
    id: "DEMO-1007",
    seller: "Demo Merchant",
    product: "Demo Phone",
    customer: "Demo Customer D",
    qty: 1,
    sale: 30,
    profit: 5,
    status: "Refund",
    date: "Jul 27, 2026",
  },
];

function useLiveAgentOrders() {

  const [orders, setOrders] = useState(demoManagedOrders);
  const load = React.useCallback(async () => {
    const { data, error } = await agentSupabase
    .from("orders")
    .select(
      "*,seller:profiles!orders_seller_id_profiles_fkey(display_name,email)",
    )
    .order("created_at", { ascending: false });
    if (error) console.log("ORDERS LOAD ERROR:", error);
    if (!error && data)
      setOrders(
        data.map((row) => ({
          dbId: row.id,
          id: row.order_no,
          seller: row.seller?.display_name || row.seller?.email || "Seller",
          sellerId: row.seller_id,
          product: row.product_name,
          customer: row.customer_name || "Customer",
          qty: Number(row.quantity || 1),
          sale: Number(row.sell_price || 0) * Number(row.quantity || 1),
          profit:
          (Number(row.sell_price || 0) - Number(row.cost_price || 0)) *
            Number(row.quantity || 1),
            status: row.status,
            date: new Date(row.created_at).toLocaleString(),
          })),
        );
        // Temporary Code
        
  }, []);
  useEffect(() => {
    load();
    const channel = agentSupabase
      .channel(`agent-orders-${Math.random()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        load,
      )
      .subscribe();
    return () => agentSupabase.removeChannel(channel);
  }, [load]);
  return [orders, setOrders, load];
}

function AgentOrderManagement() {
  const [orders, setOrders, reloadOrders] = useLiveAgentOrders();
  const [tab, setTab] = useState("Pending Receive");
  const [search, setSearch] = useState("");
  const groups = {
    "Pending Orders": ["Pending Ship"],
    "Pending Receive": ["Pending Receive", "Shipped"],
    "Completed Orders": ["Completed", "Refund", "Cancelled"],
  };
  const counts = Object.fromEntries(
    Object.entries(groups).map(([label, statuses]) => [
      label,
      orders.filter((order) => statuses.includes(order.status)).length,
    ]),
  );
  const visible = orders.filter(
    (order) =>
      groups[tab].includes(order.status) &&
      [order.id, order.product, order.seller, order.customer].some((value) =>
        String(value || "").toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const changeStatus = async (id, status) => {
    const order = orders.find((item) => item.id === id);
    setOrders((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    if (order?.dbId)
      await agentSupabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", order.dbId);
  };
  return (
    <div className="agent-orders-page">
      <header>
        <div>
          <h2>Order Management</h2>
          <p>
            Manage orders for your assigned sellers. Status changes notify the
            seller immediately.
          </p>
        </div>
        <button type="button">↻ Refresh</button>
      </header>
      <nav>
        {Object.keys(groups).map((item) => (
          <button
            type="button"
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
            <b>{counts[item]}</b>
          </button>
        ))}
      </nav>
      <label className="agent-orders-search">
        <span>⌕</span>
        <input
          type="search"
          placeholder="Order no, product, seller, customer..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <section className="agent-orders-table">
        <div className="agent-orders-head">
          <span>ORDER NO.</span>
          <span>SELLER</span>
          <span>PRODUCT</span>
          <span>CUSTOMER</span>
          <span>QTY</span>
          <span>SALE</span>
          <span>PROFIT</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>
        {visible.map((order) => (
          <article key={order.id}>
            <code>{order.id}</code>
            <strong>{order.seller}</strong>
            <span>{order.product}</span>
            <span>{order.customer}</span>
            <span>{order.qty}</span>
            <strong>${order.sale.toFixed(2)}</strong>
            <strong className="agent-order-profit">
              ${order.profit.toFixed(2)}
            </strong>
            <select
              className={`status-${String(order.status || "").toLowerCase().replace(" ", "-")}`}
              value={order.status || ""}
              onChange={(event) => changeStatus(order.id, event.target.value)}
            >
              {groups[tab].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <time>{order.date}</time>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-orders-empty">No orders found.</div>
        )}
      </section>
      <p className="agent-orders-count">{visible.length} orders</p>
    </div>
  );
}

const demoBalanceLocks = [
  {
    id: "demo-lock-1",
    seller: "Demo Merchant",
    amount: "$0.00",
    reason: "Demo balance hold",
    status: "Active",
    locked: "Aug 23, 2026 01:08 AM",
    released: "—",
  },
];
function AgentBalanceLocks() {
  const [filter, setFilter] = useState("All");
  const visible = demoBalanceLocks.filter(
    (item) => filter === "All" || item.status === filter,
  );
  return (
    <div className="agent-locks-page">
      <header>
        <h2>Balance Locks</h2>
        <p>Balance locks placed on your sellers’ wallets (managed by admin).</p>
      </header>
      <nav>
        {["All", "Active", "Released"].map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="agent-locks-table">
        <div className="agent-locks-head">
          <span>SELLER</span>
          <span>AMOUNT</span>
          <span>REASON</span>
          <span>STATUS</span>
          <span>LOCKED</span>
          <span>RELEASED</span>
        </div>
        {visible.map((item) => (
          <article key={item.id}>
            <span className="agent-lock-seller">
              <b>{item.seller[0]}</b>
              <strong>{item.seller}</strong>
            </span>
            <strong>{item.amount}</strong>
            <span>{item.reason}</span>
            <span>
              <em>{item.status === "Active" ? "Locked" : "Released"}</em>
            </span>
            <time>{item.locked}</time>
            <time>{item.released}</time>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-locks-empty">
            No {filter.toLowerCase()} balance locks.
          </div>
        )}
      </section>
    </div>
  );
}

function AgentCreditLogs() {
  const [filter, setFilter] = useState("All");
  return (
    <div className="agent-credit-page">
      <header>
        <h2>Credit Logs</h2>
        <p>Credit score changes for your sellers.</p>
      </header>
      <nav>
        {["All", "Increase", "Decrease"].map((item) => (
          <button
            type="button"
            key={item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section>
        <p>
          No {filter === "All" ? "" : `${filter.toLowerCase()} `}credit logs.
        </p>
      </section>
    </div>
  );
}

const emptyAddress = {
  merchant: "Demo Merchant",
  label: "",
  recipient: "",
  phone: "",
  country: "",
  state: "",
  city: "",
  address: "",
  postal: "",
  isDefault: false,
};
const demoAddresses = [
  {
    id: 1,
    merchant: "Demo Merchant",
    label: "Main warehouse",
    recipient: "Demo Recipient",
    phone: "+1 ••• ••• 0100",
    country: "United States",
    state: "California",
    city: "San Francisco",
    address: "Demo shipping address",
    postal: "•••••",
    isDefault: true,
    added: "Aug 23, 2026 07:36 PM",
  },
];

function AgentBoundAddresses() {
  const [addresses, setAddresses] = useState(demoAddresses);
  const [merchant, setMerchant] = useState("All merchants");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const filtered =
    merchant === "All merchants"
      ? addresses
      : addresses.filter((item) => item.merchant === merchant);
  const openAdd = () => {
    setForm(emptyAddress);
    setEditing("new");
  };
  const openEdit = (address) => {
    setForm(address);
    setEditing(address.id);
  };
  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const save = (event) => {
    event.preventDefault();
    if (!form.recipient.trim() || !form.address.trim()) return;
    let next = addresses;
    if (form.isDefault)
      next = next.map((item) => ({ ...item, isDefault: false }));
    if (editing === "new")
      next = [
        ...next,
        {
          ...form,
          id: Date.now(),
          added: new Date().toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
        },
      ];
    else
      next = next.map((item) =>
        item.id === editing ? { ...item, ...form } : item,
      );
    setAddresses(next);
    setEditing(null);
  };
  return (
    <div className="agent-bound-page">
      <header>
        <div>
          <h2>Bound Addresses</h2>
          <p>Shipping addresses bound to your merchants’ shops.</p>
        </div>
      </header>
      <div className="agent-bound-tools">
        <select
          value={merchant}
          onChange={(event) => setMerchant(event.target.value)}
        >
          <option>All merchants</option>
          <option>Demo Merchant</option>
        </select>
        <button type="button" onClick={openAdd}>
          ＋ Add Address
        </button>
      </div>
      <section className="agent-bound-table">
        <div className="agent-bound-head">
          <span>MERCHANT</span>
          <span>LABEL</span>
          <span>RECIPIENT</span>
          <span>PHONE</span>
          <span>ADDRESS</span>
          <span>DEFAULT</span>
          <span>ADDED</span>
          <span />
        </div>
        {filtered.map((item) => (
          <article key={item.id}>
            <span className="agent-bound-merchant">
              <b>{item.merchant[0]}</b>
              <strong>{item.merchant}</strong>
            </span>
            <span>{item.label || "—"}</span>
            <strong>{item.recipient}</strong>
            <span>{item.phone || "—"}</span>
            <span
              title={`${item.address}, ${item.city}, ${item.state}, ${item.country}`}
            >
              {[item.address, item.city, item.state, item.country]
                .filter(Boolean)
                .join(", ")}
            </span>
            <span className="agent-bound-star">
              {item.isDefault ? "★" : "☆"}
            </span>
            <time>{item.added}</time>
            <span className="agent-bound-actions">
              <button
                type="button"
                onClick={() => openEdit(item)}
                aria-label="Edit address"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() =>
                  setAddresses(
                    addresses.filter((address) => address.id !== item.id),
                  )
                }
                aria-label="Delete address"
              >
                ♲
              </button>
            </span>
          </article>
        ))}
        {!filtered.length && (
          <div className="agent-bound-empty">No bound addresses.</div>
        )}
      </section>
      {editing && (
        <div
          className="agent-address-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form className="agent-address-modal" onSubmit={save}>
            <h3>{editing === "new" ? "Add Address" : "Edit Address"}</h3>
            {editing === "new" && (
              <label className="wide">
                Merchant
                <select
                  value={form.merchant}
                  onChange={(event) => update("merchant", event.target.value)}
                >
                  <option>Demo Merchant</option>
                </select>
              </label>
            )}
            <div className="agent-address-fields">
              <label>
                Label
                <input
                  value={form.label}
                  placeholder="Warehouse, Home..."
                  onChange={(event) => update("label", event.target.value)}
                />
              </label>
              <label>
                Recipient *
                <input
                  required
                  value={form.recipient}
                  onChange={(event) => update("recipient", event.target.value)}
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label>
                Country
                <input
                  value={form.country}
                  onChange={(event) => update("country", event.target.value)}
                />
              </label>
              <label>
                State
                <input
                  value={form.state}
                  onChange={(event) => update("state", event.target.value)}
                />
              </label>
              <label>
                City
                <input
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                />
              </label>
              <label className="wide">
                Address line *
                <input
                  required
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                />
              </label>
              <label>
                Postal code
                <input
                  value={form.postal}
                  onChange={(event) => update("postal", event.target.value)}
                />
              </label>
              <label className="agent-default-check">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) =>
                    update("isDefault", event.target.checked)
                  }
                />{" "}
                Default address
              </label>
            </div>
            <footer>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit">Save</button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}

const demoShowcaseProducts = [
  {
    id: "demo-1",
    product_code: "CR149325",
    sku: "P1786188066270",
    name: "Business Laptop Bag",
    sell_price: 196,
    cost_price: 156.8,
    category: "Accessories",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    admin_on_shelf: false,
  },
  {
    id: "demo-2",
    product_code: "CR179298",
    sku: "P1786125720721",
    name: "Pink Kids Backpack",
    sell_price: 200.1,
    cost_price: 160.08,
    category: "Other",
    image_url:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=700&q=80",
    admin_on_shelf: true,
  },
  {
    id: "demo-3",
    product_code: "CR149071",
    sku: "P1786125640584",
    name: "Hard Shell Backpack",
    sell_price: 199.99,
    cost_price: 159.99,
    category: "Other",
    image_url:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    admin_on_shelf: true,
  },
  {
    id: "demo-4",
    product_code: "CR149326",
    sku: "P1786125560199",
    name: "Slim Travel Backpack",
    sell_price: 196,
    cost_price: 156.8,
    category: "Accessories",
    image_url:
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=700&q=80",
    admin_on_shelf: true,
  },
  {
    id: "demo-5",
    product_code: "CR149083",
    sku: "P1786125481774",
    name: "Executive Travel Bag",
    sell_price: 186.39,
    cost_price: 149.11,
    category: "Men",
    image_url:
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=700&q=80",
    admin_on_shelf: true,
  },
];

function AgentShowcase() {
  const [products, setProducts] = useState(demoShowcaseProducts);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      const { data, error } = await agentSupabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (mounted && !error && data?.length) setProducts(data);
      if (mounted) setLoading(false);
    };
    loadProducts();
    const channel = agentSupabase
      .channel("agent-global-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        loadProducts,
      )
      .subscribe();
    return () => {
      mounted = false;
      agentSupabase.removeChannel(channel);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.product_code, product.sku, product.name, product.category].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
      ),
    );
  }, [products, search]);

  return (
    <div className="agent-showcase-page">
      <header>
        <h2>Global Showcase</h2>
        <p>
          Products in the global showcase are managed by admin and visible to
          all sellers.
        </p>
      </header>
      <div className="agent-showcase-info">
        <span>◇</span>
        <p>
          Showcase products are managed centrally by the admin. All sellers
          automatically see the same product catalogue. Contact the admin to add
          or update showcase products.
        </p>
      </div>
      <div className="agent-showcase-tools">
        <label>
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span>
          {loading
            ? "Loading products…"
            : `${products.length} products in global showcase`}
        </span>
      </div>
      <section className="agent-showcase-grid">
        {visibleProducts.map((product) => {
          const sellPrice = Number(product.sell_price || 0);
          const costPrice = Number(product.cost_price || 0);
          return (
            <article key={product.id}>
              <div className="agent-showcase-image">
                <img
                  src={product.image_url}
                  alt={product.name || product.product_code}
                />
              </div>
              <div className="agent-showcase-details">
                <strong>{product.product_code}</strong>
                <code>{product.sku}</code>
                <b>${sellPrice.toFixed(2)}</b>
                <p>
                  Cost: ${costPrice.toFixed(2)}{" "}
                  <em>+${Math.max(0, sellPrice - costPrice).toFixed(2)}</em>
                </p>
                <small>{product.category || "Other"}</small>
                <span className={product.admin_on_shelf ? "on" : "off"}>
                  {product.admin_on_shelf ? "On Shelf" : "Off Shelf"}
                </span>
              </div>
            </article>
          );
        })}
        {!visibleProducts.length && (
          <div className="agent-showcase-empty">
            No products match your search.
          </div>
        )}
      </section>
    </div>
  );
}

const merchantRows = [
  {
    id: "DEMO0001",
    initial: "A",
    name: "Demo Merchant 1",
    email: "demo•••@example.com",
    balance: "Not connected",
    frozen: "Demo account",
    credit: 100,
    status: "Active",
    joined: "Aug 9, 2026",
  },
  {
    id: "DEMO0002",
    initial: "C",
    name: "Demo Merchant 2",
    email: "demo•••@example.com",
    balance: "Not connected",
    frozen: "Demo account",
    credit: 100,
    status: "Active",
    joined: "Aug 8, 2026",
  },
  {
    id: "DEMO0003",
    initial: "K",
    name: "Demo Merchant 3",
    email: "demo•••@example.com",
    balance: "Not connected",
    frozen: "Demo account",
    credit: 95,
    status: "Active",
    joined: "Jul 26, 2026",
  },
];

function AgentMerchantList() {
  const [merchants, setMerchants] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const loadMerchants = async () => {
    setLoading(true);
    const [profileRes, transactionRes, lockRes] = await Promise.all([
      agentSupabase
        .from("profiles")
        .select("id,email,display_name,created_at,credit_score,allow_login")
        .eq("role", "seller")
        .order("created_at", { ascending: false }),
      agentSupabase.from("wallet_transactions").select("seller_id,amount"),
      agentSupabase.from("balance_locks").select("seller_id,amount,status"),
    ]);
    if (!profileRes.error) {
      const balances = (transactionRes.data || []).reduce(
        (map, row) =>
          map.set(
            row.seller_id,
            (map.get(row.seller_id) || 0) + Number(row.amount || 0),
          ),
        new Map(),
      );
      const frozen = (lockRes.data || [])
        .filter((row) => String(row.status).toLowerCase() === "active")
        .reduce(
          (map, row) =>
            map.set(
              row.seller_id,
              (map.get(row.seller_id) || 0) + Number(row.amount || 0),
            ),
          new Map(),
        );
      setMerchants(
        (profileRes.data || []).map((profile) => ({
          userId: profile.id,
          id: profile.id.slice(0, 8).toUpperCase(),
          initial: (profile.display_name ||
            profile.email ||
            "S")[0].toUpperCase(),
          name: profile.display_name || profile.email.split("@")[0],
          email: profile.email,
          balance: `$${(balances.get(profile.id) || 0).toFixed(2)}`,
          frozen: `$${(frozen.get(profile.id) || 0).toFixed(2)} frozen`,
          credit: profile.credit_score ?? 100,
          status: profile.allow_login === false ? "Suspended" : "Active",
          joined: new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        })),
      );
    }
    setLoading(false);
  };
  useEffect(() => {
    loadMerchants();
  }, []);
  const visible = merchants.filter(
    (merchant) =>
      (filter === "All" || merchant.status === filter) &&
      [merchant.name, merchant.email, merchant.id].some((value) =>
        value.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const actions = [
    "Balance",
    "Reset Pwd",
    "Kick",
    "Login",
    "Logs",
    "Showcase",
    "Add Clicks",
    "Stop Clicks",
    "Lock Shop",
    "Lock",
    "Payment",
    "✎ Edit",
    "◉ Risk",
    "Order",
    "Click Logs",
  ];
  const financeActions = new Set(["Balance", "Lock", "Logs", "Payment"]);
  const controlActions = new Set([
    "Reset Pwd",
    "Kick",
    "Login",
    "Showcase",
    "✎ Edit",
    "◉ Risk",
  ]);
  const activityActions = new Set([
    "Order",
    "Add Clicks",
    "Stop Clicks",
    "Click Logs",
    "Lock Shop",
  ]);
  const normalizeAction = (action) =>
    action === "✎ Edit"
      ? "Edit"
      : action === "◉ Risk"
        ? "Risk Control"
        : action;
  return (
    <div className="agent-merchant-page">
      <header>
        <div>
          <h2>Merchant List</h2>
          <p>
            Active merchants registered with your code <strong>P516326U</strong>
            . {visible.length} of {merchants.length} shown
          </p>
        </div>
        <button
          type="button"
          aria-label="Refresh merchant list"
          onClick={loadMerchants}
          disabled={loading}
        >
          {loading ? "…" : "↻"}
        </button>
      </header>
      <div className="agent-merchant-tools">
        <label>
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search by name, email, ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <nav>
          {["All", "Active", "Suspended"].map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
      <section className="agent-merchant-table">
        <div className="agent-merchant-head">
          <span>ID</span>
          <span>MERCHANT</span>
          <span>EMAIL</span>
          <span>BALANCE</span>
          <span>CREDIT</span>
          <span>STATUS</span>
          <span>JOINED</span>
          <span />
        </div>
        {visible.map((merchant) => (
          <article key={merchant.userId}>
            <code>{merchant.id}</code>
            <div className="agent-merchant-name">
              <b>{merchant.initial}</b>
              <strong>{merchant.name}</strong>
            </div>
            <span>{merchant.email}</span>
            <div className="agent-balance">
              <b>{merchant.balance}</b>
              <small
                className={merchant.frozen !== "$0.00 frozen" ? "locked" : ""}
              >
                {merchant.frozen !== "$0.00 frozen" ? "▣ " : ""}
                {merchant.frozen}
              </small>
            </div>
            <span>
              <em className="agent-credit">{merchant.credit}</em>
            </span>
            <span>
              <em className="agent-merchant-status">{merchant.status}</em>
            </span>
            <time>{merchant.joined}</time>
            <div className="agent-merchant-actions">
              {actions.map((action, index) => (
                <button
                  type="button"
                  className={`tone-${index % 8}`}
                  key={action}
                  onClick={() =>
                    (financeActions.has(action) ||
                      controlActions.has(action) ||
                      activityActions.has(action)) &&
                    setModal({
                      merchant,
                      action: normalizeAction(action),
                      kind: financeActions.has(action)
                        ? "finance"
                        : controlActions.has(action)
                          ? "control"
                          : "activity",
                    })
                  }
                >
                  {action}
                </button>
              ))}
              <p>
                <button
                  type="button"
                  onClick={() =>
                    setModal({ merchant, action: "Order", kind: "activity" })
                  }
                >
                  Details ›
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModal({ merchant, action: "Manage", kind: "activity" })
                  }
                >
                  Manage ›
                </button>
              </p>
            </div>
          </article>
        ))}
        {!visible.length && (
          <div className="agent-merchant-none">
            {loading ? "Loading sellers…" : "No merchants found."}
          </div>
        )}
      </section>
      {modal?.kind === "finance" && (
        <MerchantFinanceModals
          client={agentSupabase}
          merchant={modal.merchant}
          action={modal.action}
          actor="Agent"
          onClose={() => setModal(null)}
          onChanged={loadMerchants}
        />
      )}
      {modal?.kind === "control" && (
        <MerchantControlModals
          client={agentSupabase}
          merchant={modal.merchant}
          action={modal.action}
          onClose={() => setModal(null)}
          onChanged={loadMerchants}
        />
      )}
      {modal?.kind === "activity" && (
        <MerchantActivityModals
          client={agentSupabase}
          merchant={modal.merchant}
          action={modal.action}
          onClose={() => setModal(null)}
          onChanged={loadMerchants}
          openAction={(action) =>
            setModal({
              merchant: modal.merchant,
              action,
              kind: financeActions.has(action)
                ? "finance"
                : controlActions.has(action)
                  ? "control"
                  : "activity",
            })
          }
        />
      )}
    </div>
  );
}

function AgentApplications() {
  const [tab, setTab] = useState("Pending");
  return (
    <div className="agent-applications-page">
      <header>
        <h2>Applications</h2>
        <p>
          Registration applications submitted with your invitation code{" "}
          <strong>P516326U</strong>. Sellers cannot log in until you approve
          them.
        </p>
      </header>
      <nav>
        <button
          type="button"
          className={tab === "Pending" ? "active" : ""}
          onClick={() => setTab("Pending")}
        >
          Pending (0)
        </button>
        <button
          type="button"
          className={tab === "Rejected" ? "active" : ""}
          onClick={() => setTab("Rejected")}
        >
          Rejected (0)
        </button>
      </nav>
      <section className="agent-applications-empty">
        <div>▱</div>
        <p>No {tab.toLowerCase()} applications.</p>
      </section>
    </div>
  );
}

function AgentUnregistered() {
  const [search, setSearch] = useState("");
  return (
    <div className="agent-unregistered-page">
      <header>
        <h2>Unregistered Sellers</h2>
        <p>
          Accounts that signed up with your code but have not completed
          registration, plus rejected applications.
        </p>
      </header>
      <label className="agent-unregistered-search">
        <span>⌕</span>
        <input
          type="search"
          aria-label="Search unregistered sellers"
          placeholder="Search..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <section className="agent-unregistered-empty">
        {search ? (
          <>No unregistered sellers matching “{search}”.</>
        ) : (
          <>No unregistered sellers.</>
        )}
      </section>
    </div>
  );
}

function AgentTeam() {
  const summaries = [
    ["⌂", "ASSIGNED MERCHANTS", "3"],
    ["♧", "ACTIVE MERCHANTS", "3"],
    ["⊙", "COMMISSION RATE", "5.0%"],
    ["⊙", "TOTAL COMMISSION", "$0.00"],
  ];
  return (
    <div className="agent-team-page">
      <header className="agent-team-heading">
        <h2>Agents</h2>
        <p>Your agent profile and team overview.</p>
      </header>
      <section className="agent-team-summaries">
        {summaries.map(([icon, label, value]) => (
          <article key={label}>
            <i>{icon}</i>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>
      <section className="agent-roster-section">
        <h3>TEAM ROSTER</h3>
        <div className="agent-roster-table">
          <div className="agent-roster-head">
            <span>AGENT</span>
            <span>AGENT NO</span>
            <span>INVITE CODE</span>
            <span>EMAIL</span>
            <span>ROLE</span>
            <span>MERCHANTS</span>
            <span>COMMISSION RATE</span>
          </div>
          <div className="agent-roster-row">
            <span className="agent-roster-name">
              <b>K</b>
              <strong>khan</strong>
            </span>
            <code>AGT000004</code>
            <code>P516326U</code>
            <span>✉ agent@agent.com</span>
            <span>
              <em>Lead agent</em>
            </span>
            <strong>3</strong>
            <strong>5.0%</strong>
          </div>
        </div>
        <p>Sub-agent invitations are managed by the platform admin.</p>
      </section>
      <section className="agent-commissions">
        <h3>RECENT COMMISSIONS</h3>
        <div>No commissions yet.</div>
      </section>
    </div>
  );
}

function AgentDashboard({ inviteCode, inviteLink, copy, copied }) {
  return (
    <div className="agent-dashboard">
      <div className="agent-welcome">
        <h2>Welcome back, khan</h2>
        <p>Here’s an overview of your seller network.</p>
      </div>
      <section className="agent-invite-grid">
        <article className="code-card">
          <small>MY INVITATION CODE</small>
          <strong>{inviteCode}</strong>
          <button type="button" onClick={() => copy(inviteCode, "code")}>
            ▢ {copied === "code" ? "Copied" : "Copy Code"}
          </button>
        </article>
        <article className="link-card">
          <small>SELLER INVITE LINK</small>
          <code>{inviteLink}</code>
          <button type="button" onClick={() => copy(inviteLink, "link")}>
            ▢ {copied === "link" ? "Copied" : "Copy Link"}
          </button>
        </article>
        <article className="qr-card">
          <small>INVITE QR CODE</small>
          <div className="fake-qr" aria-label="Invitation QR code preview" />
          <button type="button" onClick={() => copy(inviteLink, "qr")}>
            ▢ {copied === "qr" ? "Copied" : "Copy QR Link"}
          </button>
          <p>Sellers can register with your code</p>
        </article>
      </section>
      <section className="agent-stat-grid">
        {stats.map(([icon, value, label, tone]) => (
          <article key={label}>
            <i className={tone}>{icon}</i>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>
      <section className="agent-dashboard-lower">
        <article className="agent-orders-chart">
          <h3>Orders — Last 14 Days</h3>
          <div className="agent-chart-lines">
            {Array.from({ length: 13 }, (_, index) => (
              <i key={index} style={{ height: `${index % 2 ? 8 : 18}px` }} />
            ))}
          </div>
          <div className="agent-chart-labels">
            {[
              "Aug 10",
              "Aug 12",
              "Aug 14",
              "Aug 16",
              "Aug 18",
              "Aug 20",
              "Aug 22",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
        <article className="agent-notifications">
          <h3>♧ Notifications</h3>
          {notifications.map(([title, message, date], index) => (
            <div key={`${title}-${index}`}>
              <button type="button" aria-label="Dismiss notification">
                ×
              </button>
              <strong>{title}</strong>
              <p>{message}</p>
              <time>{date}</time>
            </div>
          ))}
        </article>
      </section>
      <section className="agent-recent">
        <h3>Recent Seller Activity</h3>
        <div className="agent-recent-head">
          <span>SELLER</span>
          <span>STATUS</span>
          <span>JOINED</span>
        </div>
        {[
          ["agent1111", "Aug 9, 2026"],
          ["chaudhary", "Aug 8, 2026"],
          ["Khan321", "Jul 26, 2026"],
        ].map(([name, date]) => (
          <div key={name}>
            <strong>{name}</strong>
            <b>active</b>
            <time>{date}</time>
          </div>
        ))}
      </section>
    </div>
  );
}
