import React, { useState } from 'react';
import { Star, Search, SlidersHorizontal, AlertCircle } from 'lucide-react';

export default function ReviewList({ reviews }) {
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [search, setSearch] = useState('');

  if (!reviews || reviews.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No reviews available for this product.
      </div>
    );
  }

  // Filter reviews locally
  const filteredReviews = reviews.filter(r => {
    const matchesSentiment = sentimentFilter === 'all' || r.sentiment_label === sentimentFilter;
    const matchesRating = ratingFilter === 'all' || r.rating.toString() === ratingFilter;
    const matchesSearch = !search.trim() || 
      r.text?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer_name?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSentiment && matchesRating && matchesSearch;
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= rating ? "currentColor" : "none"}
          style={{ opacity: i <= rating ? 1 : 0.25 }}
        />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  return (
    <div className="glass-panel" style={{ marginTop: '24px' }}>
      {/* Filtering Header controls */}
      <div className="reviews-control-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Scraped Customer Reviews ({filteredReviews.length})</h3>
        </div>
        
        <div className="filter-group">
          {/* Text Search inside reviews */}
          <div className="reviews-search-box">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="reviews-search-input"
              placeholder="Search in reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sentiment Filter */}
          <select
            className="filter-select"
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive Only</option>
            <option value="neutral">Neutral Only</option>
            <option value="negative">Negative Only</option>
          </select>

          {/* Star Rating Filter */}
          <select
            className="filter-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Review Cards Listing */}
      {filteredReviews.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--primary)' }} />
          <p>No reviews match your filter criteria.</p>
        </div>
      ) : (
        <div className="reviews-list-container">
          {filteredReviews.map((r) => (
            <div key={r.id} className="review-item-card">
              <div className="review-item-header">
                <div className="review-author-section">
                  <span className="review-author-name">{r.reviewer_name || 'Anonymous User'}</span>
                  <span className="review-date-str">{r.date || 'Review Date Unknown'}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderStars(r.rating)}
                  <span className={`review-sentiment-tag ${r.sentiment_label}`}>
                    {r.sentiment_label.toUpperCase()}
                  </span>
                </div>
              </div>

              {r.title && <h4 className="review-item-title">{r.title}</h4>}
              <p className="review-item-text">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
