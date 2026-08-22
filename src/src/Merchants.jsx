import React, { useState } from 'react';
import './Merchants.css';

export default function Merchants() {
  const [statusFilter, setStatusFilter] = useState('All');

  const merchants = [
    {
      id: '73709360',
      name: 'agent1111',
      email: 'agent1111@gmail.com',
      balance: '$0.00',
      credit: 100,
      status: 'Active',
    },
    {
      id: '50103813',
      name: 'chaudhary',
      email: 'chaudhary@gmail.com',
      balance: '$0.00',
      credit: 100,
      status: 'Active',
    },
    {
      id: '35072036',
      name: 'Khan321',
      email: 'agent100@gmail.com',
      balance: '$4,752.92',
      credit: 95,
      status: 'Active',
    },
    {
      id: '34110189',
      name: 'agent90',
      email: 'agent90@gmail.com',
      balance: '$0.00',
      credit: 100,
      status: 'Active',
    },
  ];

  return (
    <div className="merchants-page">

      {/* HEADER */}

      <div className="merchants-header">
        <div>
          <h2>Merchant List</h2>
          <p>Active registered merchants. 16 of 16 shown</p>
        </div>

        <div className="merchants-header-actions">
          <button className="merchant-top-btn">
            ⌕ Filters
          </button>

          <button className="merchant-icon-btn">
            ↻
          </button>
        </div>
      </div>


      {/* SEARCH AND FILTERS */}

      <div className="merchant-toolbar">

        <div className="merchant-search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by name, email, ID, referral code..."
          />
        </div>


        <div className="merchant-filter-buttons">

          {['All', 'Active', 'Suspended'].map((item) => (
            <button
              key={item}
              className={`merchant-filter-btn ${
                statusFilter === item ? 'active' : ''
              }`}
              onClick={() => setStatusFilter(item)}
            >
              {item}
            </button>
          ))}

        </div>

      </div>


      {/* TABLE */}

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
              <th>ACTIONS</th>
              <th></th>
            </tr>
          </thead>


          <tbody>

            {merchants.map((merchant) => (

              <tr key={merchant.id}>

                <td className="merchant-id">
                  {merchant.id}
                </td>


                <td>
                  <div className="merchant-profile">

                    <div className="merchant-avatar">
                      {merchant.name.charAt(0).toUpperCase()}
                    </div>

                    <strong>
                      {merchant.name}
                    </strong>

                  </div>
                </td>


                <td className="merchant-email">
                  {merchant.email}
                </td>


                <td className="merchant-balance">
                  {merchant.balance}
                </td>


                <td>
                  <span
                    className={`credit-pill ${
                      merchant.credit < 100 ? 'warning' : ''
                    }`}
                  >
                    {merchant.credit}
                  </span>
                </td>


                <td>
                  <span className="status-pill active-status">
                    {merchant.status}
                  </span>
                </td>


                <td>

                  <div className="merchant-action-buttons">

                    <button className="action-btn green">
                      Balance
                    </button>

                    <button className="action-btn yellow">
                      Lock
                    </button>

                    <button className="action-btn gray">
                      Logs
                    </button>

                    <button className="action-btn blue">
                      Payment
                    </button>

                    <button className="action-btn orange">
                      Reset Pwd
                    </button>

                    <button className="action-btn slate">
                      Edit
                    </button>

                    <button className="action-btn purple">
                      Risk Control
                    </button>

                    <button className="action-btn red">
                      Kick
                    </button>

                    <button className="action-btn dark">
                      Login
                    </button>

                    <button className="action-btn teal">
                      Showcase
                    </button>

                    <button className="action-btn indigo">
                      Order
                    </button>

                    <button className="action-btn cyan">
                      Add Clicks
                    </button>

                    <button className="action-btn amber">
                      Stop Clicks
                    </button>

                    <button className="action-btn gray">
                      Click Logs
                    </button>

                    <button className="action-btn crimson">
                      Lock Shop
                    </button>

                  </div>

                </td>


                <td>

                  <div className="merchant-manage-links">

                    <button>
                      Details ›
                    </button>

                    <button className="manage">
                      Manage ›
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}