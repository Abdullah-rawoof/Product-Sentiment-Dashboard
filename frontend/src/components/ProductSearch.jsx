import React, { useState, useEffect } from 'react';
import { Search, Loader2, Check, Sparkles, Terminal } from 'lucide-react';

const LOADING_STEPS = [
  "Resolving search query or URL...",
  "Connecting to e-commerce scraping engine...",
  "Bypassing bot-detection firewalls...",
  "Parsing HTML structures & extracting raw reviews...",
  "Analyzing text with NLTK VADER sentiment model...",
  "Generating key phrase word distributions...",
  "Finalizing SQL schema inserts & rendering dashboard..."
];

export default function ProductSearch({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [stepIndex, setStepIndex] = useState(0);

  // Rotate loading steps every 1.1 seconds when loading is active
  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query.trim());
  };

  const presetQueries = [
    "Sony WH-1000XM5 Headphones",
    "iPhone 15 Pro Max",
    "MacBook Air M3",
    "https://www.amazon.com/dp/B0D5NFRC29"
  ];

  return (
    <div className="search-wrapper">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Paste Amazon/Flipkart product URL or type a product name (e.g. iPhone 15)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Sentiment
            </>
          )}
        </button>
      </form>

      {/* Preset queries below search input to make test queries easier */}
      {!loading && (
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try:</span>
          {presetQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-btn"
              onClick={() => {
                setQuery(q);
                onSearch(q);
              }}
            >
              {q.startsWith('http') ? 'Amazon URL' : q}
            </button>
          ))}
        </div>
      )}

      {/* Animated loading step logger */}
      {loading && (
        <div className="glass-panel loading-overlay" style={{ marginTop: '24px' }}>
          <div className="spinner"></div>
          <h4 className="loading-title">Extracting Review Sentiments</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
            Our scraping agent is scanning user feedback. This takes about 5-8 seconds.
          </p>
          <div className="progress-steps">
            {LOADING_STEPS.map((step, idx) => {
              let status = 'pending'; // pending, active, completed
              if (idx < stepIndex) {
                status = 'completed';
              } else if (idx === stepIndex) {
                status = 'active';
              }

              return (
                <div key={idx} className={`progress-step ${status}`}>
                  <div className="progress-icon">
                    {status === 'completed' && <Check size={14} />}
                    {status === 'active' && <Loader2 className="animate-spin" size={14} />}
                    {status === 'pending' && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid currentColor', opacity: 0.3 }} />}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
