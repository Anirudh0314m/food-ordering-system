import React, { useState, useEffect } from 'react';
import { FaTimes, FaHome, FaBriefcase, FaMapMarkerAlt, FaSave, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import './AddressPanel.css';

const AddressPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingAddress, setEditingAddress] = useState({
    _id: '',
    type: 'home',
    formattedAddress: '',
    additionalDetails: {
      landmark: '',
      flatNumber: '',
      buildingName: ''
    }
  });
  
  // Load addresses from API when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);
  
  // Filter addresses based on active tab
  useEffect(() => {
    if (addresses.length > 0) {
      setFilteredAddresses(addresses.filter(addr => addr.type === activeTab));
    }
  }, [activeTab, addresses]);
  
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('Please log in to manage addresses');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/user/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setAddresses(response.data);
        // Set active tab based on what addresses exist
        const types = ['home', 'work', 'other'];
        for (const type of types) {
          if (response.data.some(addr => addr.type === type)) {
            setActiveTab(type);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setMessage('Error loading addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'landmark' || name === 'flatNumber' || name === 'buildingName') {
      setEditingAddress(prev => ({
        ...prev,
        additionalDetails: {
          ...prev.additionalDetails,
          [name]: value
        }
      }));
    } else {
      setEditingAddress(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const startEditing = (address) => {
    setEditingAddress(address);
    setEditing(true);
  };
  
  const cancelEditing = () => {
    setEditing(false);
    setEditingAddress({
      _id: '',
      type: activeTab,
      formattedAddress: '',
      additionalDetails: {
        landmark: '',
        flatNumber: '',
        buildingName: ''
      }
    });
  };
  
  const saveAddress = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage('Please log in to save addresses');
        setLoading(false);
        return;
      }
      
      // Validate address
      if (!editingAddress.formattedAddress.trim()) {
        setMessage('Please enter an address');
        setLoading(false);
        return;
      }
      
      let response;
      if (editing && editingAddress._id) {
        // Update existing address
        response = await axios.put(
          `http://localhost:5000/api/user/addresses/${editingAddress._id}`,
          editingAddress,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update addresses list
        setAddresses(prev => prev.map(addr => 
          addr._id === editingAddress._id ? response.data : addr
        ));
      } else {
        // Create new address
        response = await axios.post(
          'http://localhost:5000/api/user/addresses',
          {
            ...editingAddress,
            type: activeTab
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Add new address to list
        setAddresses(prev => [...prev, response.data]);
      }
      
      // Reset form
      cancelEditing();
      setMessage('Address saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage('Error saving address. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setMessage('Please log in to manage addresses');
          setLoading(false);
          return;
        }
        
        await axios.delete(
          `http://localhost:5000/api/user/addresses/${addressId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Remove address from list
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        setMessage('Address deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting address:', error);
        setMessage('Error deleting address. Please try again.');
      } finally {
        setLoading(false);
      }
    }
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
            <div className={`address-message ${message.includes('Error') || message.includes('Please') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          
          <div className="address-tabs">
            {['home', 'work', 'other'].map(type => (
              <div 
                key={type}
                className={`address-tab ${activeTab === type ? 'active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                <div className="address-tab-icon">{tabIcon(type)}</div>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            ))}
          </div>
          
          <div className="address-form">
            {loading && <div className="loading-spinner">Loading...</div>}
            
            {!loading && filteredAddresses.length === 0 && !editing && (
              <div className="no-addresses">
                <p>No {activeTab} address saved yet.</p>
                <button 
                  className="add-new-address-btn"
                  onClick={() => {
                    setEditingAddress({
                      _id: '',
                      type: activeTab,
                      formattedAddress: '',
                      additionalDetails: {
                        landmark: '',
                        flatNumber: '',
                        buildingName: ''
                      }
                    });
                    setEditing(true);
                  }}
                >
                  <FaPlus /> Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Address
                </button>
              </div>
            )}
            
            {!loading && filteredAddresses.length > 0 && !editing && (
              <div className="saved-addresses">
                {filteredAddresses.map(address => (
                  <div key={address._id} className="saved-address-item">
                    <div className="saved-address-header">
                      <h4>
                        {tabIcon(address.type)}
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                      </h4>
                      <div className="saved-address-actions">
                        <button className="edit-address-btn" onClick={() => startEditing(address)}>
                          <FaEdit />
                        </button>
                        <button className="delete-address-btn" onClick={() => deleteAddress(address._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="address-text">{address.formattedAddress}</p>
                    {address.additionalDetails?.landmark && (
                      <p className="landmark-text">Landmark: {address.additionalDetails.landmark}</p>
                    )}
                    {address.additionalDetails?.flatNumber && (
                      <p className="flat-text">Flat/Door No: {address.additionalDetails.flatNumber}</p>
                    )}
                    {address.additionalDetails?.buildingName && (
                      <p className="building-text">Building: {address.additionalDetails.buildingName}</p>
                    )}
                  </div>
                ))}
                
                <button 
                  className="add-another-address-btn"
                  onClick={() => {
                    setEditingAddress({
                      _id: '',
                      type: activeTab,
                      formattedAddress: '',
                      additionalDetails: {
                        landmark: '',
                        flatNumber: '',
                        buildingName: ''
                      }
                    });
                    setEditing(true);
                  }}
                >
                  <FaPlus /> Add Another {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Address
                </button>
              </div>
            )}
            
            {editing && (
              <div className="address-edit-form">
                <div className="address-form-group">
                  <label>Address</label>
                  <div className="address-input-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <textarea
                    name="formattedAddress"
                    placeholder={`Enter ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Address`}
                    value={editingAddress.formattedAddress}
                    onChange={handleInputChange}
                    className="address-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="address-form-group">
                  <label>Flat/Door Number</label>
                  <input
                    type="text"
                    name="flatNumber"
                    placeholder="Flat or Door Number"
                    value={editingAddress.additionalDetails?.flatNumber || ''}
                    onChange={handleInputChange}
                    className="address-input"
                  />
                </div>
                
                <div className="address-form-group">
                  <label>Building/Society Name</label>
                  <input
                    type="text"
                    name="buildingName"
                    placeholder="Building or Society Name"
                    value={editingAddress.additionalDetails?.buildingName || ''}
                    onChange={handleInputChange}
                    className="address-input"
                  />
                </div>
                
                <div className="address-form-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Nearby Landmark"
                    value={editingAddress.additionalDetails?.landmark || ''}
                    onChange={handleInputChange}
                    className="address-input"
                  />
                </div>
                
                <div className="address-actions">
                  <button
                    className="cancel-edit-btn"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-address-btn" 
                    onClick={saveAddress}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressPanel;