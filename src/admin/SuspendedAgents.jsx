import React, { useState } from 'react';
import './SuspendedAgents.css';

export default function SuspendedAgents() {
  const [search, setSearch] = useState('');

  // For now there are no suspended agents
  const suspendedAgents = [];

  const filteredAgents = suspendedAgents.filter((agent) => {
    const value = search.toLowerCase();

    return (
      agent.name.toLowerCase().includes(value) ||
      agent.email.toLowerCase().includes(value) ||
      agent.company.toLowerCase().includes(value) ||
      agent.id.toLowerCase().includes(value)
    );
  });

  return (
    <div className="suspended-agents-page">

      {/* ================= HEADER ================= */}

      <div className="suspended-agents-header">

        <div>
          <h2>Suspended Agents</h2>

          <p>
            Create agents, manage invitation codes, and track their seller
            networks.
          </p>
        </div>

        <button className="suspended-refresh-btn">
          ↻
        </button>

      </div>


      {/* ================= SEARCH ================= */}

      <div className="suspended-search-box">

        <span className="suspended-search-icon">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Search agents by name, company, email or code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* ================= TABLE ================= */}

      <div className="suspended-table-wrapper">

        <table className="suspended-table">

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
            </tr>

          </thead>


          <tbody>

            {filteredAgents.length === 0 ? (

              <tr>
                <td
                  colSpan="9"
                  className="suspended-empty-state"
                >
                  No suspended agents.
                </td>
              </tr>

            ) : (

              filteredAgents.map((agent) => (

                <tr key={agent.id}>

                  <td>

                    <div className="suspended-agent-profile">

                      <div className="suspended-agent-avatar">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
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

                  <td>
                    {agent.company}
                  </td>

                  <td>
                    {agent.invitationCode}
                  </td>

                  <td>
                    <span className="suspended-status-pill">
                      Suspended
                    </span>
                  </td>

                  <td>
                    {agent.sellers}
                  </td>

                  <td>
                    {agent.pending}
                  </td>

                  <td>
                    {agent.commission}
                  </td>

                  <td>
                    {agent.wallet}
                  </td>

                  <td>
                    {agent.lastLogin}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}