import React, { useEffect, useMemo, useState } from "react";
import "./SellerMessages.css";

const tabs = [
  "Announcements",
  "Order Notices",
  "Buyer Messages",
  "Platform Msgs",
];

export default function SellerMessages({ client, sellerId, onBack }) {
  const [activeTab, setActiveTab] = useState("Announcements");
  const [announcements, setAnnouncements] = useState([]);
  const [notices, setNotices] = useState([]);
  const [buyerMessages, setBuyerMessages] = useState([]);
  const [platformMessages, setPlatformMessages] = useState([]);
  const [openThread, setOpenThread] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client || !sellerId) return;
    const load = async () => {
      setLoading(true);
      const [announcementsRes, messagesRes, ordersRes] = await Promise.all([
        client
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false }),
        client
          .from("messages")
          .select(
            "*,sender:profiles!messages_sender_id_profiles_fkey(display_name,email),recipient:profiles!messages_recipient_id_profiles_fkey(display_name,email),product:products(id,name,product_code,sell_price,image_url)",
          )
          .in("channel", ["platform", "buyer", "agent"])
          .or(`sender_id.eq.${sellerId},recipient_id.eq.${sellerId}`)
          .order("created_at", { ascending: true }),
        client
          .from("orders")
          .select("id,order_no,product_name,status,updated_at")
          .eq("seller_id", sellerId)
          .order("updated_at", { ascending: false })
          .limit(20),
      ]);

      setAnnouncements(
        (announcementsRes.data || []).map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          date: new Date(item.created_at).toLocaleString(),
        })),
      );

      setNotices(
        (ordersRes.data || []).map((item) => ({
          id: item.id,
          title: `Order ${item.status || "Updated"}`,
          message: `${item.order_no || item.id} — ${item.product_name || "Order"}`,
          order: item.order_no || item.id,
          date: new Date(item.updated_at).toLocaleString(),
        })),
      );

      const rows = messagesRes.data || [];
      setBuyerMessages(rows.filter((item) => item.channel === "buyer"));
      setPlatformMessages(rows.filter((item) => item.channel === "platform" || item.channel === "agent"));

      setLoading(false);
    };
    load();
    const channel = client
      .channel("seller-message-center")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        load,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        load,
      )
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, sellerId]);

  // Group a flat list of messages into one thread per conversation partner
  const groupIntoThreads = (rows) => {
    const byPartner = new Map();
    rows.forEach((item) => {
      const partnerId =
        item.sender_id === sellerId ? item.recipient_id : item.sender_id;
      const partnerProfile =
        item.sender_id === sellerId ? item.recipient : item.sender;
      const partnerName =
        partnerProfile?.display_name || partnerProfile?.email || "User";
      if (!byPartner.has(partnerId)) {
        byPartner.set(partnerId, { partnerId, partnerName, messages: [], channel: item.channel });
      }
      byPartner.get(partnerId).messages.push({
        id: item.id,
        mine: item.sender_id === sellerId,
        text: item.body,
        product: item.product,
        date: new Date(item.created_at).toLocaleString(),
        createdAt: item.created_at,
      });
    });
    return Array.from(byPartner.values())
      .map((thread) => ({
        ...thread,
        lastMessage: thread.messages[thread.messages.length - 1],
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt),
      );
  };

  const buyerThreads = useMemo(
    () => groupIntoThreads(buyerMessages),
    [buyerMessages, sellerId],
  );
  const platformThreads = useMemo(
    () => groupIntoThreads(platformMessages),
    [platformMessages, sellerId],
  );

  const activeThread = useMemo(() => {
    if (!openThread) return null;
    const list = openThread.type === "buyer" ? buyerThreads : platformThreads;
    return (
      list.find((thread) => thread.partnerId === openThread.partnerId) || null
    );
  }, [openThread, buyerThreads, platformThreads]);

  const sendReply = async (event) => {
    event.preventDefault();
    if (!openThread?.partnerId || !sellerId || !client || !reply.trim()) return;
    const { error } = await client.from("messages").insert({
      sender_id: sellerId,
      recipient_id: openThread.partnerId,
      channel: activeThread?.channel || openThread.type,
      body: reply.trim(),
    });
    if (error) {
      console.log("SEND REPLY ERROR:", error);
      return;
    }
    setReply("");
  };

  return (
    <main className="seller-messages-page">
      <div className="seller-messages-shell">
        <header>
          <button type="button" onClick={onBack}>
            ‹
          </button>
          <h1>Messages</h1>
          <span />
        </header>
        <nav className="seller-message-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        {activeTab === "Announcements" && (
          <section className="seller-announcement-list">
            {announcements.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
                <time>{item.date}</time>
              </article>
            ))}
            {!loading && !announcements.length && (
              <div className="seller-messages-empty">No announcements yet.</div>
            )}
          </section>
        )}
        {activeTab === "Order Notices" && (
          <section className="seller-notice-list">
            {notices.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <button type="button">Order No: {item.order}</button>
                </div>
                <time>{item.date}</time>
                <b>›</b>
              </article>
            ))}
            {!loading && !notices.length && (
              <div className="seller-messages-empty">No order notices yet.</div>
            )}
          </section>
        )}
        {activeTab === "Buyer Messages" && (
          <section className="buyer-thread-list">
            {buyerThreads.map((thread) => (
              <article key={thread.partnerId}>
                <div className="buyer-message">
                  <span>♙</span>
                  <div>
                    <strong>{thread.partnerName}</strong>
                    <p>{thread.lastMessage.text}</p>
                    <time>{thread.lastMessage.date}</time>
                  </div>
                </div>
                <button
                  className="buyer-reply-btn"
                  type="button"
                  onClick={() =>
                    setOpenThread({
                      type: "buyer",
                      partnerId: thread.partnerId,
                    })
                  }
                >
                  ▱ View Thread
                </button>
              </article>
            ))}
            {!loading && !buyerThreads.length && (
              <div className="seller-messages-empty">
                No buyer messages yet.
              </div>
            )}
          </section>
        )}
        {activeTab === "Platform Msgs" && (
          <section className="platform-message-list">
            {platformThreads.map((thread) => (
              <article key={thread.partnerId}>
                <div className="platform-avatar">TS</div>
                <div>
                  <strong>{thread.partnerName}</strong>
                  <time>{thread.lastMessage.date}</time>
                  <p>{thread.lastMessage.text}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenThread({
                        type: "platform",
                        partnerId: thread.partnerId,
                      })
                    }
                  >
                    ▱ View Thread
                  </button>
                </div>
              </article>
            ))}
            {!loading && !platformThreads.length && (
              <div className="seller-messages-empty">
                No platform messages yet.
              </div>
            )}
          </section>
        )}
        {openThread && activeThread && (
          <div
            className="seller-reply-overlay"
            onMouseDown={(event) =>
              event.target === event.currentTarget && setOpenThread(null)
            }
          >
            <form onSubmit={sendReply}>
              <div>
                <h2>{activeThread.partnerName}</h2>
                <button type="button" onClick={() => setOpenThread(null)}>
                  ×
                </button>
              </div>
              <div className="seller-thread-scroll">
                {activeThread.messages.map((item) => (
                  <div
                    key={item.id}
                    className={`seller-thread-bubble ${item.mine ? "mine" : "theirs"}`}
                  >
                    {item.product && (
                      <span className="seller-thread-product-tag">
                        {item.product.image_url && <img src={item.product.image_url} alt="" />}
                        {item.product.name || item.product.product_code} · ${Number(item.product.sell_price || 0).toFixed(2)}
                      </span>
                    )}
                    <p>{item.text}</p>
                    <time>{item.date}</time>
                  </div>
                ))}
              </div>
              <textarea
                autoFocus
                required
                placeholder="Write your reply..."
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
              <button type="submit">Send Reply</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
