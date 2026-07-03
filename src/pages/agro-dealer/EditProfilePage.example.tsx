/**
 * AGRO-DEALER EDIT PROFILE PAGE - EXAMPLE IMPLEMENTATION
 * 
 * This is a starter template showing how to structure the EditProfilePage.
 * Customize this based on your UI library (shadcn, MUI, etc.)
 * 
 * Features included:
 * - Tabbed navigation
 * - Form state management
 * - File uploads
 * - Multi-select fields
 * - Toggle switches
 * - Loading and error states
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import agroDealerProfileService, { AgroDealerProfileData } from '@/services/agroDealerProfile.service';
import {
  BUSINESS_CATEGORIES,
  PAYMENT_METHODS,
  LANGUAGES,
  RWANDA_PROVINCES,
  BUSINESS_TYPES,
  DEFAULT_BUSINESS_HOURS,
} from '@/constants/agroDealerOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Upload, X } from 'lucide-react';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AgroDealerProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await agroDealerProfileService.getProfile();
      setProfile(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await agroDealerProfileService.updateProfile(profile!);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const response = await agroDealerProfileService.uploadLogo(file);
      setProfile((prev) => ({
        ...prev!,
        businessLogo: response.data.logoUrl,
      }));
      setSuccessMessage('Logo uploaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    const current = profile?.categories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    handleInputChange('categories', updated);
  };

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'contact', label: 'Contact' },
    { id: 'location', label: 'Location' },
    { id: 'business', label: 'Business' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'hours', label: 'Hours' },
    { id: 'payment', label: 'Payment' },
    { id: 'social', label: 'Social Media' },
    { id: 'media', label: 'Images' },
    { id: 'documents', label: 'Documents' },
    { id: 'preferences', label: 'Preferences' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-1">
            Complete your business profile to get discovered by farmers
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b overflow-x-auto">
          <nav className="flex space-x-4 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 whitespace-nowrap font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Information Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                <div className="flex items-center space-x-4">
                  {profile?.businessLogo && (
                    <img
                      src={profile.businessLogo}
                      alt="Business Logo"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <Input
                  value={profile?.businessName || ''}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Full Name
                </label>
                <Input
                  value={profile?.ownerFullName || ''}
                  onChange={(e) => handleInputChange('ownerFullName', e.target.value)}
                  placeholder="Enter owner's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <Textarea
                  value={profile?.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your business..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={profile?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+250 788 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternative Phone
                  </label>
                  <Input
                    value={profile?.alternativePhone || ''}
                    onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
                    placeholder="+250 788 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="business@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <Input
                    value={profile?.whatsapp || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+250 788 123 456"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={profile?.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Categories Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BUSINESS_CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={profile?.categories?.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={profile?.businessType || ''}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select type...</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business
                  </label>
                  <Input
                    type="number"
                    value={profile?.yearsInBusiness || ''}
                    onChange={(e) =>
                      handleInputChange('yearsInBusiness', parseInt(e.target.value))
                    }
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number
                  </label>
                  <Input
                    value={profile?.licenseNumber || ''}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="Enter license number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TIN (Optional)
                  </label>
                  <Input
                    value={profile?.tin || ''}
                    onChange={(e) => handleInputChange('tin', e.target.value)}
                    placeholder="Enter TIN"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add more tab content sections here following the same pattern */}
          {/* Location, Delivery, Hours, Payment, Social Media, Media, Documents, Preferences */}
          
          {/* Example: Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  AI Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-700">
                      Show my products in AI recommendations
                    </span>
                    <input
                      type="checkbox"
                      checked={profile?.aiPreferences?.showInRecommendations || false}
                      onChange={(e) =>
                        handleInputChange('aiPreferences', {
                          ...profile?.aiPreferences,
                          showInRecommendations: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  {/* Add more AI preference toggles */}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-700">Email Notifications</span>
                    <input
                      type="checkbox"
                      checked={
                        profile?.notificationPreferences?.emailNotifications || false
                      }
                      onChange={(e) =>
                        handleInputChange('notificationPreferences', {
                          ...profile?.notificationPreferences,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                  {/* Add more notification preference toggles */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save Button */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/agro-dealer')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
