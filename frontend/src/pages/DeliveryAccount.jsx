import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaMotorcycle, FaWallet, FaClipboardList, FaChartLine, 
  FaSignOutAlt, FaUser, FaIdCard, FaFileAlt, FaCamera,
  FaArrowLeft, FaEdit, FaCheck, FaCar, FaBicycle, FaUpload,
  FaCalendarAlt, FaClock, FaSave, FaTimes, FaPen, FaPaperclip,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaBirthdayCake
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
  
  // Track which fields are currently being edited
  const [editableFields, setEditableFields] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
    emergencyContact: false,
    dateOfBirth: false,
    vehicle: {
      type: false,
      make: false,
      model: false,
      year: false,
      licensePlate: false,
      color: false
    }
  });
  
  // Temporary value for the field being edited
  const [editValue, setEditValue] = useState({
    vehicle: {}
  });
  
  // Refs for file inputs
  const fileInputRefs = useRef({});
  
  // Selected files for documents
  const [selectedFiles, setSelectedFiles] = useState({});
  
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
    
    // Get email and phone from registration data
    const email = localStorage.getItem('partnerEmail') || '';
    const phone = localStorage.getItem('partnerPhone') || '';
    const joiningDate = localStorage.getItem('partnerJoiningDate') || new Date().toISOString().split('T')[0];
    
    // Update partner data with registration information
    const updatedPartnerData = {
      ...partnerData,
      name: name,
      email: email,
      phone: phone,
      joiningDate: joiningDate
    };
    
    setPartnerData(updatedPartnerData);
    
    // Initialize edit values
    setEditValue({
      name: name,
      email: email,
      phone: phone,
      address: updatedPartnerData.address,
      emergencyContact: updatedPartnerData.emergencyContact,
      dateOfBirth: updatedPartnerData.dateOfBirth,
      vehicle: { ...updatedPartnerData.vehicle }
    });
    
    // In a real app, you would fetch the partner data from your API
    // Example: fetchPartnerData(id).then(data => {
    //   setPartnerData(data);
    // });
    
  }, [navigate]);
  
  const handleEditField = (field) => {
    const newEditableFields = { ...editableFields };
    
    if (field.includes('.')) {
      // For nested fields (like vehicle.make)
      const [parent, child] = field.split('.');
      newEditableFields[parent] = {
        ...newEditableFields[parent],
        [child]: true
      };
    } else {
      newEditableFields[field] = true;
    }
    
    setEditableFields(newEditableFields);
  };
  
  const handleSaveField = (field) => {
    if (field.includes('.')) {
      // For nested fields (like vehicle.make)
      const [parent, child] = field.split('.');
      
      setPartnerData({
        ...partnerData,
        [parent]: {
          ...partnerData[parent],
          [child]: editValue.vehicle[child]
        }
      });
      
      // Save to localStorage for demonstration purposes
      if (parent === 'vehicle') {
        localStorage.setItem(`partner${parent}${child}`, editValue.vehicle[child]);
      }
    } else {
      setPartnerData({
        ...partnerData,
        [field]: editValue[field]
      });
      
      // Save to localStorage for demonstration purposes
      localStorage.setItem(`partner${field.charAt(0).toUpperCase() + field.slice(1)}`, editValue[field]);
    }
    
    handleCancelEdit(field); // This will set editing mode to false
  };
  
  const handleCancelEdit = (field) => {
    const newEditableFields = { ...editableFields };
    
    if (field.includes('.')) {
      // For nested fields (like vehicle.make)
      const [parent, child] = field.split('.');
      newEditableFields[parent] = {
        ...newEditableFields[parent],
        [child]: false
      };
    } else {
      newEditableFields[field] = false;
    }
    
    setEditableFields(newEditableFields);
  };
  
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // For nested fields (like vehicle.make)
      const [parent, child] = field.split('.');
      
      setEditValue({
        ...editValue,
        [parent]: {
          ...editValue[parent],
          [child]: value
        }
      });
    } else {
      setEditValue({
        ...editValue,
        [field]: value
      });
    }
  };
  
  const handleVehicleTypeChange = (type) => {
    setEditValue({
      ...editValue,
      vehicle: {
        ...editValue.vehicle,
        type
      }
    });
    
    // Save immediately since it's a selection, not a text input
    setPartnerData({
      ...partnerData,
      vehicle: {
        ...partnerData.vehicle,
        type
      }
    });
  };
  
  const handleFileChange = (docId, file) => {
    setSelectedFiles({
      ...selectedFiles,
      [docId]: file
    });
  };
  
  const handleUploadFile = (docId) => {
    const file = selectedFiles[docId];
    if (file) {
      // In a real app, you would upload the file to your server
      // Example: uploadDocument(docId, file).then(() => {
      //   fetchPartnerData(partnerId).then(data => {
      //     setPartnerData(data);
      //   });
      // });
      
      // For demo purposes, update the document status
      const updatedDocuments = partnerData.documents.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: 'pending',
            uploadedDate: new Date().toISOString().split('T')[0]
          };
        }
        return doc;
      });
      
      setPartnerData({
        ...partnerData,
        documents: updatedDocuments
      });
      
      // Clear the selected file
      setSelectedFiles({
        ...selectedFiles,
        [docId]: null
      });
      
      alert(`Document "${file.name}" uploaded successfully and pending verification.`);
    }
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
        </div>
        
        <div className="profile-view">
          <div className="profile-card">
            <h2>
              <FaUser /> Partner Information
              <span className="section-note">Click the edit icon next to any field to update</span>
            </h2>
            <div className="profile-grid">
              <div className="profile-field">
                <span className="field-label">Partner ID</span>
                <span className="field-value">{partnerId}</span>
              </div>
              
              <div className="profile-field">
                <span className="field-label">Full Name</span>
                {editableFields.name ? (
                  <div className="editable-field">
                    <input
                      type="text"
                      value={editValue.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button className="save-btn" onClick={() => handleSaveField('name')} title="Save"><FaSave /></button>
                      <button className="cancel-btn" onClick={() => handleCancelEdit('name')} title="Cancel"><FaTimes /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="field-value">{partnerData.name || partnerName}</span>
                    <button className="edit-btn" onClick={() => handleEditField('name')} title="Edit name"><FaPen /></button>
                  </>
                )}
              </div>
              
              <div className="profile-field">
                <span className="field-label">Email <span className="registration-badge">Registration</span></span>
                {editableFields.email ? (
                  <div className="editable-field">
                    <input
                      type="email"
                      value={editValue.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button className="save-btn" onClick={() => handleSaveField('email')} title="Save"><FaSave /></button>
                      <button className="cancel-btn" onClick={() => handleCancelEdit('email')} title="Cancel"><FaTimes /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="field-value">{partnerData.email || 'Not provided'}</span>
                    <button className="edit-btn" onClick={() => handleEditField('email')} title="Edit email"><FaPen /></button>
                  </>
                )}
              </div>
              
              <div className="profile-field">
                <span className="field-label">Phone <span className="registration-badge">Registration</span></span>
                {editableFields.phone ? (
                  <div className="editable-field">
                    <input
                      type="tel"
                      value={editValue.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button className="save-btn" onClick={() => handleSaveField('phone')} title="Save"><FaSave /></button>
                      <button className="cancel-btn" onClick={() => handleCancelEdit('phone')} title="Cancel"><FaTimes /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="field-value">{partnerData.phone || 'Not provided'}</span>
                    <button className="edit-btn" onClick={() => handleEditField('phone')} title="Edit phone"><FaPen /></button>
                  </>
                )}
              </div>
              
              <div className="profile-field">
                <span className="field-label">Address</span>
                {editableFields.address ? (
                  <div className="editable-field">
                    <textarea
                      value={editValue.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      autoFocus
                    ></textarea>
                    <div className="edit-buttons">
                      <button className="save-btn" onClick={() => handleSaveField('address')} title="Save"><FaSave /></button>
                      <button className="cancel-btn" onClick={() => handleCancelEdit('address')} title="Cancel"><FaTimes /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="field-value">{partnerData.address || 'Not provided'}</span>
                    <button className="edit-btn" onClick={() => handleEditField('address')} title="Edit address"><FaPen /></button>
                  </>
                )}
              </div>
              
              <div className="profile-field">
                <span className="field-label">Emergency Contact</span>
                {editableFields.emergencyContact ? (
                  <div className="editable-field">
                    <input
                      type="tel"
                      value={editValue.emergencyContact || ''}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button className="save-btn" onClick={() => handleSaveField('emergencyContact')} title="Save"><FaSave /></button>
                      <button className="cancel-btn" onClick={() => handleCancelEdit('emergencyContact')} title="Cancel"><FaTimes /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="field-value">{partnerData.emergencyContact || 'Not provided'}</span>
                    <button className="edit-btn" onClick={() => handleEditField('emergencyContact')} title="Edit emergency contact"><FaPen /></button>
                  </>
                )}
              </div>
              
              <div className="profile-field">
                <span className="field-label">Date of Birth</span>
                {editableFields.dateOfBirth ? (
                  <div className="editable-field">
                    <input
                      type="date"
                      value={editValue.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button className="save-btn" onClick={() => handleSaveField('dateOfBirth')} title="Save"><FaSave /></button>
                      <button className="cancel-btn" onClick={() => handleCancelEdit('dateOfBirth')} title="Cancel"><FaTimes /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="field-value">{partnerData.dateOfBirth || 'Not provided'}</span>
                    <button className="edit-btn" onClick={() => handleEditField('dateOfBirth')} title="Edit date of birth"><FaPen /></button>
                  </>
                )}
              </div>
              
              <div className="profile-field">
                <span className="field-label">Rating</span>
                <span className="field-value">{partnerData.rating} ★</span>
              </div>
              
              <div className="profile-field">
                <span className="field-label">Total Deliveries</span>
                <span className="field-value">{partnerData.totalDeliveries}</span>
              </div>

              <div className="profile-field">
                <span className="field-label">Partner Since</span>
                <span className="field-value">
                  {partnerData.joiningDate ? new Date(partnerData.joiningDate).toLocaleDateString() : 'Not available'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="profile-sections">
            <div className="vehicle-section">
              <h2>
                <FaMotorcycle /> Vehicle Information
                <span className="section-note">Click the edit icon next to any field to update</span>
              </h2>
              
              <div className="vehicle-type-selector">
                <div 
                  className={`vehicle-type-option ${partnerData.vehicle?.type === 'motorcycle' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('motorcycle')}
                >
                  <FaMotorcycle />
                  <p>Motorcycle</p>
                </div>
                
                <div 
                  className={`vehicle-type-option ${partnerData.vehicle?.type === 'scooter' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('scooter')}
                >
                  <FaMotorcycle />
                  <p>Scooter</p>
                </div>
                
                <div 
                  className={`vehicle-type-option ${partnerData.vehicle?.type === 'bicycle' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('bicycle')}
                >
                  <FaBicycle />
                  <p>Bicycle</p>
                </div>
                
                <div 
                  className={`vehicle-type-option ${partnerData.vehicle?.type === 'car' ? 'active' : ''}`}
                  onClick={() => handleVehicleTypeChange('car')}
                >
                  <FaCar />
                  <p>Car</p>
                </div>
              </div>
              
              <div className="vehicle-info">
                <div className="vehicle-detail">
                  <FaCar />
                  <span className="vehicle-detail-label">Make</span>
                  {editableFields.vehicle?.make ? (
                    <div className="editable-field">
                      <input
                        type="text"
                        value={editValue.vehicle?.make || ''}
                        onChange={(e) => handleInputChange('vehicle.make', e.target.value)}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button className="save-btn" onClick={() => handleSaveField('vehicle.make')} title="Save"><FaSave /></button>
                        <button className="cancel-btn" onClick={() => handleCancelEdit('vehicle.make')} title="Cancel"><FaTimes /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="vehicle-detail-value">{partnerData.vehicle?.make || 'Not specified'}</span>
                      <button className="edit-btn" onClick={() => handleEditField('vehicle.make')} title="Edit make"><FaPen /></button>
                    </>
                  )}
                </div>
                
                <div className="vehicle-detail">
                  <FaCar />
                  <span className="vehicle-detail-label">Model</span>
                  {editableFields.vehicle?.model ? (
                    <div className="editable-field">
                      <input
                        type="text"
                        value={editValue.vehicle?.model || ''}
                        onChange={(e) => handleInputChange('vehicle.model', e.target.value)}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button className="save-btn" onClick={() => handleSaveField('vehicle.model')} title="Save"><FaSave /></button>
                        <button className="cancel-btn" onClick={() => handleCancelEdit('vehicle.model')} title="Cancel"><FaTimes /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="vehicle-detail-value">{partnerData.vehicle?.model || 'Not specified'}</span>
                      <button className="edit-btn" onClick={() => handleEditField('vehicle.model')} title="Edit model"><FaPen /></button>
                    </>
                  )}
                </div>
                
                <div className="vehicle-detail">
                  <FaIdCard />
                  <span className="vehicle-detail-label">License Plate</span>
                  {editableFields.vehicle?.licensePlate ? (
                    <div className="editable-field">
                      <input
                        type="text"
                        value={editValue.vehicle?.licensePlate || ''}
                        onChange={(e) => handleInputChange('vehicle.licensePlate', e.target.value)}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button className="save-btn" onClick={() => handleSaveField('vehicle.licensePlate')} title="Save"><FaSave /></button>
                        <button className="cancel-btn" onClick={() => handleCancelEdit('vehicle.licensePlate')} title="Cancel"><FaTimes /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="vehicle-detail-value">{partnerData.vehicle?.licensePlate || 'Not specified'}</span>
                      <button className="edit-btn" onClick={() => handleEditField('vehicle.licensePlate')} title="Edit license plate"><FaPen /></button>
                    </>
                  )}
                </div>
                
                <div className="vehicle-detail">
                  <FaMotorcycle />
                  <span className="vehicle-detail-label">Color</span>
                  {editableFields.vehicle?.color ? (
                    <div className="editable-field">
                      <input
                        type="text"
                        value={editValue.vehicle?.color || ''}
                        onChange={(e) => handleInputChange('vehicle.color', e.target.value)}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button className="save-btn" onClick={() => handleSaveField('vehicle.color')} title="Save"><FaSave /></button>
                        <button className="cancel-btn" onClick={() => handleCancelEdit('vehicle.color')} title="Cancel"><FaTimes /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="vehicle-detail-value">{partnerData.vehicle?.color || 'Not specified'}</span>
                      <button className="edit-btn" onClick={() => handleEditField('vehicle.color')} title="Edit color"><FaPen /></button>
                    </>
                  )}
                </div>
                
                <div className="vehicle-detail">
                  <FaCalendarAlt />
                  <span className="vehicle-detail-label">Year</span>
                  {editableFields.vehicle?.year ? (
                    <div className="editable-field">
                      <input
                        type="text"
                        value={editValue.vehicle?.year || ''}
                        onChange={(e) => handleInputChange('vehicle.year', e.target.value)}
                        autoFocus
                      />
                      <div className="edit-buttons">
                        <button className="save-btn" onClick={() => handleSaveField('vehicle.year')} title="Save"><FaSave /></button>
                        <button className="cancel-btn" onClick={() => handleCancelEdit('vehicle.year')} title="Cancel"><FaTimes /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="vehicle-detail-value">{partnerData.vehicle?.year || 'Not specified'}</span>
                      <button className="edit-btn" onClick={() => handleEditField('vehicle.year')} title="Edit year"><FaPen /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="documents-section">
              <h2>
                <FaFileAlt /> Document Verification
                <span className="section-note">Upload required documents for verification</span>
              </h2>
              <div className="documents-grid">
                {partnerData.documents.map(doc => (
                  <div className="document-card" key={doc.id}>
                    <div className={`document-icon ${
                      doc.status === 'verified' ? 'document-verified' : 
                      doc.status === 'pending' ? 'document-pending' : 
                      'document-missing'
                    }`}>
                      <FaIdCard />
                    </div>
                    <div className="document-details">
                      <h3>{doc.name}</h3>
                      <p>{doc.uploadedDate ? `Uploaded on ${new Date(doc.uploadedDate).toLocaleDateString()}` : 'Not uploaded yet'}</p>
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
                      
                      {/* Show upload option for missing documents or if user wants to update a pending document */}
                      {(doc.status === 'missing' || doc.status === 'pending') && (
                        <div className="document-upload">
                          <div className="file-input-wrapper">
                            <input
                              type="file"
                              id={`file-${doc.id}`}
                              onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                              className="file-input"
                            />
                            <label htmlFor={`file-${doc.id}`} className="file-label">
                              <FaPaperclip /> {selectedFiles[doc.id]?.name || 'Choose file'}
                            </label>
                          </div>
                          <button 
                            onClick={() => handleUploadFile(doc.id)}
                            disabled={!selectedFiles[doc.id]}
                            className="upload-btn"
                          >
                            <FaUpload /> Upload
                          </button>
                        </div>
                      )}
                      
                      {/* Show option to replace verified document */}
                      {doc.status === 'verified' && (
                        <div className="document-actions">
                          <button className="replace-btn" onClick={() => fileInputRefs.current[doc.id]?.click()}>
                            <FaEdit /> Replace Document
                          </button>
                          <input
                            type="file"
                            ref={(ref) => fileInputRefs.current[doc.id] = ref}
                            onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryAccount;