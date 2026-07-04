import React from 'react';
import { Trash2, Sparkles, AlertCircle } from 'lucide-react';

export default function HistoryList({ history, activeId, onSelect, onDelete }) {
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="sidebar-content">
      <h3 className="sidebar-title">Recent Analyses</h3>
      {history.length === 0 ? (
        <div style={{ padding: '24px 8px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          <AlertCircle size={20} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          No recent searches. Enter a query to begin.
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <button
              key={item.id}
              className={`history-item ${activeId === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <div className="history-info">
                <div className="history-product-title" title={item.title}>
                  {item.title}
                </div>
                <div className="history-meta">
                  <span className={`product-platform-badge ${item.platform?.toLowerCase()}`} style={{ padding: '1px 6px', fontSize: '9px', margin: 0 }}>
                    {item.platform}
                  </span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <span
                className="history-delete-btn"
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                title="Remove from history"
              >
                <Trash2 size={13} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
