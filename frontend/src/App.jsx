import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Tag, 
  Database, 
  Link2, 
  Star, 
  Activity, 
  Info,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import HistoryList from './components/HistoryList';
import ProductSearch from './components/ProductSearch';
import SentimentTrends from './components/SentimentTrends';
import ReviewList from './components/ReviewList';
import WordCloud from './components/WordCloud';
import { 
  analyzeProduct, 
  fetchHistory, 
  deleteHistoryItem,
  fetchProductDetail
} from './utils/api';

export default function App() {
  const [history, setHistory] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trends'); // trends, reviews, cloud
  const [notification, setNotification] = useState(null); // { type, message }

  // Load history list on mount
  useEffect(() => {
    loadHistoryList();
  }, []);

  const loadHistoryList = async () => {
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      showNotification('error', 'Could not load search history.');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSearch = async (target) => {
    setLoading(true);
    setActiveProduct(null);
    try {
      const result = await analyzeProduct(target);
      setActiveProduct(result);
      
      // Notify cache status
      if (result.cached) {
        showNotification('info', 'Loaded from database cache (recent analysis).');
      } else {
        showNotification('success', 'Product scraped and analyzed successfully!');
      }
      
      // Refresh sidebar list
      await loadHistoryList();
    } catch (err) {
      showNotification('error', err.message || 'Sentiment analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (id) => {
    setLoading(true);
    setActiveProduct(null);
    try {
      const data = await fetchProductDetail(id);
      setActiveProduct(data);
      showNotification('info', `Switched to "${data.title}"`);
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteHistoryItem(id);
      showNotification('success', 'Search item removed from history.');
      
      // Update states
      setHistory(prev => prev.filter(item => item.id !== id));
      if (activeProduct && activeProduct.id === id) {
        setActiveProduct(null);
      }
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Helper to render rating stars in product header
  const renderAverageStars = (rating) => {
    const stars = [];
    const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(<Star key={i} size={16} fill="currentColor" />);
      } else if (i - 0.5 === rounded) {
        stars.push(
          <div key={i} style={{ position: 'relative', display: 'inline-block', color: 'var(--accent)' }}>
            <Star size={16} style={{ opacity: 0.25 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden', color: 'var(--accent)' }}>
              <Star size={16} fill="currentColor" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={16} style={{ opacity: 0.25 }} />);
      }
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
        {stars}
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '6px', fontWeight: 600 }}>
          {rating} / 5.0
        </span>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar Panel for History */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity size={24} style={{ color: 'var(--primary)' }} />
          <h2 className="brand-title">SentimentIQ</h2>
        </div>
        <HistoryList
          history={history}
          activeId={activeProduct?.id}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
        />
      </aside>

      {/* Main Workspace Dashboard */}
      <main className="workspace">
        <div className="workspace-container">
          
          {/* Header Title Section */}
          <div className="dashboard-header">
            <div className="header-title-section">
              <h1>Product Sentiment Dashboard</h1>
              <p>Scan e-commerce products for reviews, run VADER NLP logic, and map visual sentiment trends.</p>
            </div>
          </div>

          {/* Search form bar */}
          <ProductSearch onSearch={handleSearch} loading={loading} />

          {/* Render Dashboard if product is loaded */}
          {activeProduct && !loading && (
            <div style={{ marginTop: '32px' }}>
              
              {/* Product Info Profile Summary */}
              <div className="glass-panel product-profile-card">
                <div className="product-img-wrapper">
                  <img 
                    src={activeProduct.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} 
                    alt={activeProduct.title}
                    className="product-img"
                  />
                </div>
                <div className="product-profile-info">
                  <span className={`product-platform-badge ${activeProduct.platform?.toLowerCase()}`}>
                    {activeProduct.platform} Source
                  </span>
                  <h2 className="product-headline" title={activeProduct.title}>
                    {activeProduct.title}
                  </h2>
                  <div className="product-link-row">
                    {renderAverageStars(activeProduct.avg_rating)}
                    {activeProduct.url && (
                      <>
                        <span>•</span>
                        <a 
                          href={activeProduct.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="product-link-anchor"
                        >
                          <Link2 size={14} />
                          View Original Product Link
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics Grid Row */}
              <div className="metrics-grid">
                
                {/* Sentiment Rating Box */}
                <div className="glass-panel metric-card">
                  <div className="metric-icon-box green">
                    <Activity size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Sentiment Index</span>
                    <span className="metric-value">
                      {activeProduct.sentiment_distribution?.positive_pct || 0}% Positive
                    </span>
                    <span className="metric-subtitle">Of total scanned reviews</span>
                  </div>
                </div>

                {/* Scraped count box */}
                <div className="glass-panel metric-card">
                  <div className="metric-icon-box blue">
                    <MessageSquare size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Scraped Reviews</span>
                    <span className="metric-value">
                      {activeProduct.review_count || 0}
                    </span>
                    <span className="metric-subtitle">Extracted text datasets</span>
                  </div>
                </div>

                {/* Scrape Integrity Box */}
                <div className="glass-panel metric-card">
                  <div className="metric-icon-box orange">
                    <Database size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-title">Extraction Mode</span>
                    <span className="metric-value" style={{ fontSize: '1.2rem', padding: '3px 0' }}>
                      {activeProduct.platform === 'Simulator' ? 'Simulated Fallback' : 'Real E-Commerce'}
                    </span>
                    <span className="metric-subtitle">
                      {activeProduct.platform === 'Simulator' ? 'Bypassed browser block' : 'Live crawler scan'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Tab Selector Navigation */}
              <div className="tabs-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('trends')}
                >
                  <BarChart3 size={16} />
                  Sentiment Trends
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <MessageSquare size={16} />
                  Reviews Table
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'cloud' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cloud')}
                >
                  <Tag size={16} />
                  Key Phrases
                </button>
              </div>

              {/* Tab Contents Pane */}
              <div className="tab-pane-content">
                {activeTab === 'trends' && <SentimentTrends product={activeProduct} />}
                {activeTab === 'reviews' && <ReviewList reviews={activeProduct.reviews} />}
                {activeTab === 'cloud' && <WordCloud keyPhrases={activeProduct.key_phrases} />}
              </div>

            </div>
          )}

          {/* Empty state panel when no product is selected */}
          {!activeProduct && !loading && (
            <div className="glass-panel empty-state">
              <div className="empty-icon-container">
                <Sparkles size={36} />
              </div>
              <h3>Analyze Product Sentiments</h3>
              <p>
                Gain instant intelligence about customer experiences. Paste an Amazon or Flipkart link, 
                or type a generic product query, to crawle details, run our NLTK VADER sentiment analyzer, 
                and see interactive trends.
              </p>
              <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', alignItems: 'center' }}>
                <Info size={14} />
                <span>Features automatic anti-blocking simulator fallback for residential IP crawls.</span>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <div className="progress-icon">
            {notification.type === 'success' && <CheckCircle size={18} style={{ color: 'var(--success)' }} />}
            {notification.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--error)' }} />}
            {notification.type === 'info' && <Info size={18} style={{ color: 'var(--primary)' }} />}
          </div>
          <div className="notification-message">
            {notification.message}
          </div>
          <button 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '8px' }}
            onClick={() => setNotification(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
