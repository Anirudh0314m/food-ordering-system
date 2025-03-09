// src/components/AddressPanel.js

import React, { useState, useEffect } from 'react';
import { FaTimes, FaHome, FaBriefcase, FaMapMarkerAlt, FaSave, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import './AddressPanel.css'; // We'll create this next

const AddressPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [addresses, setAddresses] = useState({
    home: { label: 'Home', address: '', landmark: '' },
    work: { label: 'Work', address: '', landmark: '' },
    other: { label: 'Other', address: '', landmark: '' }
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Load addresses when panel opens
  useEffect(() => {
    if (isOpen) {
      const savedAddresses = localStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    }
  }, [isOpen]);
  
  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    setAddresses(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value
      }
    }));
  };
  
  const toggleEdit = () => {
    setEditing(!editing);
  };
  
  const saveAddresses = () => {
    setLoading(true);
    
    try {
      // Validate address for current tab
      if (!addresses[activeTab].address.trim()) {
        setMessage('Please enter an address');
        setLoading(false);
        return;
      }
      
      // Save addresses to localStorage
      localStorage.setItem('userAddresses', JSON.stringify(addresses));
      
      // If editing, exit edit mode
      if (editing) {
        setEditing(false);
      }
      
      setMessage('Address saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving addresses:', error);
      setMessage('Error saving address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const clearAddress = (type) => {
    setAddresses(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        address: '',
        landmark: ''
      }
    }));
    
    // Update in localStorage
    const updatedAddresses = {
      ...addresses,
      [type]: {
        ...addresses[type],
        address: '',
        landmark: ''
      }
    };
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
    
    setMessage(`${addresses[type].label} address cleared!`);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const tabIcon = (type) => {
    switch(type) {
      case 'home': return <FaHome />;
      case 'work': return <FaBriefcase />;
      case 'other': return <FaMapMarkerAlt />;
      default: return <FaMapMarkerAlt />;
    }
  };
  
  return (
    <>
      {isOpen && <div className="address-overlay" onClick={onClose} />}
      
      <div className={`address-panel ${isOpen ? 'open' : ''}`}>
        <div className="address-panel-header">
          <h3>Manage Addresses</h3>
          <button className="close-panel" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="address-panel-content">
          {message && (
            <div className={`address-message ${message.includes('Error') || message.includes('Please enter') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          
          <div className="address-tabs">
            {Object.keys(addresses).map(type => (
              <div 
                key={type}
                className={`address-tab ${activeTab === type ? 'active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                <div className="address-tab-icon">{tabIcon(type)}</div>
                <span>{addresses[type].label}</span>
              </div>
            ))}
          </div>
          
          <div className="address-form">
            {addresses[activeTab].address ? (
              <>
                {!editing ? (
                  <div className="saved-address">
                    <div className="saved-address-header">
                      <h4>
                        {tabIcon(activeTab)}
                        {addresses[activeTab].label}
                      </h4>
                      <div className="saved-address-actions">
                        <button className="edit-address-btn" onClick={toggleEdit}>
                          <FaEdit />
                        </button>
                        <button className="delete-address-btn" onClick={() => clearAddress(activeTab)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="address-text">{addresses[activeTab].address}</p>
                    {addresses[activeTab].landmark && (
                      <p className="landmark-text">Landmark: {addresses[activeTab].landmark}</p>
                    )}
                  </div>
                ) : (
                  <div className="address-edit-form">
                    <div className="address-form-group">
                      <div className="address-input-icon">
                        <FaMapMarkerAlt />
                      </div>
                      <textarea
                        name="address"
                        placeholder={`Enter ${addresses[activeTab].label} Address`}
                        value={addresses[activeTab].address}
                        onChange={(e) => handleInputChange(e, activeTab)}
                        className="address-textarea"
                        rows="3"
                      />
                    </div>
                    
                    <div className="address-form-group">
                      <div className="address-input-icon">
                        <FaMapMarkerAlt />
                      </div>
                      <input
                        type="text"
                        name="landmark"
                        placeholder="Landmark / Door / Floor (Optional)"
                        value={addresses[activeTab].landmark}
                        onChange={(e) => handleInputChange(e, activeTab)}
                        className="address-input"
                      />
                    </div>
                    
                    <div className="address-actions">
                      <button
                        className="cancel-edit-btn"
                        onClick={toggleEdit}
                      >
                        Cancel
                      </button>
                      <button 
                        className="save-address-btn" 
                        onClick={saveAddresses}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (
                          <>
                            <FaSave /> Save Address
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="add-new-address">
                <div className="address-form-group">
                  <div className="address-input-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <textarea
                    name="address"
                    placeholder={`Enter ${addresses[activeTab].label} Address`}
                    value={addresses[activeTab].address}
                    onChange={(e) => handleInputChange(e, activeTab)}
                    className="address-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="address-form-group">
                  <div className="address-input-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Landmark / Door / Floor (Optional)"
                    value={addresses[activeTab].landmark}
                    onChange={(e) => handleInputChange(e, activeTab)}
                    className="address-input"
                  />
                </div>
                
                <div className="address-actions">
                  <button 
                    className="save-address-btn" 
                    onClick={saveAddresses}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <FaPlus /> Add Address
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressPanel;