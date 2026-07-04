import React from 'react';
import { Tag } from 'lucide-react';

export default function WordCloud({ keyPhrases }) {
  if (!keyPhrases || keyPhrases.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No key phrase cloud generated. Scrape reviews to see keyword frequencies.
      </div>
    );
  }

  // Calculate scaling limits for tag cloud text sizes
  const counts = keyPhrases.map(p => p.value);
  const maxVal = Math.max(...counts);
  const minVal = Math.min(...counts);

  const getFontSize = (val) => {
    if (maxVal === minVal) return '1rem';
    // Map counts to range 0.85rem to 1.75rem
    const minSize = 0.85;
    const maxSize = 1.75;
    const size = minSize + ((val - minVal) / (maxVal - minVal)) * (maxSize - minSize);
    return `${size}rem`;
  };

  const getGlowOpacity = (val) => {
    if (maxVal === minVal) return 0.1;
    return 0.05 + ((val - minVal) / (maxVal - minVal)) * 0.25;
  };

  return (
    <div className="word-cloud-container">
      {/* Visual Tag Cloud Panel */}
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <div className="chart-title-bar" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Sentiment Tag Cloud</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>KEYWORD DENSITY RATIO</span>
        </div>
        <div className="word-cloud-grid">
          {keyPhrases.map((phrase, idx) => (
            <span
              key={idx}
              className="word-cloud-tag"
              style={{
                fontSize: getFontSize(phrase.value),
                color: `rgba(255, 255, 255, ${0.45 + (phrase.value / maxVal) * 0.55})`,
                borderColor: `rgba(0, 242, 254, ${getGlowOpacity(phrase.value)})`,
                boxShadow: phrase.value === maxVal ? '0 0 12px rgba(0, 242, 254, 0.15)' : 'none'
              }}
            >
              {phrase.text}
              <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: 'var(--primary)', opacity: 0.8 }}>
                {phrase.value}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Density Metrics Table */}
      <div className="glass-panel word-details-table-panel">
        <div className="chart-title-bar" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Keyword Density Leaderboard</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PHRASE COUNT</span>
        </div>
        <table className="words-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>Rank</th>
              <th>Keyword / Term</th>
              <th>Occurrences</th>
              <th style={{ width: '40%' }}>Visual Weight</th>
            </tr>
          </thead>
          <tbody>
            {keyPhrases.slice(0, 15).map((phrase, idx) => {
              const percentage = maxVal > 0 ? (phrase.value / maxVal) * 100 : 0;
              return (
                <tr key={idx}>
                  <td><strong>#{idx + 1}</strong></td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {phrase.text}
                  </td>
                  <td>{phrase.value} times</td>
                  <td>
                    {/* Visual progress gauge */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
