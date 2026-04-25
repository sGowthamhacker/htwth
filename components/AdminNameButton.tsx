
import React from 'react';

const AdminNameButton: React.FC = () => {
  return (
    <div className="relative inline-block">
      <style>{`
        .admin-name-btn {
          margin: 0;
          height: auto;
          background: transparent;
          padding: 0;
          border: none;
          cursor: pointer;
          --border-right: 4px;
          /* Light Mode Defaults */
          --text-stroke-color: #64748b; /* Slate-500 */
          --animation-color: #4f46e5; /* Indigo-600 */
          --fs-size: 1.2em;
          letter-spacing: 2px;
          text-decoration: none;
          font-size: var(--fs-size);
          font-family: 'Inter', sans-serif;
          position: relative;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px var(--text-stroke-color);
          font-weight: 800;
          line-height: 1.2;
        }
        
        /* Dark Mode Overrides */
        .dark .admin-name-btn {
            --text-stroke-color: #94a3b8; /* Slate-400 */
            --animation-color: #22d3ee; /* Cyan-400 (Hacker vibe) */
        }

        .admin-name-btn .hover-text {
          position: absolute;
          box-sizing: border-box;
          content: attr(data-text);
          color: var(--animation-color);
          width: 0%;
          inset: 0;
          border-right: var(--border-right) solid var(--animation-color);
          overflow: hidden;
          transition: 0.5s;
          -webkit-text-stroke: 1px var(--animation-color);
          white-space: nowrap;
          padding-right: 2px;
        }

        .admin-name-btn:hover .hover-text {
          width: 100%;
          filter: drop-shadow(0 0 8px var(--animation-color));
        }
      `}</style>
      <button className="admin-name-btn" data-text="Gowtham S">
        <span className="actual-text">&nbsp;Gowtham S&nbsp;</span>
        <span aria-hidden="true" className="hover-text" data-text="&nbsp;Gowtham S&nbsp;">&nbsp;Gowtham S&nbsp;</span>
      </button>
    </div>
  );
};

export default AdminNameButton;
