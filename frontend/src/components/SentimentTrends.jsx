import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';

export default function SentimentTrends({ product }) {
  if (!product || !product.reviews || product.reviews.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No review trends data available.
      </div>
    );
  }

  const { reviews, sentiment_distribution } = product;

  // 1. Pie Chart Data (Donut Chart)
  const pieData = [
    { name: 'Positive', value: sentiment_distribution.positive || 0, color: '#10b981' }, // Emerald
    { name: 'Neutral', value: sentiment_distribution.neutral || 0, color: '#8b5cf6' },  // Purple
    { name: 'Negative', value: sentiment_distribution.negative || 0, color: '#ef4444' }  // Red
  ].filter(item => item.value > 0);

  // 2. Bar Chart Data (Sentiment vs Star Rating)
  const ratingMap = [
    { name: '1 Star', positive: 0, neutral: 0, negative: 0 },
    { name: '2 Stars', positive: 0, neutral: 0, negative: 0 },
    { name: '3 Stars', positive: 0, neutral: 0, negative: 0 },
    { name: '4 Stars', positive: 0, neutral: 0, negative: 0 },
    { name: '5 Stars', positive: 0, neutral: 0, negative: 0 }
  ];

  reviews.forEach(r => {
    const starIdx = r.rating - 1;
    if (starIdx >= 0 && starIdx < 5) {
      if (r.sentiment_label === 'positive') ratingMap[starIdx].positive++;
      else if (r.sentiment_label === 'neutral') ratingMap[starIdx].neutral++;
      else if (r.sentiment_label === 'negative') ratingMap[starIdx].negative++;
    }
  });

  // 3. Line Chart Data (Sentiment Score Timeline)
  // Sort reviews by date, parsing dates if possible
  const sortedReviews = [...reviews]
    .map(r => {
      let timeVal = 0;
      if (r.date) {
        const parsed = Date.parse(r.date);
        if (!isNaN(parsed)) timeVal = parsed;
      }
      return { ...r, timeVal };
    })
    .sort((a, b) => a.timeVal - b.timeVal); // Chronological

  // Group by date or display review indices for clean progression curves
  const lineData = sortedReviews.map((r, idx) => ({
    name: r.date ? r.date.split(' ').slice(0, 2).join(' ') : `Review ${idx + 1}`,
    score: parseFloat(r.sentiment_score.toFixed(2)),
    reviewer: r.reviewer_name || 'Anonymous'
  }));

  // Custom tooltips for Recharts
  const renderCustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = sentiment_distribution.positive + sentiment_distribution.neutral + sentiment_distribution.negative;
      const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div style={{ background: '#101828', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 600, color: data.color }}>{data.name}</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#f8fafc' }}>
            Count: <strong>{data.value}</strong> ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const polarity = data.score > 0.05 ? 'Positive' : data.score < -0.05 ? 'Negative' : 'Neutral';
      const color = data.score > 0.05 ? '#10b981' : data.score < -0.05 ? '#ef4444' : '#8b5cf6';
      
      return (
        <div style={{ background: '#101828', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{data.name}</p>
          <p style={{ margin: '4px 0', fontWeight: 600, color: '#f8fafc' }}>By: {data.reviewer}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color }}>
            VADER Score: <strong>{data.score}</strong> ({polarity})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-grid">
      {/* Donut Chart: Sentiment Distribution */}
      <div className="glass-panel chart-panel">
        <div className="chart-title-bar">
          <h3>Sentiment Breakdown</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PIE POLARITY DISTRIBUTION</span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderCustomPieTooltip} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stacked Bar Chart: Sentiment vs Star Rating */}
      <div className="glass-panel chart-panel">
        <div className="chart-title-bar">
          <h3>Sentiment vs Rating</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STAR RATING MAPPING</span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ratingMap}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ background: '#101828', borderRadius: '8px', borderColor: 'rgba(255,255,255,0.1)' }}
                itemStyle={{ fontSize: '0.85rem' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <Bar dataKey="positive" name="Positive" stackId="a" fill="#10b981" />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart: Chronological Sentiment Trends */}
      <div className="glass-panel chart-panel" style={{ gridColumn: 'span 2' }}>
        <div className="chart-title-bar">
          <h3>Sentiment Chronology</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VADER COMPOUND POLARITY WAVE</span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} domain={[-1.0, 1.0]} />
              <Tooltip content={renderCustomLineTooltip} />
              <Line 
                type="monotone" 
                dataKey="score" 
                name="Sentiment Score"
                stroke="url(#lineGradient)" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 1, stroke: '#00f2fe' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
