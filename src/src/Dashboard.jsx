import React from 'react';
import './Dashboard.css';

export default function Dashboard({ onOpenMerchants }) {

  const recentUsers = [
    {
      id: '08A61A5D',
      store: 'agent1111',
      email: 'agent1111@gmail.com',
      agent: '—',
      registerTime: '2026-08-09 14:16',
    },
    {
      id: '781B16FF',
      store: 'chaudhary',
      email: 'chaudhary@gmail.com',
      agent: '—',
      registerTime: '2026-08-08 01:19',
    },
    {
      id: 'BEF82DC4',
      store: 'Test Agent',
      email: 'agent@gmail.com',
      agent: '—',
      registerTime: '2026-08-06 20:24',
    },
    {
      id: 'E37C8999',
      store: 'Khan321',
      email: 'agent100@gmail.com',
      agent: '—',
      registerTime: '2026-07-26 19:13',
    },
    {
      id: 'CD1EB8DD',
      store: 'khan',
      email: 'agent1000@gmail.com',
      agent: '—',
      registerTime: '2026-07-26 19:09',
    },
    {
      id: '6016D1FC',
      store: 'agent90',
      email: 'agent90@gmail.com',
      agent: '—',
      registerTime: '2026-07-26 15:34',
    },
    {
      id: '38DE9EC5',
      store: 'agent00',
      email: 'agent00@gmail.com',
      agent: '—',
      registerTime: '2026-07-26 13:59',
    },
    {
      id: '5D100585',
      store: 'agent0',
      email: 'agent0@gmail.com',
      agent: '—',
      registerTime: '2026-07-26 12:30',
    },
    {
      id: '4488056D',
      store: 'agent9',
      email: 'agent9@gmail.com',
      agent: '—',
      registerTime: '2026-07-24 12:39',
    },
    {
      id: 'CEABFD4E',
      store: 'agent6',
      email: 'agent6@gmail.com',
      agent: '—',
      registerTime: '2026-07-24 03:33',
    },
  ];

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
              18
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
              6,991.92
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
            18
          </strong>

        </div>


        <div className="small-stat-card">

          <span className="stat-label">
            PENDING APPLICATIONS
          </span>

          <strong className="blue-number">
            0
          </strong>

        </div>


        <div className="small-stat-card">

          <span className="stat-label">
            APPROVED SELLERS
          </span>

          <strong className="green-number">
            18
          </strong>

        </div>


        <div className="small-stat-card">

          <span className="stat-label">
            REJECTED
          </span>

          <strong className="red-number">
            0
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
            18
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
            6,991.92
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
            431.00
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
          0
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
              1
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

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}