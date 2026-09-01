import React, { useCallback, useEffect, useState } from 'react';
import './Dashboard.css';
import { adminSupabase } from '../shared/supabase';
import {
  fetchPagedRows,
  fetchWalletTransactions,
  isCreditTxn,
  parseMoney,
} from '../shared/wallet';

const TREND_DAYS = 30;
const CHART_WIDTH = 1200;
const CHART_HEIGHT = 230;

const emptyStats = {
  totalSellers: 0,
  pendingApplications: 0,
  approvedSellers: 0,
  rejectedSellers: 0,
  totalUsers: 0,
  usersToday: 0,
  totalRecharge: 0,
  rechargeToday: 0,
  totalWithdraw: 0,
  withdrawToday: 0,
  pendingWithdraw: 0,
  myUsers: 0,
  myUsersToday: 0,
  myRecharge: 0,
  myRechargeToday: 0,
  pendingFeedback: 0,
  pendingKyc: 0,
  pendingRecharge: 0,
};

const money = (value) => parseMoney(value).toFixed(2);

const isSameLocalDay = (value, now = new Date()) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

const dayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const lastNDayKeys = (count) => {
  const keys = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - offset);
    keys.push(dayKey(date));
  }
  return keys;
};

const formatAxisTick = (value, moneyScale) => {
  const amount = Number(value) || 0;
  if (!moneyScale) return String(Math.round(amount));
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  if (Number.isInteger(amount)) return String(amount);
  return amount.toFixed(amount >= 10 ? 0 : 1);
};

const axisTicks = (maxValue, moneyScale) => {
  const max = Math.max(maxValue, moneyScale ? 1 : 1);
  return Array.from({ length: 5 }, (_, index) =>
    formatAxisTick((max * (4 - index)) / 4, moneyScale),
  );
};

const toSmoothPath = (values, maxValue, width, height) => {
  const max = Math.max(maxValue, 1);
  const count = values.length;
  if (!count) return '';
  const points = values.map((value, index) => {
    const x = count === 1 ? 0 : (index / (count - 1)) * width;
    const y = height - 8 - (Number(value || 0) / max) * (height - 18);
    return [x, Math.min(height - 2, Math.max(4, y))];
  });
  if (points.length === 1) return `M${points[0][0]} ${points[0][1]}`;
  let path = `M${points[0][0]} ${points[0][1]}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const prev = points[index === 0 ? index : index - 1];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] || next;
    const cp1x = current[0] + (next[0] - prev[0]) / 6;
    const cp1y = current[1] + (next[1] - prev[1]) / 6;
    const cp2x = next[0] - (after[0] - current[0]) / 6;
    const cp2y = next[1] - (after[1] - current[1]) / 6;
    path += ` C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next[0]} ${next[1]}`;
  }
  return path;
};

const trendLabels = (days) => {
  if (!days.length) return [];
  const picks = [0, 4, 8, 12, 16, 20, 24, days.length - 1];
  return picks.map((index) => {
    const [, month, day] = days[index].split('-');
    return `${month}-${day}`;
  });
};

export default function Dashboard({ onOpenMerchants }) {
  const [recentUsers, setRecentUsers] = useState([]);
  const [subAgents, setSubAgents] = useState([]);
  const [trend, setTrend] = useState({
    days: lastNDayKeys(TREND_DAYS),
    registers: Array(TREND_DAYS).fill(0),
    recharges: Array(TREND_DAYS).fill(0),
    withdrawals: Array(TREND_DAYS).fill(0),
    leftMax: 1,
    rightMax: 1,
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);

  const load = useCallback(async () => {
    setLoading(true);
    if (!adminSupabase) {
      setStats(emptyStats);
      setRecentUsers([]);
      setSubAgents([]);
      setLoading(false);
      return;
    }

    const [profilesRes, txnRes, withdrawRes, feedbackRes, rechargeRes, paymentsRes] =
      await Promise.all([
        adminSupabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        fetchWalletTransactions(adminSupabase),
        fetchPagedRows(adminSupabase, 'withdrawals'),
        fetchPagedRows(adminSupabase, 'feedback_tickets'),
        fetchPagedRows(adminSupabase, 'recharge_requests'),
        fetchPagedRows(adminSupabase, 'payment_methods'),
      ]);

    const profiles = profilesRes.error ? [] : profilesRes.data || [];
    const transactions = txnRes;
    const withdrawals = withdrawRes;
    const feedback = feedbackRes;
    const rechargeRequests = rechargeRes;
    const paymentMethods = paymentsRes;

    const agents = profiles.filter((row) => String(row.role || '').toLowerCase() === 'agent');
    const sellers = profiles.filter((row) => String(row.role || '').toLowerCase() === 'seller');
    const agentNameById = Object.fromEntries(
      agents.map((agent) => [agent.id, agent.display_name || agent.email?.split('@')[0] || 'Agent']),
    );

    const approvedSellers = sellers.filter((row) => row.allow_login !== false);
    const rejectedSellers = sellers.filter((row) => row.allow_login === false);
    const pendingApplications = sellers.filter(
      (row) => String(row.application_status || '').toLowerCase() === 'pending',
    ).length;

    const rechargeTxns = [
      ...transactions.filter(isCreditTxn),
      ...rechargeRequests.filter(
        (row) =>
          String(row.status || '').toLowerCase() === 'approved' &&
          !transactions.length,
      ),
    ];
    const totalRecharge = rechargeTxns.reduce((sum, row) => sum + parseMoney(row.amount), 0);
    const rechargeToday = rechargeTxns
      .filter((row) => isSameLocalDay(row.created_at))
      .reduce((sum, row) => sum + parseMoney(row.amount), 0);

    const approvedWithdrawals = withdrawals.filter(
      (row) => String(row.status || '').toLowerCase() === 'approved',
    );
    const totalWithdraw = approvedWithdrawals.reduce((sum, row) => sum + parseMoney(row.amount), 0);
    const withdrawToday = approvedWithdrawals
      .filter((row) => isSameLocalDay(row.updated_at || row.created_at))
      .reduce((sum, row) => sum + parseMoney(row.amount), 0);
    const pendingWithdraw = withdrawals.filter(
      (row) => String(row.status || '').toLowerCase() === 'pending',
    ).length;

    const pendingFeedback = feedback.filter(
      (row) => String(row.status || '').toLowerCase() === 'open',
    ).length;
    const pendingRecharge = rechargeRequests.filter(
      (row) => String(row.status || '').toLowerCase() === 'pending',
    ).length;
    const fundedSellers = new Set(paymentMethods.map((row) => row.seller_id));
    const pendingKyc = sellers.filter((seller) => !fundedSellers.has(seller.id)).length;

    const usersToday = profiles.filter((row) => isSameLocalDay(row.created_at)).length;
    const sellersToday = sellers.filter((row) => isSameLocalDay(row.created_at)).length;

    setRecentUsers(
      profiles.slice(0, 10).map((row) => ({
        id: String(row.id || '').slice(0, 8).toUpperCase(),
        store: row.display_name || row.email?.split('@')[0] || 'User',
        email: row.email,
        agent: row.agent_id ? agentNameById[row.agent_id] || String(row.agent_id).slice(0, 8) : '—',
        registerTime: new Date(row.created_at).toLocaleString('en-CA', { hour12: false }).replace(',', ''),
      })),
    );

    setSubAgents(
      agents.map((agent) => ({
        id: agent.id,
        name: agent.display_name || agent.email?.split('@')[0] || 'Agent',
        email: agent.email,
        sellers: sellers.filter((seller) => seller.agent_id === agent.id).length,
      })),
    );

    const days = lastNDayKeys(TREND_DAYS);
    const registerCounts = days.map(() => 0);
    const rechargeCounts = days.map(() => 0);
    const withdrawCounts = days.map(() => 0);
    const indexByDay = Object.fromEntries(days.map((key, index) => [key, index]));

    profiles.forEach((row) => {
      const index = indexByDay[dayKey(row.created_at)];
      if (index !== undefined) registerCounts[index] += 1;
    });
    rechargeTxns.forEach((row) => {
      const index = indexByDay[dayKey(row.created_at)];
      if (index !== undefined) rechargeCounts[index] += parseMoney(row.amount);
    });
    approvedWithdrawals.forEach((row) => {
      const index = indexByDay[dayKey(row.updated_at || row.created_at)];
      if (index !== undefined) withdrawCounts[index] += parseMoney(row.amount);
    });

    setTrend({
      days,
      registers: registerCounts,
      recharges: rechargeCounts,
      withdrawals: withdrawCounts,
      leftMax: Math.max(...registerCounts, 1),
      rightMax: Math.max(...rechargeCounts, ...withdrawCounts, 1),
    });

    setStats({
      totalSellers: sellers.length,
      pendingApplications,
      approvedSellers: approvedSellers.length,
      rejectedSellers: rejectedSellers.length,
      totalUsers: profiles.length,
      usersToday,
      totalRecharge,
      rechargeToday,
      totalWithdraw,
      withdrawToday,
      pendingWithdraw,
      myUsers: sellers.length,
      myUsersToday: sellersToday,
      myRecharge: totalRecharge,
      myRechargeToday: rechargeToday,
      pendingFeedback,
      pendingKyc,
      pendingRecharge,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const registerPath = toSmoothPath(trend.registers, trend.leftMax, CHART_WIDTH, CHART_HEIGHT);
  const rechargePath = toSmoothPath(trend.recharges, trend.rightMax, CHART_WIDTH, CHART_HEIGHT);
  const withdrawPath = toSmoothPath(trend.withdrawals, trend.rightMax, CHART_WIDTH, CHART_HEIGHT);

  return (
    <div className="dashboard-page">

      <div className="dashboard-top-tabs">

        <div className="dashboard-top-left">

          <button className="dashboard-tab-button active">
            Dashboard
          </button>

          <button
            className="dashboard-tab-button"
            onClick={onOpenMerchants}
          >
            Merchant List
          </button>

        </div>

        <button
          className="refresh-button"
          type="button"
          aria-label="Refresh dashboard"
          onClick={load}
          disabled={loading}
        >
          {loading ? '…' : '↻'}
        </button>

      </div>


      <section className="dashboard-panel">

        <h2 className="dashboard-section-title">
          Agent Performance
        </h2>

        <div className="performance-cards">

          <div className="performance-card">

            <span className="small-label">
              My Users
            </span>

            <strong className="performance-value">
              {stats.myUsers}
            </strong>

            <span className="today-text">
              Today: <b>{stats.myUsersToday}</b>
            </span>

          </div>


          <div className="performance-card">

            <span className="small-label">
              My Recharge
            </span>

            <strong className="performance-value">
              {money(stats.myRecharge)}
            </strong>

            <span className="today-text">
              Today: {money(stats.myRechargeToday)}
            </span>

          </div>

        </div>


        <div className="sub-agent-section">

          <h3>
            Sub Agents
          </h3>

          {subAgents.length ? (
            <div className="sub-agent-list">
              {subAgents.map((agent) => (
                <div className="sub-agent-row" key={agent.id}>
                  <div>
                    <strong>{agent.name}</strong>
                    <span>{agent.email}</span>
                  </div>
                  <em>{agent.sellers} seller{agent.sellers === 1 ? '' : 's'}</em>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-sub-agents">

              <div className="empty-user-icon">
                ♙♙
              </div>

              <span>
                {loading ? 'Loading agents…' : 'No sub agents'}
              </span>

            </div>
          )}

        </div>

      </section>


      <div className="seller-stat-grid">

        <div className="small-stat-card">

          <span className="stat-label">
            TOTAL SELLERS
          </span>

          <strong>
            {stats.totalSellers}
          </strong>

        </div>


        <div className="small-stat-card">

          <span className="stat-label">
            PENDING APPLICATIONS
          </span>

          <strong className="blue-number">
            {stats.pendingApplications}
          </strong>

        </div>


        <div className="small-stat-card">

          <span className="stat-label">
            APPROVED SELLERS
          </span>

          <strong className="green-number">
            {stats.approvedSellers}
          </strong>

        </div>


        <div className="small-stat-card">

          <span className="stat-label">
            REJECTED
          </span>

          <strong className="red-number">
            {stats.rejectedSellers}
          </strong>

        </div>

      </div>


      <div className="finance-stat-grid">

        <div className="finance-stat-card">

          <span className="stat-label">
            TOTAL USERS
          </span>

          <strong className="blue-number">
            {stats.totalUsers}
          </strong>

          <span className="today-text">
            Today: {stats.usersToday}
          </span>

        </div>


        <div className="finance-stat-card">

          <span className="stat-label">
            RECHARGE USD
          </span>

          <strong className="green-number">
            {money(stats.totalRecharge)}
          </strong>

          <span className="today-text">
            Today: {money(stats.rechargeToday)}
          </span>

        </div>


        <div className="finance-stat-card">

          <span className="stat-label">
            WITHDRAW USD
          </span>

          <strong className="orange-number">
            {money(stats.totalWithdraw)}
          </strong>

          <span className="today-text">
            Today: {money(stats.withdrawToday)}
          </span>

        </div>

      </div>


      <div className="pending-withdraw-card">

        <span className="stat-label">
          PENDING WITHDRAW
        </span>

        <strong>
          {stats.pendingWithdraw}
        </strong>

      </div>


      <section className="dashboard-panel trend-panel">

        <h2 className="dashboard-section-title">
          30-Day Trend
        </h2>


        <div className="trend-chart-wrapper">

          <div className="trend-left-axis">
            {axisTicks(trend.leftMax, false).map((tick, index) => (
              <span key={`left-${index}`}>{tick}</span>
            ))}
          </div>


          <div className="trend-chart">

            <div className="trend-horizontal-line trend-h1"></div>
            <div className="trend-horizontal-line trend-h2"></div>
            <div className="trend-horizontal-line trend-h3"></div>
            <div className="trend-horizontal-line trend-h4"></div>
            <div className="trend-horizontal-line trend-h5"></div>

            <div className="trend-vertical-line trend-v1"></div>
            <div className="trend-vertical-line trend-v2"></div>
            <div className="trend-vertical-line trend-v3"></div>
            <div className="trend-vertical-line trend-v4"></div>
            <div className="trend-vertical-line trend-v5"></div>
            <div className="trend-vertical-line trend-v6"></div>
            <div className="trend-vertical-line trend-v7"></div>


            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
              className="dashboard-trend-svg"
            >

              <path d={registerPath} className="register-curve" />
              <path d={rechargePath} className="recharge-curve" />
              <path d={withdrawPath} className="withdraw-curve" />

            </svg>


            <div className="trend-x-axis">
              {trendLabels(trend.days).map((label, index) => (
                <span key={`x-${index}`}>{label}</span>
              ))}
            </div>

          </div>


          <div className="trend-right-axis">
            {axisTicks(trend.rightMax, true).map((tick, index) => (
              <span key={`right-${index}`}>{tick}</span>
            ))}
          </div>

        </div>


        <div className="trend-legend">

          <span className="legend-item recharge">
            <i></i>
            Recharges
          </span>

          <span className="legend-item register">
            <i></i>
            Registers
          </span>

          <span className="legend-item withdraw">
            <i></i>
            Withdrawals
          </span>

        </div>

      </section>


      <section className="dashboard-panel">

        <h2 className="dashboard-section-title">
          Pending Review
        </h2>


        <div className="pending-review-grid">

          <div className="pending-review-card">

            <strong className="orange-number">
              {stats.pendingKyc}
            </strong>

            <span>
              Pending KYC
            </span>

          </div>


          <div className="pending-review-card">

            <strong className="blue-number">
              {stats.pendingRecharge}
            </strong>

            <span>
              Pending Recharge
            </span>

          </div>


          <div className="pending-review-card">

            <strong className="red-number">
              {stats.pendingWithdraw}
            </strong>

            <span>
              Pending Withdraw
            </span>

          </div>


          <div className="pending-review-card">

            <strong className="purple-number">
              {stats.pendingFeedback}
            </strong>

            <span>
              Pending Feedback
            </span>

          </div>

        </div>

      </section>


      <section className="dashboard-panel recent-users-panel">

        <h2 className="dashboard-section-title">
          Recent Users
        </h2>


        <div className="recent-users-scroll">

          <table className="recent-users-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>
                  STORE NAME
                </th>

                <th>
                  EMAIL
                </th>

                <th>
                  AGENT
                </th>

                <th>
                  REGISTER TIME
                </th>

              </tr>

            </thead>


            <tbody>

              {recentUsers.map((user) => (

                <tr key={`${user.id}-${user.email}`}>

                  <td>
                    {user.id}
                  </td>

                  <td className="store-name">
                    {user.store}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.agent}
                  </td>

                  <td>
                    {user.registerTime}
                  </td>

                </tr>

              ))}

              {loading && !recentUsers.length && (
                <tr><td colSpan={5}>Loading users…</td></tr>
              )}

              {!loading && !recentUsers.length && (
                <tr><td colSpan={5}>No users yet.</td></tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}
