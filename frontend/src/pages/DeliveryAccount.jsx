import React, { useState, useEffect } from 'react';
import { FaStar, FaUser, FaMotorcycle, FaBicycle, FaCar, FaIdCard, FaSave, FaTimes } from 'react-icons/fa';
import DeliveryNavbar from '../components/DeliveryNavbar';
import '../styles/DeliveryAccount.css';

const DeliveryAccount = ({ handleLogout }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile state
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('bike');
  const [rating, setRating] = useState(0);
  const [joinDate, setJoinDate] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
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
    
    // Load mock profile data
    loadMockProfile();
    
    setIsLoading(false);
  }, []);
  
  const loadMockProfile = () => {
    // Mock profile data for demo
    setName('John Rider');
    setEmail('john@example.com');
    setPhone('9876543210');
    setVehicleType('bike');
    setRating(4.8);
    
    // Mock join date (3 months ago)
    const mockJoinDate = new Date();
    mockJoinDate.setMonth(mockJoinDate.getMonth() - 3);
    setJoinDate(mockJoinDate.toISOString());
  };
  
  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    localStorage.setItem('isOnline', newStatus.toString());
  };
  
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    // In a real app, send update to API
    console.log('Updating profile with:', { name, email, phone, vehicleType });
    
    // For demo, just update partner name in localStorage
    localStorage.setItem('partnerName', name);
    setPartnerName(name);
    
    setIsEditing(false);
    alert('Profile updated successfully!');
  };
  
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    // In a real app, send password update to API
    console.log('Updating password');
    
    // Reset fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    alert('Password changed successfully!');
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  const getVehicleIcon = () => {
    switch (vehicleType) {
      case 'bike': return <FaMotorcycle size={24} />;
      case 'bicycle': return <FaBicycle size={24} />;
      case 'car': return <FaCar size={24} />;
      default: return <FaMotorcycle size={24} />;
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="delivery-account-container">
      <DeliveryNavbar 
        isOnline={isOnline}
        toggleOnlineStatus={toggleOnlineStatus}
        partnerName={partnerName}
        currentLocation={currentLocation}
        handleLogout={handleLogout}
      />
      
      <div className="account-container">
        <h1>Account Settings</h1>
        
        <div className="profile-section">
          <div className="profile-header">
            <div className="avatar-section">
              <div className="avatar-large">
                {avatar ? (
                  <img src={avatar} alt="Profile" />
                ) : (
                  <FaUser size={48} />
                )}
              </div>
              <button className="change-avatar">Change Photo</button>
            </div>
            <div className="profile-info">
              <h2>{name}</h2>
              <div className="rating">
                <FaStar color="#FFC107" />
                <span>{rating} / 5.0</span>
              </div>
              <div className="partner-since">
                Partner since: {formatDate(joinDate)}
              </div>
              <div className="vehicle-type">
                {getVehicleIcon()}
                <span>
                  {vehicleType === 'bike' ? 'Motorcycle/Scooter' : 
                   vehicleType === 'bicycle' ? 'Bicycle' : 'Car'}
                </span>
              </div>
            </div>
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          <div className="account-forms">
            <div className="account-form profile-form">
              <h3>Personal Information</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    disabled={!isEditing}
                    required
                    pattern="[0-9]{10}"
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select 
                    value={vehicleType} 
                    onChange={(e) => setVehicleType(e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="bike">Motorcycle/Scooter</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </div>
                
                {isEditing && (
                  <button type="submit" className="save-btn">
                    <FaSave /> Save Changes
                  </button>
                )}
              </form>
            </div>
            
            <div className="account-form password-form">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                </div>
                {passwordError && (
                  <div className="error-message">{passwordError}</div>
                )}
                <button type="submit" className="save-btn">
                  Update Password
                </button>
              </form>
            </div>
          </div>
          
          <div className="account-section documents">
            <h3>Documents</h3>
            <div className="document-list">
              <div className="document-item">
                <FaIdCard size={24} />
                <div className="document-info">
                  <h4>ID Proof</h4>
                  <p>Aadhar Card: XXXX-XXXX-1234</p>
                </div>
                <button className="update-btn">Update</button>
              </div>
              <div className="document-item">
                <FaIdCard size={24} />
                <div className="document-info">
                  <h4>Driving License</h4>
                  <p>License No: DL-1234567890</p>
                </div>
                <button className="update-btn">Update</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAccount;