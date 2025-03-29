import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaMotorcycle, FaCar, FaBicycle, FaIdCard, FaFileAlt, FaUpload, FaCheckCircle, FaTimesCircle, FaRegClock, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { GiSteeringWheel, GiCalendar } from 'react-icons/gi';
import '../styles/DeliveryAccount.css';

const DeliveryAccount = () => {
  // States for profile information
  const [partnerInfo, setPartnerInfo] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    joinedDate: ''
  });

  // Vehicle information state
  const [vehicleInfo, setVehicleInfo] = useState({
    type: 'motorcycle', // motorcycle, car, bicycle
    model: '',
    year: '',
    color: '',
    licensePlate: ''
  });

  // Document state
  const [documents, setDocuments] = useState([
    { 
      id: 'driver_license', 
      name: 'Driver\'s License', 
      status: 'pending',
      uploadDate: '03/20/2025', 
      expiryDate: '03/20/2030',
      file: null
    },
    { 
      id: 'id_proof', 
      name: 'Identity Proof', 
      status: 'verified',
      uploadDate: '03/15/2025', 
      expiryDate: 'N/A',
      file: null
    },
    { 
      id: 'vehicle_registration', 
      name: 'Vehicle Registration', 
      status: 'missing',
      uploadDate: '', 
      expiryDate: '',
      file: null
    }
  ]);

  // UI state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [activeDocumentUpload, setActiveDocumentUpload] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);

  // Effects
  useEffect(() => {
    // Load partner information from localStorage
    const partnerId = localStorage.getItem('partnerId');
    const name = localStorage.getItem('partnerName') || 'Delivery Partner';
    
    // Example of loading data - in a real app, this would come from an API
    setPartnerInfo({
      id: partnerId || 'DP' + Date.now().toString().slice(-8),
      name: name,
      phone: '555-123-4567',
      email: 'partner@example.com',
      address: '123 Main St, Anytown',
      joinedDate: 'March 15, 2025'
    });
    
    // Load saved vehicle info if available
    const savedVehicleInfo = localStorage.getItem('partnerVehicleInfo');
    if (savedVehicleInfo) {
      setVehicleInfo(JSON.parse(savedVehicleInfo));
    }
    
    // Load saved documents if available
    const savedDocuments = localStorage.getItem('partnerDocuments');
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    // Save to localStorage (in real app, send to API)
    localStorage.setItem('partnerName', partnerInfo.name);
    
    // Exit edit mode
    setIsEditingProfile(false);
  };

  // Handle vehicle update
  const handleVehicleUpdate = (e) => {
    e.preventDefault();
    
    // Save to localStorage (in real app, send to API)
    localStorage.setItem('partnerVehicleInfo', JSON.stringify(vehicleInfo));
    
    // Exit edit mode
    setIsEditingVehicle(false);
  };

  // Handle document upload
  const handleDocumentUpload = (documentId) => {
    setActiveDocumentUpload(documentId);
    fileInputRef.current.click();
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (!e.target.files[0] || !activeDocumentUpload) return;
    
    const file = e.target.files[0];
    
    // Update the document with the new file
    const updatedDocuments = documents.map(doc => {
      if (doc.id === activeDocumentUpload) {
        // In a real app, you'd upload this file to a server
        // and get back a URL/confirmation
        return {
          ...doc,
          file: file,
          uploadDate: new Date().toLocaleDateString(),
          status: 'pending'
        };
      }
      return doc;
    });
    
    setDocuments(updatedDocuments);
    localStorage.setItem('partnerDocuments', JSON.stringify(updatedDocuments));
    
    // Reset active document
    setActiveDocumentUpload(null);
  };

  // Get status icon based on document status
  const getStatusIcon = (status) => {
    switch(status) {
      case 'verified':
        return <FaCheckCircle color="#4CAF50" />;
      case 'pending':
        return <FaRegClock color="#FF9800" />;
      case 'missing':
      default:
        return <FaTimesCircle color="#F44336" />;
    }
  };

  // Get vehicle icon based on type
  const getVehicleIcon = (type) => {
    switch(type) {
      case 'car':
        return <FaCar />;
      case 'bicycle':
        return <FaBicycle />;
      case 'motorcycle':
      default:
        return <FaMotorcycle />;
    }
  };

  return (
    <div className="delivery-account-container">
      <div className="account-dashboard">
        <div className="account-content">
          <div className="account-header">
            <h1>My Account</h1>
            {!isEditingProfile && !isEditingVehicle && (
              <div className="account-actions">
                <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
                  <FaEdit /> Edit Profile
                </button>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <div className="edit-profile-form">
              <form onSubmit={handleProfileUpdate}>
                <div className="form-section">
                  <h2>Personal Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input 
                        id="name" 
                        type="text" 
                        value={partnerInfo.name} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, name: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input 
                        id="phone" 
                        type="tel" 
                        value={partnerInfo.phone} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, phone: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input 
                        id="email" 
                        type="email" 
                        value={partnerInfo.email} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input 
                        id="address" 
                        type="text" 
                        value={partnerInfo.address} 
                        onChange={(e) => setPartnerInfo({...partnerInfo, address: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : isEditingVehicle ? (
            <div className="edit-profile-form">
              <form onSubmit={handleVehicleUpdate}>
                <div className="form-section">
                  <div className="vehicle-form-header">
                    <h2>Vehicle Information</h2>
                    <button 
                      type="button" 
                      className="back-btn"
                      onClick={() => setIsEditingVehicle(false)}
                    >
                      <FaArrowLeft /> Back
                    </button>
                  </div>
                  
                  <div className="vehicle-type-selector">
                    <div 
                      className={`vehicle-type-option ${vehicleInfo.type === 'motorcycle' ? 'active' : ''}`}
                      onClick={() => setVehicleInfo({...vehicleInfo, type: 'motorcycle'})}
                    >
                      <FaMotorcycle />
                      <p>Motorcycle</p>
                    </div>
                    <div 
                      className={`vehicle-type-option ${vehicleInfo.type === 'car' ? 'active' : ''}`}
                      onClick={() => setVehicleInfo({...vehicleInfo, type: 'car'})}
                    >
                      <FaCar />
                      <p>Car</p>
                    </div>
                    <div 
                      className={`vehicle-type-option ${vehicleInfo.type === 'bicycle' ? 'active' : ''}`}
                      onClick={() => setVehicleInfo({...vehicleInfo, type: 'bicycle'})}
                    >
                      <FaBicycle />
                      <p>Bicycle</p>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="model">Vehicle Model</label>
                      <input 
                        id="model" 
                        type="text" 
                        value={vehicleInfo.model} 
                        onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="year">Year</label>
                      <input 
                        id="year" 
                        type="text" 
                        value={vehicleInfo.year} 
                        onChange={(e) => setVehicleInfo({...vehicleInfo, year: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="color">Color</label>
                      <input 
                        id="color" 
                        type="text" 
                        value={vehicleInfo.color} 
                        onChange={(e) => setVehicleInfo({...vehicleInfo, color: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="licensePlate">License Plate</label>
                      <input 
                        id="licensePlate" 
                        type="text" 
                        value={vehicleInfo.licensePlate} 
                        onChange={(e) => setVehicleInfo({...vehicleInfo, licensePlate: e.target.value})}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsEditingVehicle(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Save Vehicle Information
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="profile-view">
              <div className="profile-sections">
                {/* Personal Information Section */}
                <div className="profile-card">
                  <h2><FaUser /> Personal Information</h2>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <span className="field-label">Name</span>
                      <div className="field-value">{partnerInfo.name}</div>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Phone</span>
                      <div className="field-value">{partnerInfo.phone}</div>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Email</span>
                      <div className="field-value">{partnerInfo.email}</div>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Address</span>
                      <div className="field-value">{partnerInfo.address}</div>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Partner ID</span>
                      <div className="field-value">{partnerInfo.id}</div>
                    </div>
                    <div className="profile-field">
                      <span className="field-label">Joined Date</span>
                      <div className="field-value">{partnerInfo.joinedDate}</div>
                    </div>
                  </div>
                </div>
                
                {/* Vehicle Information Section */}
                <div className="vehicle-section">
                  <h2>{getVehicleIcon(vehicleInfo.type)} Vehicle Information</h2>
                  
                  <div className="vehicle-info">
                    <div className="vehicle-detail">
                      <span className="vehicle-detail-label">Vehicle Type</span>
                      <span className="vehicle-detail-value">
                        {vehicleInfo.type.charAt(0).toUpperCase() + vehicleInfo.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="vehicle-detail">
                      <span className="vehicle-detail-label">Model</span>
                      <span className="vehicle-detail-value">{vehicleInfo.model || 'Not specified'}</span>
                    </div>
                    
                    <div className="vehicle-detail">
                      <GiCalendar />
                      <span className="vehicle-detail-label">Year</span>
                      <span className="vehicle-detail-value">{vehicleInfo.year || 'Not specified'}</span>
                    </div>
                    
                    <div className="vehicle-detail">
                      <span className="vehicle-detail-label">Color</span>
                      <span className="vehicle-detail-value">{vehicleInfo.color || 'Not specified'}</span>
                    </div>
                    
                    <div className="vehicle-detail">
                      <GiSteeringWheel />
                      <span className="vehicle-detail-label">License Plate</span>
                      <span className="vehicle-detail-value">{vehicleInfo.licensePlate || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <div className="vehicle-actions">
                    <button className="update-vehicle-btn" onClick={() => setIsEditingVehicle(true)}>
                      <FaEdit /> Update Vehicle Information
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="documents-section">
                <h2><FaIdCard /> Documents & Verification</h2>
                <p>These documents are required for verification purposes. Please upload clear and valid documents.</p>
                
                <div className="documents-grid">
                  {documents.map(doc => (
                    <div key={doc.id} className="document-card">
                      <div className={`document-icon ${doc.status === 'pending' ? 'document-pending' : doc.status === 'missing' ? 'document-missing' : ''}`}>
                        {doc.id === 'driver_license' ? <FaIdCard /> : doc.id === 'vehicle_registration' ? <FaCar /> : <FaFileAlt />}
                      </div>
                      <div className="document-details">
                        <h3>{doc.name}</h3>
                        
                        {doc.status !== 'missing' && (
                          <p>Uploaded: {doc.uploadDate}</p>
                        )}
                        
                        {doc.expiryDate && doc.status !== 'missing' && (
                          <p>Expires: {doc.expiryDate}</p>
                        )}
                        
                        <div className={`verification-status status-${doc.status}`}>
                          {getStatusIcon(doc.status)}
                          <span>
                            {doc.status === 'verified' ? 'Verified' : 
                             doc.status === 'pending' ? 'Pending Verification' : 
                             'Missing Document'}
                          </span>
                        </div>
                        
                        <div className="document-update">
                          <button 
                            className="update-document-btn"
                            onClick={() => handleDocumentUpload(doc.id)}
                          >
                            <FaUpload /> {doc.status === 'missing' ? 'Upload' : 'Update'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Hidden file input for document uploads */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                
                <div className="document-upload" onClick={() => fileInputRef.current.click()}>
                  <FaUpload />
                  <h3>Upload Additional Documents</h3>
                  <p>Click or drop files here to upload</p>
                  <p className="upload-hint">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default DeliveryAccount;