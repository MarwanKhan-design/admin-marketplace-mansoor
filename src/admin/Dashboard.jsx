import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { adminSupabase } from '../shared/supabase';

export default function Dashboard({ onOpenMerchants }) {

  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalSellers: 0, pendingApplications: 0, approvedSellers: 0, rejectedSellers: 0,
    totalUsers: 0, totalRecharge: 0, totalWithdraw: 0, pendingWithdraw: 0,
    myUsers: 0, myRecharge: 0, pendingFeedback: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [profilesRes, txnRes, withdrawRes, feedbackRes] = await Promise.all([
        adminSupabase.from('profiles').select('id,display_name,email,role,agent_id,created_at').order('created_at', { ascending: false }),
        adminSupabase.from('wallet_transactions').select('amount'),
        adminSupabase.from('withdrawals').select('amount,status'),
        adminSupabase.from('feedback_tickets').select('id,status'),
      ]);

      const profiles = profilesRes.data || [];
      setRecentUsers(profiles.slice(0, 10).map((row) => ({
        id: row.id.slice(0, 8).toUpperCase(),
        store: row.display_name || row.email?.split('@')[0] || 'User',
        email: row.email,
        agent: row.agent_id || '—',
        registerTime: new Date(row.created_at).toLocaleString('en-CA', { hour12: false }).replace(',', ''),
      })));

      const sellers = profiles.filter((row) => row.role === 'seller');
      const totalRecharge = (txnRes.data || []).filter((row) => Number(row.amount) > 0).reduce((sum, row) => sum + Number(row.amount), 0);
      const withdrawals = withdrawRes.data || [];
      const totalWithdraw = withdrawals.filter((row) => row.status === 'Approved').reduce((sum, row) => sum + Number(row.amount), 0);
      const pendingWithdraw = withdrawals.filter((row) => row.status === 'Pending').length;
      const pendingFeedback = (feedbackRes.data || []).filter((row) => row.status === 'Open').length;

      setStats({
        totalSellers: sellers.length,
        pendingApplications: 0,
        approvedSellers: sellers.length,
        rejectedSellers: 0,
        totalUsers: profiles.length,
        totalRecharge,
        totalWithdraw,
        pendingWithdraw,
        myUsers: sellers.length,
        myRecharge: totalRecharge,
        pendingFeedback,
      });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="dashboard-page">

      {/* =====================================================
          TOP PAGE TABS
      ===================================================== */}

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

        <button className="refresh-button">
          ↻
        </button>

      </div>


      {/* =====================================================
          AGENT PERFORMANCE
      ===================================================== */}

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
              Today: <b>0</b>
            </span>

          </div>


          <div className="performance-card">

            <span className="small-label">
              My Recharge
            </span>

            <strong className="performance-value">
              {stats.myRecharge.toFixed(2)}
            </strong>

            <span className="today-text">
              Today: 0
            </span>

          </div>

        </div>


        {/* SUB AGENTS */}

        <div className="sub-agent-section">

          <h3>
            Sub Agents
          </h3>

          <div className="empty-sub-agents">

            <div className="empty-user-icon">
              ♙♙
            </div>

            <span>
              No sub agents
            </span>

          </div>

        </div>

      </section>


      {/* =====================================================
          SELLER STATS
      ===================================================== */}

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


      {/* =====================================================
          FINANCE STATS
      ===================================================== */}

      <div className="finance-stat-grid">

        <div className="finance-stat-card">

          <span className="stat-label">
            TOTAL USERS
          </span>

          <strong className="blue-number">
            {stats.totalUsers}
          </strong>

          <span className="today-text">
            Today: 0
          </span>

        </div>


        <div className="finance-stat-card">

          <span className="stat-label">
            RECHARGE USD
          </span>

          <strong className="green-number">
            {stats.totalRecharge.toFixed(2)}
          </strong>

          <span className="today-text">
            Today: 0
          </span>

        </div>


        <div className="finance-stat-card">

          <span className="stat-label">
            WITHDRAW USD
          </span>

          <strong className="orange-number">
            {stats.totalWithdraw.toFixed(2)}
          </strong>

          <span className="today-text">
            Today: 0
          </span>

        </div>

      </div>


      {/* PENDING WITHDRAW */}

      <div className="pending-withdraw-card">

        <span className="stat-label">
          PENDING WITHDRAW
        </span>

        <strong>
          {stats.pendingWithdraw}
        </strong>

      </div>


      {/* =====================================================
          30 DAY TREND
      ===================================================== */}

      <section className="dashboard-panel trend-panel">

        <h2 className="dashboard-section-title">
          30-Day Trend
        </h2>


        <div className="trend-chart-wrapper">

          {/* LEFT Y AXIS */}

          <div className="trend-left-axis">

            <span>8</span>
            <span>6</span>
            <span>4</span>
            <span>2</span>
            <span>0</span>

          </div>


          <div className="trend-chart">

            {/* GRID */}

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


            {/* CURVES */}

            <svg
              viewBox="0 0 1200 230"
              preserveAspectRatio="none"
              className="dashboard-trend-svg"
            >

              {/* Registers - Blue */}

              <path
                d="
                M0 225
                C40 225, 55 210, 75 165
                C90 120, 105 120, 125 185
                C145 250, 165 225, 180 175
                C195 125, 215 120, 235 190
                C255 250, 300 225, 350 225
                C420 225, 470 225, 520 225
                C580 225, 610 205, 640 220
                C680 240, 700 225, 730 225
                C760 225, 780 205, 805 215
                C830 228, 850 225, 875 215
                C900 205, 930 215, 950 225
                C1000 225, 1080 225, 1200 225
                "
                className="register-curve"
              />


              {/* Recharge - Green */}

              <path
                d="
                M0 225
                C80 225, 130 225, 170 223
                C205 220, 220 235, 245 225
                C270 215, 285 180, 315 180
                C355 180, 395 220, 440 225
                C470 230, 485 215, 510 220
                C540 230, 570 225, 600 225
                C625 225, 645 205, 665 215
                C690 230, 720 225, 740 225
                C760 225, 775 205, 790 115
                C802 45, 820 15, 838 90
                C850 150, 855 215, 875 225
                C940 225, 1030 225, 1200 225
                "
                className="recharge-curve"
              />


              {/* Withdrawals - Orange */}

              <path
                d="
                M0 225
                C150 225, 190 225, 215 225
                C235 225, 245 205, 260 160
                C270 125, 285 50, 305 45
                C330 45, 365 100, 390 145
                C410 180, 430 225, 465 225
                C500 225, 520 225, 545 225
                C560 225, 575 160, 590 110
                C605 60, 620 55, 635 110
                C650 165, 655 225, 680 225
                C800 225, 980 225, 1200 225
                "
                className="withdraw-curve"
              />

            </svg>


            {/* X AXIS */}

            <div className="trend-x-axis">

              <span>07-22</span>
              <span>07-26</span>
              <span>07-30</span>
              <span>08-03</span>
              <span>08-07</span>
              <span>08-11</span>
              <span>08-15</span>
              <span>08-19</span>

            </div>

          </div>


          {/* RIGHT Y AXIS */}

          <div className="trend-right-axis">

            <span>220</span>
            <span>165</span>
            <span>110</span>
            <span>55</span>
            <span>0</span>

          </div>

        </div>


        {/* LEGEND */}

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


      {/* =====================================================
          PENDING REVIEW
      ===================================================== */}

      <section className="dashboard-panel">

        <h2 className="dashboard-section-title">
          Pending Review
        </h2>


        <div className="pending-review-grid">

          <div className="pending-review-card">

            <strong className="orange-number">
              0
            </strong>

            <span>
              Pending KYC
            </span>

          </div>


          <div className="pending-review-card">

            <strong className="blue-number">
              0
            </strong>

            <span>
              Pending Recharge
            </span>

          </div>


          <div className="pending-review-card">

            <strong className="red-number">
              0
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


      {/* =====================================================
          RECENT USERS
      ===================================================== */}

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

                <tr key={user.id}>

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