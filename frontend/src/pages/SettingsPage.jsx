import { useState, useRef } from 'react';
import { Camera, Save, Key, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, removeProfilePicture } from '../services/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email_id: user?.email_id || '',
    phone_number: user?.phone_number || '',
    bio: user?.bio || '',
  });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'U';

  const handleProfileChange = (e) => setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handlePasswordChange = (e) => setPasswordForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB.');
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('first_name', profileForm.first_name);
      formData.append('last_name', profileForm.last_name);
      formData.append('phone_number', profileForm.phone_number);
      formData.append('bio', profileForm.bio);
      if (newImage) formData.append('profile_picture', newImage);

      const { data } = await updateProfile(formData);
      updateUser(data.user);
      setNewImage(null);
      setPreview('');
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      await removeProfilePicture();
      updateUser({ ...user, profile_picture: '' });
      setPreview('');
      toast.success('Profile picture removed.');
    } catch {
      toast.error('Failed to remove picture.');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const displayPicture = preview || user?.profile_picture || '';

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile and account preferences" />
      <div className="page-content">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* Profile Picture */}
          <div className="settings-section">
            <h3 className="settings-section-title">Profile Picture</h3>
            <div className="profile-pic-section">
              <div className="profile-pic-avatar">
                {displayPicture ? (
                  <img src={displayPicture} alt="avatar" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div className="profile-pic-actions">
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 13 }}
                    onClick={() => fileRef.current?.click()}
                    type="button"
                  >
                    <Camera size={14} /> Change Photo
                  </button>
                  {(displayPicture || user?.profile_picture) && (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 13 }}
                      onClick={handleRemovePicture}
                      type="button"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
                <p className="pic-hint">JPG, PNG up to 5MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
          </div>

          {/* Personal Information */}
          <div className="settings-section">
            <h3 className="settings-section-title">Personal Information</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" name="first_name" value={profileForm.first_name} onChange={handleProfileChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" name="last_name" value={profileForm.last_name} onChange={handleProfileChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" value={profileForm.email_id} readOnly
                  style={{ background: 'var(--gray-100)', cursor: 'not-allowed', color: 'var(--gray-500)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" name="phone_number" value={profileForm.phone_number}
                  onChange={handleProfileChange} placeholder="+1 (555) 000-0000" />
              </div>

              <div className="form-group">
                <label className="form-label">Bio <span>(Optional)</span></label>
                <textarea className="form-input" name="bio" rows={3}
                  value={profileForm.bio} onChange={handleProfileChange}
                  placeholder="Tell others a bit about yourself..." />
              </div>

              <button className="btn btn-primary" type="submit" disabled={savingProfile}>
                {savingProfile ? <span className="spinner" /> : <><Save size={15} /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* Account Security */}
          <div className="settings-section">
            <h3 className="settings-section-title">Account Security</h3>
            <form onSubmit={handleSavePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" name="currentPassword"
                  value={passwordForm.currentPassword} onChange={handlePasswordChange}
                  placeholder="Enter current password" required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" name="newPassword"
                  value={passwordForm.newPassword} onChange={handlePasswordChange}
                  placeholder="Enter new password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" name="confirmPassword"
                  value={passwordForm.confirmPassword} onChange={handlePasswordChange}
                  placeholder="Confirm new password" required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingPassword}>
                {savingPassword ? <span className="spinner" /> : <><Key size={15} /> Change Password</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
