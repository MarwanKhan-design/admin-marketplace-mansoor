import React, { useState } from 'react';
import './AllAgents.css';

export default function AllAgents({ openCreateAgent = false }) {

  const [showNewAgentModal, setShowNewAgentModal] = useState(openCreateAgent);

const [newAgent, setNewAgent] = useState({
  fullName: '',
  company: '',
  email: '',
  phone: '',
  password: '',
  commission: 5,
  status: 'Active',
});

  const agents = [
    {
      id: 'AGT000005',
      name: 'Test Agent',
      email: 'agent@gmail.com',
      company: '—',
      invitationCode: '••••••••',
      status: 'Active',
      sellers: '1',
      sellersDetail: '(1 approved)',
      pending: '0',
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
      sellers: '3',
      sellersDetail: '(3 approved)',
      pending: '0',
      commission: '$0.00',
      wallet: '$0.00',
      lastLogin: 'Aug 16, 2026',
      unread: 1,
    },
  ];

  return (
    <div className="all-agents-page">

      {/* HEADER */}
      <div className="all-agents-header">

        <div>
          <h2>All Agents</h2>

          <p>
            Create agents, manage invitation codes,
            and track their seller networks.
          </p>
        </div>

        <div className="all-agents-header-actions">

          <button className="agents-refresh-btn">
            ↻
          </button>

          <button
  className="new-agent-btn"
  onClick={() => setShowNewAgentModal(true)}
>
  <span>♙</span>
  New Agent
</button>

        </div>

      </div>


      {/* STATS */}
      <div className="agent-stat-grid">

        <div className="agent-stat-card">

          <div className="agent-stat-icon">
            ♙
          </div>

          <strong>2</strong>

          <span>Total Agents</span>

        </div>


        <div className="agent-stat-card">

          <div className="agent-stat-icon">
            ♙
          </div>

          <strong>2</strong>

          <span>Active</span>

        </div>


        <div className="agent-stat-card">

          <div className="agent-stat-icon">
            ♙
          </div>

          <strong>0</strong>

          <span>Suspended</span>

        </div>


        <div className="agent-stat-card">

          <div className="agent-stat-icon">
            ♙
          </div>

          <strong>4</strong>

          <span>Total Linked Sellers</span>

        </div>

      </div>


      {/* SEARCH */}
      <div className="agents-search-box">

        <span className="agents-search-icon">
          ⌕
        </span>

        <input
          type="text"
          placeholder="Search agents by name, company, email or code"
        />

      </div>


      {/* TABLE */}
      <div className="agents-table-wrapper">

        <table className="agents-table">

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

            {agents.map((agent) => (

              <tr key={agent.id}>

                {/* AGENT */}
                <td>

                  <div className="agent-profile">

                    <div className="agent-avatar">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="agent-profile-text">

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
                <td className="invitation-code">
                  {agent.invitationCode}
                </td>


                {/* STATUS */}
                <td>

                  <span className="agent-status active">
                    {agent.status}
                  </span>

                </td>


                {/* SELLERS */}
                <td>

                  <span className="seller-count">
                    {agent.sellers}
                  </span>

                  <span className="seller-approved">
                    {agent.sellersDetail}
                  </span>

                </td>


                {/* PENDING */}
                <td className="pending-count">
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
                <td className="last-login">
                  {agent.lastLogin}
                </td>


                {/* ACTIONS */}
                <td>

                  <div className="agent-actions">

                    <button className="agent-action manage">
                      Manage
                    </button>

                    <button className="agent-action merchants">
                      ♧ View Merchants
                    </button>

                    <button className="agent-action message">
                      ◯ Message

                      {agent.unread > 0 && (
                        <span className="message-badge">
                          {agent.unread}
                        </span>
                      )}

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
{showNewAgentModal && (

  <div className="new-agent-modal-overlay">

    <div className="new-agent-modal">

      {/* HEADER */}
      <div className="new-agent-modal-header">

        <h3>Create New Agent</h3>

        <button
          className="new-agent-modal-close"
          onClick={() => setShowNewAgentModal(false)}
        >
          ×
        </button>

      </div>


      {/* FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          console.log('New Agent:', newAgent);

          setShowNewAgentModal(false);
        }}
      >

        {/* FULL NAME */}
        <div className="new-agent-form-group">

          <label>
            Full Name *
          </label>

          <input
            type="text"
            placeholder="e.g. John Smith"
            value={newAgent.fullName}
            onChange={(e) =>
              setNewAgent({
                ...newAgent,
                fullName: e.target.value,
              })
            }
            required
          />

        </div>


        {/* COMPANY */}
        <div className="new-agent-form-group">

          <label>
            Company Name (Optional)
          </label>

          <input
            type="text"
            placeholder="e.g. Smith Trading Ltd"
            value={newAgent.company}
            onChange={(e) =>
              setNewAgent({
                ...newAgent,
                company: e.target.value,
              })
            }
          />

        </div>


        {/* EMAIL */}
        <div className="new-agent-form-group">

          <label>
            Email *
          </label>

          <input
            type="email"
            placeholder="agent@example.com"
            value={newAgent.email}
            onChange={(e) =>
              setNewAgent({
                ...newAgent,
                email: e.target.value,
              })
            }
            required
          />

        </div>


        {/* PHONE */}
        <div className="new-agent-form-group">

          <label>
            Phone Number *
          </label>

          <input
            type="text"
            placeholder="+92 300 1234567"
            value={newAgent.phone}
            onChange={(e) =>
              setNewAgent({
                ...newAgent,
                phone: e.target.value,
              })
            }
            required
          />

        </div>


        {/* PASSWORD */}
        <div className="new-agent-form-group">

          <label>
            Password * (min 6 chars)
          </label>

          <input
            type="password"
            placeholder="Enter password"
            minLength="6"
            value={newAgent.password}
            onChange={(e) =>
              setNewAgent({
                ...newAgent,
                password: e.target.value,
              })
            }
            required
          />

        </div>


        {/* COMMISSION */}
        <div className="new-agent-form-group">

          <label>
            Commission Rate (%)
          </label>

          <input
            type="number"
            min="0"
            max="100"
            value={newAgent.commission}
            onChange={(e) =>
              setNewAgent({
                ...newAgent,
                commission: e.target.value,
              })
            }
          />

        </div>


        {/* STATUS */}
        <div className="new-agent-form-group">

          <label>
            Status *
          </label>

          <div className="new-agent-status-buttons">

            <button
              type="button"
              className={`agent-status-option ${
                newAgent.status === 'Active'
                  ? 'selected-active'
                  : ''
              }`}
              onClick={() =>
                setNewAgent({
                  ...newAgent,
                  status: 'Active',
                })
              }
            >
              Active
            </button>


            <button
              type="button"
              className={`agent-status-option ${
                newAgent.status === 'Suspended'
                  ? 'selected-suspended'
                  : ''
              }`}
              onClick={() =>
                setNewAgent({
                  ...newAgent,
                  status: 'Suspended',
                })
              }
            >
              Suspended
            </button>

          </div>

        </div>


        {/* FOOTER BUTTONS */}
        <div className="new-agent-modal-footer">

          <button
            type="button"
            className="new-agent-cancel-btn"
            onClick={() => setShowNewAgentModal(false)}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="new-agent-create-btn"
          >
            Create Agent
          </button>

        </div>

      </form>

    </div>

  </div>

)}
    </div>

    
  );
}
