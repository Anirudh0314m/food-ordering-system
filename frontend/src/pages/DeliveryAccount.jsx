import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaMotorcycle, FaWallet, FaClipboardList, FaChartLine, 
  FaSignOutAlt, FaUser, FaIdCard, FaFileAlt, FaCamera,
  FaArrowLeft, FaEdit, FaCheck, FaCar, FaBicycle, FaUpload,
  FaCalendarAlt,FaClock
} from 'react-icons/fa';
import '../styles/DeliveryAccount.css';

const DeliveryAccount = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [partnerData, setPartnerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    dateOfBirth: '',
    joiningDate: '',
    rating: 4.8,
    totalDeliveries: 0,
    vehicle: {
      type: 'motorcycle',
      make: 'Honda',
      model: 'Activa',
      year: '2020',
      licensePlate: 'KA-01-AB-1234',
      color: 'Black'
    },
    documents: [
      { 
        id: 1, 
        type: 'id_proof', 
        name: 'ID Card', 
        status: 'verified', 
        expiryDate: '2025-12-31',
        uploadedDate: '2023-05-15' 
      },
      { 
        id: 2, 
        type: 'license', 
        name: 'Driving License', 
        status: 'verified', 
        expiryDate: '2026-08-15',
        uploadedDate: '2023-05-15' 
      },
      { 
        id: 3, 
        type: 'vehicle_rc', 
        name: 'Vehicle Registration', 
        status: 'pending', 
        expiryDate: '2030-01-01',
        uploadedDate: '2023-05-16' 
      },
      { 
        id: 4, 
        type: 'insurance', 
        name: 'Vehicle Insurance', 
        status: 'missing', 
        expiryDate: '',
        uploadedDate: '' 
      }
    ]
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...partnerData});
  
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
    
    // Get partner ID
    const id = localStorage.getItem('partnerId') || '12345';
    setPartnerId(id);
    
    // In a real app, you would fetch the partner data from your API
    // For now, using the mock data from state
    // Example: fetchPartnerData(id);
    
    // Update formData with the loaded partnerData
    setFormData({...partnerData});
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const vehicleField = name.split('.')[1];
      setFormData({
        ...formData,
        vehicle: {
          ...formData.vehicle,
          [vehicleField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleVehicleTypeChange = (type) => {
    setFormData({
      ...formData,
      vehicle: {
        ...formData.vehicle,
        type
      }
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your API
    // Example: updatePartnerData(partnerId, formData);
    
    // Update the partner data in state
    setPartnerData(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="delivery-account-container">
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
          <Link to="/delivery/earnings" className="nav-item">
            <FaWallet /> Earnings
          </Link>
          <Link to="/delivery/account" className="nav-item active">
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
      <main className="account-content">
        <div className="account-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/delivery/dashboard')}
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h1>My Account</h1>
          </div>
          
          {!isEditing && (
            <div className="account-actions">
              <button 
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <form className="edit-profile-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your full address"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact number"
                />
              </div>
            </div>
            
            <div className="form-section">
              <h2>Vehicle Information</h2>
              <div className="vehicle-type-selector">
                <div 
                  className={`vehicle-type-option ${formData.vehicle.type === 'motorcycle' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('motorcycle')}
                >
                  <FaMotorcycle />
                  <p>Motorcycle</p>
                </div>
                
                <div 
                  className={`vehicle-type-option ${formData.vehicle.type === 'scooter' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('scooter')}
                >
                  <FaMotorcycle />
                  <p>Scooter</p>
                </div>
                
                <div 
                  className={`vehicle-type-option ${formData.vehicle.type === 'bicycle' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('bicycle')}
                >
                  <FaBicycle />
                  <p>Bicycle</p>
                </div>
                
                <div 
                  className={`vehicle-type-option ${formData.vehicle.type === 'car' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('car')}
                >
                  <FaCar />
                  <p>Car</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Make</label>
                  <input
                    type="text"
                    name="vehicle.make"
                    value={formData.vehicle.make}
                    onChange={handleInputChange}
                    placeholder="e.g. Honda"
                  />
                </div>
                
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="vehicle.model"
                    value={formData.vehicle.model}
                    onChange={handleInputChange}
                    placeholder="e.g. Activa"
                  />
                </div>
                
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="text"
                    name="vehicle.year"
                    value={formData.vehicle.year}
                    onChange={handleInputChange}
                    placeholder="e.g. 2020"
                  />
                </div>
                
                <div className="form-group">
                  <label>License Plate</label>
                  <input
                    type="text"
                    name="vehicle.licensePlate"
                    value={formData.vehicle.licensePlate}
                    onChange={handleInputChange}
                    placeholder="e.g. KA-01-AB-1234"
                  />
                </div>
                
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="vehicle.color"
                    value={formData.vehicle.color}
                    onChange={handleInputChange}
                    placeholder="e.g. Black"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({...partnerData});
                }}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <div className="profile-card">
              <h2>
                <FaUser /> Partner Information
              </h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <span className="field-label">Partner ID</span>
                  <span className="field-value">{partnerId}</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Full Name</span>
                  <span className="field-value">{partnerData.name || partnerName}</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Email</span>
                  <span className="field-value">{partnerData.email || 'Not provided'}</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Phone</span>
                  <span className="field-value">{partnerData.phone || 'Not provided'}</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Rating</span>
                  <span className="field-value">{partnerData.rating} ★</span>
                </div>
                
                <div className="profile-field">
                  <span className="field-label">Total Deliveries</span>
                  <span className="field-value">{partnerData.totalDeliveries}</span>
                </div>
              </div>
              
              {partnerData.address && (
                <div className="profile-field">
                  <span className="field-label">Address</span>
                  <span className="field-value">{partnerData.address}</span>
                </div>
              )}
              
              {partnerData.emergencyContact && (
                <div className="profile-field">
                  <span className="field-label">Emergency Contact</span>
                  <span className="field-value">{partnerData.emergencyContact}</span>
                </div>
              )}
              
              {partnerData.dateOfBirth && (
                <div className="profile-field">
                  <span className="field-label">Date of Birth</span>
                  <span className="field-value">{partnerData.dateOfBirth}</span>
                </div>
              )}
            </div>
            
            <div className="profile-sections">
              <div className="vehicle-section">
                <h2>
                  <FaMotorcycle /> Vehicle Information
                </h2>
                <div className="vehicle-info">
                  <div className="vehicle-detail">
                    <FaMotorcycle />
                    <span className="vehicle-detail-label">Type</span>
                    <span className="vehicle-detail-value">
                      {partnerData.vehicle?.type?.charAt(0).toUpperCase() + partnerData.vehicle?.type?.slice(1) || 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="vehicle-detail">
                    <FaCar />
                    <span className="vehicle-detail-label">Make & Model</span>
                    <span className="vehicle-detail-value">
                      {partnerData.vehicle?.make} {partnerData.vehicle?.model}
                    </span>
                  </div>
                  
                  <div className="vehicle-detail">
                    <FaIdCard />
                    <span className="vehicle-detail-label">License Plate</span>
                    <span className="vehicle-detail-value">
                      {partnerData.vehicle?.licensePlate}
                    </span>
                  </div>
                  
                  <div className="vehicle-detail">
                    <FaCar />
                    <span className="vehicle-detail-label">Color</span>
                    <span className="vehicle-detail-value">
                      {partnerData.vehicle?.color}
                    </span>
                  </div>
                  
                  <div className="vehicle-detail">
                    <FaCalendarAlt />
                    <span className="vehicle-detail-label">Year</span>
                    <span className="vehicle-detail-value">
                      {partnerData.vehicle?.year}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="documents-section">
                <h2>
                  <FaFileAlt /> Document Verification
                </h2>
                <div className="documents-grid">
                  {partnerData.documents.map(doc => (
                    <div className="document-card" key={doc.id}>
                      <div className={`document-icon ${
                        doc.status === 'verified' ? '' : 
                        doc.status === 'pending' ? 'document-pending' : 
                        'document-missing'
                      }`}>
                        <FaIdCard />
                      </div>
                      <div className="document-details">
                        <h3>{doc.name}</h3>
                        <p>{doc.uploadedDate ? `Uploaded on ${new Date(doc.uploadedDate).toLocaleDateString()}` : 'Not uploaded'}</p>
                        <div className={`verification-status status-${doc.status}`}>
                          {doc.status === 'verified' ? (
                            <>
                              <FaCheck /> Verified
                            </>
                          ) : doc.status === 'pending' ? (
                            <>
                              <FaClock /> Pending Verification
                            </>
                          ) : (
                            <>
                              <FaUpload /> Upload Required
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryAccount;