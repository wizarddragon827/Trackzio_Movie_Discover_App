import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';

export default function ViewModeToggle({ viewMode, setViewMode, className = '' }) {
  return (
    <div className={`view-mode-toggle ${className}`} role="group" aria-label="Device View Switcher">
      <button
        type="button"
        className={`btn-view-toggle ${viewMode === 'desktop' ? 'active' : ''}`}
        onClick={() => setViewMode('desktop')}
        title="Switch to Full Desktop View"
        id="toggle-desktop-view-btn"
      >
        <Monitor size={15} />
        <span className="view-toggle-text">Desktop</span>
      </button>

      <button
        type="button"
        className={`btn-view-toggle ${viewMode === 'mobile' ? 'active' : ''}`}
        onClick={() => setViewMode('mobile')}
        title="Switch to Mobile Smartphone View"
        id="toggle-mobile-view-btn"
      >
        <Smartphone size={15} />
        <span className="view-toggle-text">Mobile</span>
      </button>
    </div>
  );
}
