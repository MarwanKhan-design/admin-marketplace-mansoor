import React, { useState } from 'react';
import './Disputes.css';

const filters = ['All', 'Open', 'Under Review', 'Resolved', 'Rejected'];

export default function Disputes() {
  const [activeFilter, setActiveFilter] = useState('All');
  const disputes = [];
  const visibleDisputes = activeFilter === 'All'
    ? disputes
    : disputes.filter((dispute) => dispute.status === activeFilter);

  return (
    <section className="disputes-page">
      <header className="disputes-heading">
        <h2>Dispute Resolution Center</h2>
        <p>Review, investigate, and resolve seller disputes.</p>
      </header>

      <div className="dispute-filter-tabs" aria-label="Filter disputes by status">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="disputes-table-wrap">
        <table className="disputes-table">
          <thead>
            <tr>
              <th>DISPUTE</th>
              <th>SELLER</th>
              <th>TYPE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {visibleDisputes.map((dispute) => (
              <tr key={dispute.id}>
                <td>{dispute.title}</td>
                <td>{dispute.seller}</td>
                <td>{dispute.type}</td>
                <td>{dispute.priority}</td>
                <td>{dispute.status}</td>
                <td>{dispute.date}</td>
              </tr>
            ))}

            {visibleDisputes.length === 0 && (
              <tr>
                <td className="disputes-empty" colSpan="6">No disputes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
