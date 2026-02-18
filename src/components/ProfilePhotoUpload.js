import React, { useState, useRef, useEffect } from 'react';
import { createJobSeekerProfile, createEmployerProfile } from '../services/profileService';
import '../styles/ProfilePhotoUpload.css';

const ProfilePhotoUpload = ({ userId, userType, currentPhotoUrl, onPhotoUpdate, triggerUpload }) => {
  const [photoPreview, setPhotoPreview] = useState(currentPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPhotoPreview(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      uploadPhoto(file);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    setError('');

    try {
      // Convert file to base64 or upload to server
      // For now, we'll convert to base64 and store in profile
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result;
        
        try {
          // Update profile with photo (using create which does upsert)
          const updateData = { profilePhoto: base64Photo };
          
          let response;
          if (userType === 'jobseeker') {
            response = await createJobSeekerProfile(userId, updateData);
          } else {
            response = await createEmployerProfile(userId, updateData);
          }

          console.log('Photo uploaded successfully:', response);

          if (onPhotoUpdate) {
            onPhotoUpdate(base64Photo);
          }
        } catch (err) {
          console.error('Upload error:', err);
          setError(err.message || 'Failed to update profile photo');
          setPhotoPreview(currentPhotoUrl);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setError(err.message || 'Failed to upload photo');
      setUploading(false);
      setPhotoPreview(currentPhotoUrl);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      const updateData = { profilePhoto: '' };
      
      if (userType === 'jobseeker') {
        await createJobSeekerProfile(userId, updateData);
      } else {
        await createEmployerProfile(userId, updateData);
      }

      setPhotoPreview(null);
      if (onPhotoUpdate) {
        onPhotoUpdate(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Listen for external trigger
  useEffect(() => {
    if (triggerUpload) {
      triggerFileInput();
    }
  }, [triggerUpload]);

  return (
    <div className="profile-photo-upload-simple">
      {uploading && (
        <div className="photo-uploading-message">
          <div className="upload-spinner-small"></div>
          <span>Uploading...</span>
        </div>
      )}
      <div className="photo-actions-simple">
        <button
          type="button"
          className="btn-photo-upload-simple"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          📷 {photoPreview ? 'Change Photo' : 'Upload Photo'}
        </button>
        {photoPreview && (
          <button
            type="button"
            className="btn-photo-remove-simple"
            onClick={handleRemovePhoto}
            disabled={uploading}
          >
            🗑️ Remove Photo
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {error && <div className="photo-error-simple">{error}</div>}
      <p className="photo-hint-simple">Recommended: Square image, max 5MB</p>
    </div>
  );
};

export default ProfilePhotoUpload;
