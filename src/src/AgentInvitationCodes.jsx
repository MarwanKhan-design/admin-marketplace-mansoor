import React, { useState } from 'react';
import './AgentInvitationCodes.css';

export default function AgentInvitationCodes() {
  const [search, setSearch] = useState('');

  const agents = [
    {
      id: 'AGT000005',
      name: 'Test Agent',
      email: 'agent@gmail.com',
      invitationCode: '••••••••',
      codeStatus: 'Enabled',
      sellersLinked: 1,
    },
    {
      id: 'AGT000004',
      name: 'khan',
      email: 'agent1000@gmail.com',
      invitationCode: '••••••••',
      codeStatus: 'Enabled',
      sellersLinked: 3,
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    const value = search.toLowerCase();

    return (
      agent.name.toLowerCase().includes(value) ||
      agent.email.toLowerCase().includes(value) ||
      agent.id.toLowerCase().includes(value)
    );
  });

  return (
    <div className="invitation-codes-page">

      {/* ================= HEADER ================= */}
      <div className="invitation-codes-header">

        <div>
          <h2>Agent Invitation Codes</h2>

          <p>
            View, copy, regenerate, enable or disable each agent&apos;s permanent invitation code.
          </p>
        </div>

        <button className="invitation-refresh-btn">
          ↻
        </button>

      </div>


      {/* ================= SEARCH ================= */}
      <div className="invitation-search-box">

        <span className="invitation-search-icon">
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
      <div className="invitation-table-wrapper">

        <table className="invitation-table">

          <thead>
            <tr>
              <th>AGENT</th>
              <th>INVITATION CODE</th>
              <th>CODE STATUS</th>
              <th>SELLERS LINKED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>


          <tbody>

            {filteredAgents.map((agent) => (

              <tr key={agent.id}>

                {/* AGENT */}
                <td>

                  <div className="invitation-agent-profile">

                    <div className="invitation-agent-avatar">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="invitation-agent-info">

                      <strong>
                        {agent.name}
                      </strong>

                      <span>
                        {agent.email}
                      </span>

                    </div>

                  </div>

                </td>


                {/* CODE */}
                <td className="invitation-code-value">
                  {agent.invitationCode}
                </td>


                {/* STATUS */}
                <td>

                  <span className="invitation-status-enabled">
                    {agent.codeStatus}
                  </span>

                </td>


                {/* SELLERS LINKED */}
                <td className="invitation-sellers-linked">
                  {agent.sellersLinked}
                </td>


                {/* ACTIONS */}
                <td>

                  <div className="invitation-actions">

                    <button className="invitation-regenerate-btn">
                      ↻ Regenerate
                    </button>

                    <button className="invitation-disable-btn">
                      ⊘ Disable
                    </button>

                  </div>

                </td>

              </tr>

            ))}


            {filteredAgents.length === 0 && (

              <tr>
                <td
                  colSpan="5"
                  className="invitation-empty"
                >
                  No agents found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}