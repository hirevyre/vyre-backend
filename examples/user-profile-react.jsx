// Example Frontend Code (React)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://api.vyre.io/v1';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    department: '',
    phoneNumber: '',
    location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get access token from localStorage or your auth context
  const accessToken = localStorage.getItem('accessToken'); 

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const userData = response.data.data.user;
      setProfile(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        position: userData.position || '',
        department: userData.department || '',
        phoneNumber: userData.phoneNumber || '',
        location: userData.location || '',
        bio: userData.bio || ''
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Only send fields that have been changed
      const changedData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== profile[key]) {
          changedData[key] = formData[key];
        }
      });

      // Only make API call if there are changes
      if (Object.keys(changedData).length > 0) {
        const response = await axios.put(`${API_URL}/users/me`, changedData, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        setProfile(response.data.data.user);
        setError(null);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div>Loading profile...</div>;
  }

  if (error && !profile) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      
      {!isEditing ? (
        <div className="profile-view">
          <div className="profile-header">
            <img 
              src={profile.avatar || '/default-avatar.png'} 
              alt={`${profile.firstName} ${profile.lastName}`} 
            />
            <h2>{profile.firstName} {profile.lastName}</h2>
            <p className="position">{profile.position}</p>
            <p className="department">{profile.department}</p>
          </div>
          
          <div className="profile-details">
            <div className="detail">
              <strong>Email:</strong>
              <p>{profile.email}</p>
            </div>
            
            <div className="detail">
              <strong>Phone:</strong>
              <p>{profile.phoneNumber || 'Not specified'}</p>
            </div>
            
            <div className="detail">
              <strong>Location:</strong>
              <p>{profile.location || 'Not specified'}</p>
            </div>
            
            <div className="detail">
              <strong>Bio:</strong>
              <p>{profile.bio || 'No bio provided'}</p>
            </div>
          </div>
          
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="position">Job Title</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              maxLength="500"
            />
            <small>{formData.bio.length}/500 characters</small>
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default UserProfile;
