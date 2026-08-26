import React, { useState } from 'react';
import './GeneralConfig.css';

export default function GeneralConfig() {
  const [refreshing, setRefreshing] = useState(false);

  const refreshConfig = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <section className="general-config-page">
      <div className="general-config-header">
        <div>
          <h2>General Config</h2>
          <p>Platform-wide settings, fees, and system controls.</p>
        </div>

        <button
          type="button"
          className={refreshing ? 'config-refresh refreshing' : 'config-refresh'}
          onClick={refreshConfig}
          aria-label="Refresh configuration"
        >
          ↻
        </button>
      </div>
    </section>
  );
}
