import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClipboardList, FaRupeeSign } from 'react-icons/fa';
import DeliveryNavbar from '../components/DeliveryNavbar';
import '../styles/DeliveryEarnings.css';

const DeliveryEarnings = ({ handleLogout }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [period, setPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  
  // Earnings data
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [ordersCompleted, setOrdersCompleted] = useState(0);
  const [averagePerOrder, setAveragePerOrder] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    // Get partner info from localStorage
    const name = localStorage.getItem('partnerName');
    setPartnerName(name || 'Delivery Partner');
    
    // Check online status from localStorage or set default
    const status = localStorage.getItem('isOnline') === 'true';
    setIsOnline(status);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
          setCurrentLocation(coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation('Location unavailable');
        }
      );
    }
    
    // Load mock earnings data
    loadEarningsData(period);
    
    setIsLoading(false);
  }, [period]);
  
  const loadEarningsData = (selectedPeriod) => {
    // Mock data for different time periods
    let mockEarnings, mockOrders, mockTransactions;
    
    switch (selectedPeriod) {
      case 'today':
        mockEarnings = 280;
        mockOrders = 4;
        mockTransactions = [
          { id: 'TX123', date: new Date(), orderId: 'ORD12345', restaurant: 'Burger Palace', amount: 50 },
          { id: 'TX124', date: new Date(Date.now() - 2 * 60 * 60 * 1000), orderId: 'ORD12346', restaurant: 'Pizza Corner', amount: 75 },
          { id: 'TX125', date: new Date(Date.now() - 4 * 60 * 60 * 1000), orderId: 'ORD12347', restaurant: 'Chinese Wok', amount: 65 },
          { id: 'TX126', date: new Date(Date.now() - 6 * 60 * 60 * 1000), orderId: 'ORD12348', restaurant: 'Taco Spot', amount: 90 }
        ];
        break;
        
      case 'week':
        mockEarnings = 1850;
        mockOrders = 24;
        mockTransactions = Array(10).fill().map((_, i) => ({
          id: `TX${100 + i}`,
          date: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
          orderId: `ORD${10000 + i}`,
          restaurant: ['Burger Palace', 'Pizza Corner', 'Chinese Wok', 'Taco Spot', 'Sushi Bar'][i % 5],
          amount: 50 + (i % 5) * 10
        }));
        break;
        
      case 'month':
        mockEarnings = 7500;
        mockOrders = 95;
        mockTransactions = Array(15).fill().map((_, i) => ({
          id: `TX${200 + i}`,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          orderId: `ORD${20000 + i}`,
          restaurant: ['Burger Palace', 'Pizza Corner', 'Chinese Wok', 'Taco Spot', 'Sushi Bar'][i % 5],
          amount: 50 + (i % 5) * 15
        }));
        break;
        
      default:
        mockEarnings = 1850;
        mockOrders = 24;
        mockTransactions = [];
    }
    
    setTotalEarnings(mockEarnings);
    setOrdersCompleted(mockOrders);
    setAveragePerOrder(mockOrders > 0 ? (mockEarnings / mockOrders).toFixed(2) : 0);
    setTransactions(mockTransactions);
  };
  
  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    localStorage.setItem('isOnline', newStatus.toString());
  };
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="delivery-earnings-container">
      <DeliveryNavbar 
        isOnline={isOnline}
        toggleOnlineStatus={toggleOnlineStatus}
        partnerName={partnerName}
        currentLocation={currentLocation}
        handleLogout={handleLogout}
      />
      
      <div className="earnings-container">
        <div className="earnings-header">
          <h1>Your Earnings</h1>
          <div className="period-selector">
            <button 
              className={period === 'today' ? 'active' : ''} 
              onClick={() => setPeriod('today')}
            >
              Today
            </button>
            <button 
              className={period === 'week' ? 'active' : ''} 
              onClick={() => setPeriod('week')}
            >
              This Week
            </button>
            <button 
              className={period === 'month' ? 'active' : ''} 
              onClick={() => setPeriod('month')}
            >
              This Month
            </button>
          </div>
        </div>
        
        <div className="earnings-summary">
          <div className="summary-card total">
            <span className="label">Total Earnings</span>
            <span className="amount">
              <FaRupeeSign />
              {totalEarnings}
            </span>
          </div>
          <div className="summary-card orders">
            <span className="label">Orders Completed</span>
            <span className="amount">
              <FaClipboardList />
              {ordersCompleted}
            </span>
          </div>
          <div className="summary-card average">
            <span className="label">Average Per Order</span>
            <span className="amount">
              <FaRupeeSign />
              {averagePerOrder}
            </span>
          </div>
        </div>
        
        <div className="transactions-list">
          <h2>Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions found for the selected period</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Restaurant</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>#{tx.orderId.slice(-6)}</td>
                    <td>{tx.restaurant}</td>
                    <td className="amount">₹{tx.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryEarnings;