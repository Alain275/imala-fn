import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, Save, Upload, ChevronDown, ChevronUp, 
  X, Check, AlertCircle, Store, ArrowLeft
} from 'lucide-react';
import agroDealerProfileService from '@/services/agroDealerProfile.service';
import {
  BUSINESS_CATEGORIES,
  PAYMENT_METHODS,
  LANGUAGES,
  RWANDA_PROVINCES,
  BUSINESS_TYPES,
} from '@/constants/agroDealerOptions';

export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState(['general']);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await agroDealerProfileService.getProfile();
      setProfile(response.data);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await agroDealerProfileService.updateProfile(profile);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const response = await agroDealerProfileService.uploadLogo(file);
      setProfile((prev: any) => ({
        ...prev,
        businessLogo: response.data.logoUrl,
      }));
      setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleArrayItem = (field: string, item: string) => {
    const current = profile?.[field] || [];
    const updated = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    updateField(field, updated);
  };

  const Section = ({ id, title, children }: any) => {
    const isExpanded = expandedSections.includes(id);
    return (
      <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isExpanded ? 
            <ChevronUp className="w-5 h-5 text-gray-500" /> : 
            <ChevronDown className="w-5 h-5 text-gray-500" />
          }
        </button>
        {isExpanded && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Store className="w-6 h-6 text-emerald-600" />
                  <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
                </div>
                <p className="text-gray-600">
                  All fields are optional. Complete what you can to help farmers find your business.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mx-6 mt-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Sections */}
        <div className="p-3 sm:p-6 space-y-3">
          
          {/* SECTION 1: General Information */}
          <Section id="general" title="📝 General Information">
            <div className="space-y-4 bg-white p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                <div className="flex items-center gap-4">
                  {profile?.businessLogo && (
                    <img
                      src={profile.businessLogo}
                      alt="Logo"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Logo
                        </>
                      )}
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
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="e.g., Green Valley Agro Supplies"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Full Name
                </label>
                <Input
                  value={profile?.ownerFullName || ''}
                  onChange={(e) => updateField('ownerFullName', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <Textarea
                  value={profile?.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell farmers about your business, products, and services..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Mention what makes your business unique
                </p>
              </div>
            </div>
          </Section>

          {/* SECTION 2: Contact Information */}
          <Section id="contact" title="📞 Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  value={profile?.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+250 788 123 456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <Input
                  value={profile?.whatsapp || ''}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="+250 788 123 456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="business@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  value={profile?.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </Section>

          {/* SECTION 3: Business Location */}
          <Section id="location" title="📍 Business Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <select
                  value={profile?.province || ''}
                  onChange={(e) => updateField('province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select province...</option>
                  {RWANDA_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <Input
                  value={profile?.district || ''}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="Enter district"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Address
                </label>
                <Textarea
                  value={profile?.physicalAddress || ''}
                  onChange={(e) => updateField('physicalAddress', e.target.value)}
                  placeholder="Enter your full physical address"
                  rows={2}
                />
              </div>
            </div>
          </Section>

          {/* SECTION 4: Business Categories */}
          <Section id="categories" title="🏷️ Business Categories">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Select all products/services you offer
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BUSINESS_CATEGORIES.map(category => (
                  <label
                    key={category}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      profile?.categories?.includes(category)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile?.categories?.includes(category) || false}
                      onChange={() => toggleArrayItem('categories', category)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* SECTION 5: Business Details */}
          <Section id="business" title="💼 Business Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={profile?.businessType || ''}
                  onChange={(e) => updateField('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select type...</option>
                  {BUSINESS_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
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
                  onChange={(e) => updateField('yearsInBusiness', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </Section>

          {/* SECTION 6: Payment Methods */}
          <Section id="payment" title="💳 Payment Methods">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                Select all payment methods you accept
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <label
                    key={method}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      profile?.paymentMethods?.includes(method)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile?.paymentMethods?.includes(method) || false}
                      onChange={() => toggleArrayItem('paymentMethods', method)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* SECTION 7: Languages */}
          <Section id="languages" title="🌍 Languages Spoken">
            <div className="bg-white p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LANGUAGES.map(lang => (
                  <label
                    key={lang}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      profile?.languages?.includes(lang)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile?.languages?.includes(lang) || false}
                      onChange={() => toggleArrayItem('languages', lang)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>
          
        </div>

        {/* Save Button Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={saving}
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
