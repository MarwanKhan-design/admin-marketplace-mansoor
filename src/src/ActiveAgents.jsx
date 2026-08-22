import React, { useState } from 'react';
import './ActiveAgents.css';

export default function ActiveAgents() {
  const [search, setSearch] = useState('');

  const agents = [
    {
      id: 'AGT000005',
      name: 'Test Agent',
      email: 'agent@gmail.com',
      company: '—',
      invitationCode: '••••••••',
      status: 'Active',
      sellers: 1,
      approved: 1,
      pending: 0,
      commission: '$0.00',
      wallet: '$0.00',
      lastLogin: 'Aug 12, 2026',
      unread: 0,
    },
    {
      id: 'AGT000004',
      name: 'khan',
      email: 'agent1000@gmail.com',
      company: 'khan1',
      invitationCode: '••••••••',
      status: 'Active',
      sellers: 3,
      approved: 3,
      pending: 0,
      commission: '$0.00',
      wallet: '$0.00',
      lastLogin: 'Aug 16, 2026',
      unread: 1,
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    const value = search.toLowerCase();

    return (
      agent.name.toLowerCase().includes(value) ||
      agent.email.toLowerCase().includes(value) ||
      agent.company.toLowerCase().includes(value) ||
      agent.id.toLowerCase().includes(value)
    );
  });

  return (
    <div className="active-agents-page">

      {/* ================= HEADER ================= */}
      <div className="active-agents-header">

        <div>
          <h2>Active Agents</h2>

          <p>
            Create agents, manage invitation codes, and track their seller
            networks.
          </p>
        </div>

        <div className="active-agent-header-actions">

  <button className="active-agent-refresh">
    ↻
  </button>

</div>

      </div>


      {/* ================= SEARCH ================= */}
      <div className="active-agent-search">

        <span>⌕</span>

        <input
          type="text"
          placeholder="Search agents by name, company, email or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* ================= TABLE ================= */}
      <div className="active-agent-table-wrapper">

        <table className="active-agent-table">

          <thead>

            <tr>
              <th>AGENT</th>
              <th>COMPANY</th>
              <th>INVITATION CODE</th>
              <th>STATUS</th>
              <th>SELLERS</th>
              <th>PENDING</th>
              <th>COMMISSION</th>
              <th>WALLET</th>
              <th>LAST LOGIN</th>
              <th></th>
            </tr>

          </thead>


          <tbody>

            {filteredAgents.map((agent) => (

              <tr key={agent.id}>

                {/* AGENT */}
                <td>

                  <div className="active-agent-profile">

                    <div className="active-agent-avatar">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="active-agent-information">

                      <strong>
                        {agent.name}
                      </strong>

                      <span>
                        {agent.email}
                      </span>

                      <small>
                        {agent.id}
                      </small>

                    </div>

                  </div>

                </td>


                {/* COMPANY */}
                <td>
                  {agent.company}
                </td>


                {/* INVITATION CODE */}
                <td className="active-invitation-code">
                  {agent.invitationCode}
                </td>


                {/* STATUS */}
                <td>

                  <span className="active-agent-status">
                    {agent.status}
                  </span>

                </td>


                {/* SELLERS */}
                <td>

                  <span className="active-seller-number">
                    {agent.sellers}
                  </span>

                  <span className="active-seller-approved">
                    ({agent.approved} approved)
                  </span>

                </td>


                {/* PENDING */}
                <td className="active-pending">
                  {agent.pending}
                </td>


                {/* COMMISSION */}
                <td>
                  {agent.commission}
                </td>


                {/* WALLET */}
                <td>
                  {agent.wallet}
                </td>


                {/* LAST LOGIN */}
                <td className="active-last-login">
                  {agent.lastLogin}
                </td>


                {/* ACTIONS */}
                <td>

                  <div className="active-agent-actions">

                    <button className="active-manage">
                      Manage
                    </button>

                    <button className="active-view-merchants">
                      ♧ View Merchants
                    </button>

                    <button className="active-message">
                      ◯ Message

                      {agent.unread > 0 && (
                        <span className="active-message-count">
                          {agent.unread}
                        </span>
                      )}

                    </button>

                  </div>

                </td>

              </tr>

            ))}


            {filteredAgents.length === 0 && (

              <tr>

                <td
                  colSpan="10"
                  className="active-no-agents"
                >
                  No active agents found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}