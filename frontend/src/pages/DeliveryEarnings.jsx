import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMotorcycle, FaWallet, FaClipboardList, FaChartLine, 
         FaSignOutAlt, FaUser, FaCalendarAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../styles/DeliveryEarnings.css';

const DeliveryEarnings = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [partnerName, setPartnerName] = useState('');
  const [earningHistory, setEarningHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'delivery_partner') {
      navigate('/delivery/login');
      return;
    }
    
    // Load partner information
    const name = localStorage.getItem('partnerName') || 'Delivery Partner';
    setPartnerName(name);
    
    // Load earnings data
    loadEarningsData();
  }, [navigate]);

  const loadEarningsData = () => {
    setLoading(true);
    
    try {
      // Get today's earnings from localStorage
      const todayEarnings = parseFloat(localStorage.getItem('todayEarnings') || '0');
      
      // Get earnings history
      const history = JSON.parse(localStorage.getItem('deliveryEarningsHistory') || '[]');
      setEarningHistory(history);
      
      // Calculate earnings for different periods
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calculate earnings by period
      let weeklyEarnings = 0;
      let monthlyEarnings = 0;
      let totalEarnings = 0;
      
      history.forEach(entry => {
        const entryDate = new Date(entry.timestamp);
        totalEarnings += entry.amount;
        
        if (entryDate >= monthStart) {
          monthlyEarnings += entry.amount;
        }
        
        if (entryDate >= weekStart) {
          weeklyEarnings += entry.amount;
        }
      });
      
      setEarnings({
        today: todayEarnings,
        thisWeek: weeklyEarnings,
        thisMonth: monthlyEarnings,
        total: totalEarnings
      });
    } catch (error) {
      console.error("Error loading earnings data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEarningHistory = () => {
    if (activeFilter === 'all') {
      return earningHistory;
    }
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    switch (activeFilter) {
      case 'today':
        return earningHistory.filter(entry => new Date(entry.timestamp) >= today);
      case 'yesterday':
        return earningHistory.filter(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate >= yesterday && entryDate < today;
        });
      case 'thisWeek':
        return earningHistory.filter(entry => new Date(entry.timestamp) >= weekStart);
      case 'thisMonth':
        return earningHistory.filter(entry => new Date(entry.timestamp) >= monthStart);
      default:
        return earningHistory;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = filterEarningHistory();

  return (
    <div className="dashboard-container earnings-dashboard">
      {/* Header/Navbar */}
      <header className="dashboard-header">
        <div className="logo">
          <FaMotorcycle />
          <h1>FastFood Delivery Partner</h1>
        </div>
        
        <nav className="dashboard-nav">
          <Link to="/delivery/dashboard" className="nav-item">
            <FaUser /> Home
          </Link>
          <Link to="/delivery/orders" className="nav-item">
            <FaClipboardList /> Orders
          </Link>
          <Link to="/delivery/earnings" className="nav-item active">
            <FaWallet /> Earnings
          </Link>
          <Link to="/delivery/account" className="nav-item">
            <FaChartLine /> Account
          </Link>
        </nav>
        
        <div className="user-menu">
          <span className="user-name">{partnerName}</span>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {loading ? (
          <div className="loading-container">Loading earnings data...</div>
        ) : (
          <>
            {/* Earnings Overview */}
            <section className="earnings-overview">
              <h2>Earnings Overview</h2>
              
              <div className="earnings-cards">
                <div className="earnings-card">
                  <div className="earnings-icon today">
                    <FaWallet />
                  </div>
                  <div className="earnings-details">
                    <h3>Today</h3>
                    <p className="amount">₹{earnings.today}</p>
                  </div>
                </div>
                
                <div className="earnings-card">
                  <div className="earnings-icon week">
                    <FaCalendarAlt />
                  </div>
                  <div className="earnings-details">
                    <h3>This Week</h3>
                    <p className="amount">₹{earnings.thisWeek}</p>
                  </div>
                </div>
                
                <div className="earnings-card">
                  <div className="earnings-icon month">
                    <FaCalendarAlt />
                  </div>
                  <div className="earnings-details">
                    <h3>This Month</h3>
                    <p className="amount">₹{earnings.thisMonth}</p>
                  </div>
                </div>
                
                <div className="earnings-card">
                  <div className="earnings-icon total">
                    <FaWallet />
                  </div>
                  <div className="earnings-details">
                    <h3>Total Earnings</h3>
                    <p className="amount">₹{earnings.total}</p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Earnings History */}
            <section className="earnings-history">
              <div className="history-header">
                <h2>Earnings History</h2>
                <div className="history-filters">
                  <button 
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All Time
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('today')}
                  >
                    Today
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'yesterday' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('yesterday')}
                  >
                    Yesterday
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'thisWeek' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('thisWeek')}
                  >
                    This Week
                  </button>
                  <button 
                    className={`filter-btn ${activeFilter === 'thisMonth' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('thisMonth')}
                  >
                    This Month
                  </button>
                </div>
              </div>
              
              {filteredHistory.length === 0 ? (
                <div className="no-earnings-message">
                  <p>No earnings found for the selected period.</p>
                </div>
              ) : (
                <div className="earnings-table-container">
                  <table className="earnings-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((earning) => (
                        <tr key={earning.id}>
                          <td>{formatDate(earning.timestamp)}</td>
                          <td>{formatTime(earning.timestamp)}</td>
                          <td>#{earning.orderId.slice(-6)}</td>
                          <td className="earning-amount">₹{earning.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Total</td>
                        <td className="earning-amount">
                          ₹{filteredHistory.reduce((sum, item) => sum + item.amount, 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DeliveryEarnings;