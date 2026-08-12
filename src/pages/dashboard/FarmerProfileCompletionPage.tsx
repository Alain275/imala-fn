import { FormEvent, useEffect, useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CalendarDays, CheckCircle2, MapPin, UserRound } from 'lucide-react'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth'
import { FarmerGender, farmerProfileService } from '@/services/farmerProfile'
import rwandaLocations from '@/data/rwandaLocations.json'
import { SUPPORTED_CROPS } from '@/constants/supportedCrops'

const genderOptions: Array<{ value: FarmerGender; key: string }> = [
  { value: 'female', key: 'female' },
  { value: 'male', key: 'male' },
  { value: 'other', key: 'other' },
  { value: 'prefer-not-to-say', key: 'preferNotToSay' },
]

type RwandaLocations = Record<string, Record<string, Record<string, string[]>>>

const locations = rwandaLocations as RwandaLocations
const provinceDistricts: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
}
const provinceOptions = Object.keys(provinceDistricts)

function canonicalName(options: string[], name: string) {
  return options.find((option) => option.toLocaleLowerCase() === name.toLocaleLowerCase())
}

function getRecommendedCrops(province: string, district: string, plantingDate: string): string[] {
  if (!province) return []

  const month = plantingDate ? new Date(plantingDate).getMonth() : -1

  const cropMap: Record<string, string[]> = {
    'Kigali City': ['Vegetables', 'Tomatoes', 'Onions'],
    'Eastern Province': ['Maize', 'Beans', 'Cassava', 'Soybeans'],
    'Northern Province': ['Potatoes', 'Wheat', 'Peas', 'Barley'],
    'Southern Province': ['Maize', 'Beans', 'Sweet Potatoes', 'Coffee'],
    'Western Province': ['Coffee', 'Tea', 'Bananas', 'Beans'],
  }

  let recommended = cropMap[province] || []

  if (month >= 8 && month <= 11) {
    recommended = recommended.concat(['Maize', 'Beans'])
  } else if (month >= 2 && month <= 5) {
    recommended = recommended.concat(['Potatoes', 'Peas'])
  }

  return [...new Set(recommended)]
}


export default function FarmerProfileCompletionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  const [savedProfile, setSavedProfile] = useState<Awaited<ReturnType<typeof farmerProfileService.get>>['profile']>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [cell, setCell] = useState('')
  const [village, setVillage] = useState('')
  const [farm, setFarm] = useState({
    farmName: '',
    farmSize: '1',
    cropType: '',
    plantingDate: '',
  })
  const districtOptions = provinceDistricts[province] ?? []
  const sectorOptions = district ? Object.keys(locations[district] ?? {}) : []
  const cellOptions = district && sector ? Object.keys(locations[district]?.[sector] ?? {}) : []
  const villageOptions = district && sector && cell ? locations[district]?.[sector]?.[cell] ?? [] : []
// Farm location (derived from personal location)
  const farmLocation = useMemo(() => {
    const parts = [province, district, sector, cell, village].filter(Boolean)
    return parts.length ? parts.join(', ') : ''
  }, [province, district, sector, cell, village])

  // Recommended crops (based on province and planting date)
  const recommendedCrops = useMemo(() => {
    return getRecommendedCrops(province, district, farm.plantingDate)
  }, [province, district, farm.plantingDate])

  // Crop chip click handler
  const handleCropChipClick = (crop: string) => {
    setFarm((prev) => ({ ...prev, cropType: crop }))
  }

  // Populate saved values on mount

  useEffect(() => {
    let cancelled = false
farmerProfileService
  .get({ name: currentUser?.name, phone: currentUser?.phone })
  .then(({ profile }) => {
    if (cancelled) return
    farmerProfileService
      .get({ name: currentUser?.name, phone: currentUser?.phone })
        setSavedProfile(profile)

        const savedDistrict = profile?.personal.district ?? currentUser?.location ?? ''
       const savedProvince =
          canonicalName(provinceOptions, profile?.personal.province ?? '') ??
          provinceOptions.find((option) => provinceDistricts[option].includes(savedDistrict)) ??
          ''
        const savedDistricts = provinceDistricts[savedProvince] ?? []
        const validDistrict = canonicalName(savedDistricts, savedDistrict) ?? ''
        const savedSectors = validDistrict ? Object.keys(locations[validDistrict] ?? {}) : []
        const validSector = canonicalName(savedSectors, profile?.personal.sector ?? '') ?? ''
        const savedCells = validDistrict && validSector ? Object.keys(locations[validDistrict]?.[validSector] ?? {}) : []
        const validCell = canonicalName(savedCells, profile?.personal.cell ?? '') ?? ''
        const savedVillages =
          validDistrict && validSector && validCell ? locations[validDistrict]?.[validSector]?.[validCell] ?? [] : []

        setProvince(savedProvince)
        setDistrict(validDistrict)
        setSector(validSector)
        setCell(validCell)
    setVillage(canonicalName(savedVillages, profile?.personal.village ?? '') ?? '')
    if (profile?.farms?.length) {
          const first = profile.farms[0]
          setFarm({
            farmName: first.farmName ?? '',
            farmSize: String(first.farmSize ?? '1'),
            cropType: first.cropType ?? '',
            plantingDate: first.plantingDate ? first.plantingDate.slice(0, 10) : '',
          })
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingProfile(false)
      })

   return () => {
      cancelled = true
   }
    
  }, [currentUser?.name, currentUser?.phone])

  if (currentUser && currentUser.role !== 'farmer') {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser?.id) {
      toast.error(t('farmerProfile.toast.signInAgain'))
      navigate('/sign-in')
      return
    }

    const form = new FormData(event.currentTarget)
    const selectedFarmCrop = String(form.get('cropType') || '')
    const farmSize = Number(form.get('farmSize') || 0)
    try {
     const farmPayload = {
        farmName: farm.farmName,
        farmSize: Number(farm.farmSize),
        farmLocation: farmLocation || 'Unknown location',
        cropType: farm.cropType,
        plantingDate: farm.plantingDate,
      }

      const payload = {
        personal: {
          fullName: String(form.get('fullName') || ''),
          phone: String(form.get('phone') || ''),
          nationalId: String(form.get('nationalId') || ''),
          gender: String(form.get('gender') || 'prefer-not-to-say') as FarmerGender,
          age: Number(form.get('age') || 0),
        province: province,
          district: district,
          sector: sector,
          cell: cell,
          village: village,
        },
        farming: {
        farmingTypes: [farm.cropType],
          landSize: Number(farm.farmSize),
          yearsFarming: savedProfile?.farming.yearsFarming ?? 0,
          usesIrrigation: savedProfile?.farming.usesIrrigation ?? false,
        },
      farms: [farmPayload],
      }

      await farmerProfileService.save(currentUser.id, payload)

      authService.refreshUser()
      toast.success(t('farmerProfile.toast.completed'), {
     style: {
    background: '#22c55e',
    color: '#ffffff',
    border: '1px solid #16a34a',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
      })
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('farmerProfile.toast.saveFailed'))
    }
  }

  return (
    <div className="farmer-workspace-page">
      <Header
        title={savedProfile ? t('farmerProfile.reviewTitle') : t('farmerProfile.title')}
        subtitle={savedProfile ? t('farmerProfile.reviewSubtitle') : t('farmerProfile.subtitle')}
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-5 p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
        {loadingProfile && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-sm text-muted-foreground">
              {t('common.actions.loading', { defaultValue: 'Loading...' })}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-emerald-600" />
              {t('farmerProfile.personal.title')}
            </CardTitle>
            <CardDescription>{t('farmerProfile.personal.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
              label={t('farmerProfile.personal.fullName')}
              name="fullName"
              defaultValue={savedProfile?.personal.fullName ?? currentUser?.name}
              required
            />
            <Field
              label={t('farmerProfile.personal.phone')}
              name="phone"
              defaultValue={savedProfile?.personal.phone ?? currentUser?.phone}
              required
            />
            <Field
              label={t('farmerProfile.personal.nationalId')}
              name="nationalId"
              defaultValue={savedProfile?.personal.nationalId}
            />
            <div className="space-y-2">
              <Label htmlFor="gender">{t('farmerProfile.personal.gender')}</Label>
              <select
                id="gender"
                name="gender"
                defaultValue={savedProfile?.personal.gender ?? 'prefer-not-to-say'}
                required
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {genderOptions.map((option) => (
                 <option key={option.value} value={option.value}>
                    {t(`farmerProfile.gender.${option.key}`)}
                  </option>
                ))}
              </select>
            </div>
           <Field
              label={t('farmerProfile.personal.age')}
              name="age"
              type="number"
              min="1"
              defaultValue={savedProfile?.personal.age}
              required
            />
            <LocationSelect
              label={t('farmerProfile.personal.province')}
              name="province"
              value={province}
              options={provinceOptions}
              placeholder={t('farmerProfile.personal.selectProvince')}
              onChange={(value) => {
                setProvince(value)
                setDistrict('')
                setSector('')
                setCell('')
                setVillage('')
              }}
            />
            <LocationSelect
              label={t('farmerProfile.personal.district')}
              name="district"
              value={district}
              options={districtOptions}
              placeholder={t('farmerProfile.personal.selectDistrict')}
              disabled={!province}
              onChange={(value) => {
                setDistrict(value)
                setSector('')
                setCell('')
                setVillage('')
              }}
            />
            <LocationSelect
              label={t('farmerProfile.personal.sector')}
              name="sector"
              value={sector}
              options={sectorOptions}
              placeholder={t('farmerProfile.personal.selectSector')}
              disabled={!district}
              onChange={(value) => {
                setSector(value)
                setCell('')
                setVillage('')
              }}
            />
            <LocationSelect
              label={t('farmerProfile.personal.cell')}
              name="cell"
              value={cell}
              options={cellOptions}
              placeholder={t('farmerProfile.personal.selectCell')}
              disabled={!sector}
              onChange={(value) => {
                setCell(value)
                setVillage('')
              }}
            />
            <LocationSelect
              label={t('farmerProfile.personal.village')}
              name="village"
              value={village}
              options={villageOptions}
              placeholder={t('farmerProfile.personal.selectVillage')}
              disabled={!cell}
              onChange={setVillage}
            />
          </CardContent>
        </Card>

       {/* Farm Location Card (separated, same style as personal) */}
        <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-emerald-100 bg-emerald-50/40 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-emerald-900">
                {t('farmerProfile.farmLocation.title', { defaultValue: 'Farm Location' })}
              </CardTitle>
              <CardDescription className="text-emerald-700/80">
                {t('farmerProfile.farmLocation.hint', { defaultValue: '' })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-4">
              <MapPin className="h-5 w-5 text-emerald-600" />
           <div>
                <p className="text-sm font-medium text-emerald-900">
                  {farmLocation || '—'}
                </p>
                <p className="text-xs text-emerald-700/70">
                  {t('farmerProfile.farmLocation.sameAsPersonal', { defaultValue: '' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farm Details Card (beautified with recommended crop chips) */}
        <Card className="overflow-hidden border-emerald-100 shadow-md">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-green-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-emerald-900">
                  {t('farmerProfile.farm.title')}
                </CardTitle>
                <CardDescription className="text-emerald-700/80">
                  {t('farmerProfile.farm.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <Field
              label={t('farmerProfile.farm.name')}
              name="farmName"
              value={farm.farmName}
              onChange={(e) => setFarm((prev) => ({ ...prev, farmName: e.target.value }))}
              required
            />
            <Field
              label={t('farmerProfile.farm.size')}
              name="farmSize"
              type="number"
              min="0.01"
              step="0.01"
              value={farm.farmSize}
              onChange={(e) => setFarm((prev) => ({ ...prev, farmSize: e.target.value }))}
              required
            />

            {/* Recommended crops chips */}
            {recommendedCrops.length > 0 && (
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    <span>✨</span> {t('', { count: recommendedCrops.length })}
                  </span>
                  <p className="text-xs text-emerald-700/80">
                    {t('farmerProfile.farm.recommendedMessage', {
                      defaultValue: 'This crops are the best for your area & season!',
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedCrops.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropChipClick(crop)}
                      className={`group relative flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                        farm.cropType === crop
                          ? 'border-emerald-600 bg-emerald-100 text-emerald-900 shadow-sm'
                          : 'border-emerald-200 bg-white text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50/80 hover:shadow-md'
                      }`}
                    >
                      <span className="text-base">🌱</span>
                      {crop}
                      <span className="ml-1 text-amber-500">⭐</span>
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        ✓
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Crop dropdown (with recommended highlights inside the list) */}
            <LocationSelect
              label={t('farmerProfile.farm.cropType')}
              name="cropType"
              value={farm.cropType}
              options={SUPPORTED_CROPS}
              placeholder={t('farmerProfile.farm.selectCrop')}
             onChange={(value) => setFarm((prev) => ({ ...prev, cropType: value }))}
              recommended={recommendedCrops}
            />
          <div className="space-y-2">
              <Label htmlFor="plantingDate">{t('farmerProfile.farm.plantingDate')}</Label>
              <Input
                id="plantingDate"
                name="plantingDate"
                type="date"
                value={farm.plantingDate}
                onChange={(e) => setFarm((prev) => ({ ...prev, plantingDate: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-20 z-20 flex items-center justify-between gap-3 border border-[#d7e5da] bg-white/95 p-3 shadow-[0_8px_28px_rgba(35,72,50,.12)] backdrop-blur lg:bottom-4 dark:border-[#2b4235] dark:bg-[#17271e]/95">
          <p className="hidden text-xs text-[#6a7e70] sm:block">{t('farmerProfile.personal.description')}</p>
          <Button type="submit" size="lg" className="w-full bg-[#315900] font-bold text-[#b5ff62] hover:bg-[#254500] sm:w-auto">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {savedProfile ? t('farmerProfile.update') : t('farmerProfile.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string | number
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: string
  step?: string
}

function Field({ label, name, type = 'text', required, defaultValue, value, onChange, min, step }: FieldProps) {
  const inputProps =
    value !== undefined && onChange
      ? { value, onChange }
      : { defaultValue: defaultValue ?? '' }
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} min={min} step={step} {...inputProps} />
    </div>
  )
}

interface LocationSelectProps {
  label: string
  name: string
  value: string
  options: readonly string[]
  placeholder: string
  disabled?: boolean
  recommended?: string[]
  onChange?: (value: string) => void
}

function LocationSelect({ label, name, value, options, placeholder, disabled, onChange, recommended = [] }: LocationSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        value={value}
        required
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const isRecommended = recommended.includes(option)
          return (
            <option key={option} value={option} className={isRecommended ? 'text-green-600 font-bold' : ''}>
              {option} {isRecommended && '⭐'}
            </option>
          )
        })}
      </select>
      {recommended.length > 0 && (
        <p className="text-xs text-green-600">
          {`${recommended.length} recommended`}
        </p>
      )}
    </div>
  )
}
