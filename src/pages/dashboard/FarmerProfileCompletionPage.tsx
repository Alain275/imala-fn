import { FormEvent, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CalendarDays, CheckCircle2, MapPin, Plus, Trash2, UserRound } from 'lucide-react'
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

type FarmFields = {
  farmName: string
  farmSize: string
  sizeUnit: 'ha' | 'acre' | 'sqm'
  cropType: string
  farmProvince: string
  farmDistrict: string
  farmSector: string
  farmCell: string
  farmVillage: string
}

const emptyFarm: FarmFields = {
  farmName: '',
  farmSize: '1',
  sizeUnit: 'ha',
  cropType: '',
  farmProvince: '',
  farmDistrict: '',
  farmSector: '',
  farmCell: '',
  farmVillage: '',
}

function canonicalName(options: string[], name: string) {
  return options.find((option) => option.toLocaleLowerCase() === name.toLocaleLowerCase())
}

export default function FarmerProfileCompletionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  const [savedProfile, setSavedProfile] = useState<Awaited<ReturnType<typeof farmerProfileService.get>>['profile']>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Personal location state
  const [province, setProvince] = useState('')
  const [district, setDistrict] = useState('')
  const [sector, setSector] = useState('')
  const [cell, setCell] = useState('')
  const [village, setVillage] = useState('')

  // Dynamic farm array
  const [farms, setFarms] = useState<FarmFields[]>([{ ...emptyFarm }])

  const districtOptions = provinceDistricts[province] ?? []
  const sectorOptions = district ? Object.keys(locations[district] ?? {}) : []
  const cellOptions = district && sector ? Object.keys(locations[district]?.[sector] ?? {}) : []
  const villageOptions = district && sector && cell ? locations[district]?.[sector]?.[cell] ?? [] : []

  // Populate saved values on mount
  useEffect(() => {
    let cancelled = false
    farmerProfileService.get({ name: currentUser?.name, phone: currentUser?.phone })
      .then(({ profile }) => {
        if (cancelled) return
        setSavedProfile(profile)

        // Personal location
        const savedDistrict = profile?.personal.district ?? currentUser?.location ?? ''
        const savedProvince = canonicalName(provinceOptions, profile?.personal.province ?? '')
          ?? provinceOptions.find((option) => provinceDistricts[option].includes(savedDistrict))
          ?? ''
        const savedDistricts = provinceDistricts[savedProvince] ?? []
        const validDistrict = canonicalName(savedDistricts, savedDistrict) ?? ''
        const savedSectors = validDistrict ? Object.keys(locations[validDistrict] ?? {}) : []
        const validSector = canonicalName(savedSectors, profile?.personal.sector ?? '') ?? ''
        const savedCells = validDistrict && validSector ? Object.keys(locations[validDistrict]?.[validSector] ?? {}) : []
        const validCell = canonicalName(savedCells, profile?.personal.cell ?? '') ?? ''
        const savedVillages = validDistrict && validSector && validCell
          ? locations[validDistrict]?.[validSector]?.[validCell] ?? []
          : []

        setProvince(savedProvince)
        setDistrict(validDistrict)
        setSector(validSector)
        setCell(validCell)
        setVillage(canonicalName(savedVillages, profile?.personal.village ?? '') ?? '')

        // Farms – load saved farms (if any)
        if (profile?.farms?.length) {
          const loadedFarms = profile.farms.map((f: any) => ({
            farmName: f.farmName ?? '',
            farmSize: String(f.farmSize ?? '1'),
            sizeUnit: f.sizeUnit ?? 'ha',
            cropType: f.cropType ?? '',
            farmProvince: f.farmProvince ?? '',
            farmDistrict: f.farmDistrict ?? '',
            farmSector: f.farmSector ?? '',
            farmCell: f.farmCell ?? '',
            farmVillage: f.farmVillage ?? '',
          }))
          setFarms(loadedFarms.length ? loadedFarms : [emptyFarm])
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoadingProfile(false)
      })

    return () => { cancelled = true }
  }, [currentUser?.name, currentUser?.phone])

  if (currentUser && currentUser.role !== 'farmer') {
    return <Navigate to="/dashboard" replace />
  }

  // Helpers for farm location dropdowns
  const farmDistrictOptions = (province: string) => provinceDistricts[province] ?? []
  const farmSectorOptions = (district: string) => (district ? Object.keys(locations[district] ?? {}) : [])
  const farmCellOptions = (district: string, sector: string) =>
    district && sector ? Object.keys(locations[district]?.[sector] ?? {}) : []
  const farmVillageOptions = (district: string, sector: string, cell: string) =>
    district && sector && cell ? locations[district]?.[sector]?.[cell] ?? [] : []

  const updateFarm = (index: number, field: keyof FarmFields, value: string) => {
    setFarms((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)))
  }

  const addFarm = () => setFarms((prev) => [...prev, { ...emptyFarm }])
  const removeFarm = (index: number) => setFarms((prev) => prev.filter((_, i) => i !== index))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser?.id) {
      toast.error(t('farmerProfile.toast.signInAgain'))
      navigate('/sign-in')
      return
    }

    const form = new FormData(event.currentTarget)
    try {
      const farmPayloads = farms.map((farm) => ({
        farmName: farm.farmName,
        farmSize: Number(farm.farmSize),
        sizeUnit: farm.sizeUnit,
        farmLocation: `${farm.farmProvince}, ${farm.farmDistrict}, ${farm.farmSector}, ${farm.farmCell}, ${farm.farmVillage}`,
        cropType: farm.cropType,
        plantingDate: '',
      }))

      await farmerProfileService.save(currentUser.id, {
        personal: {
          fullName: String(form.get('fullName') || ''),
          phone: String(form.get('phone') || ''),
          nationalId: String(form.get('nationalId') || ''),
          gender: String(form.get('gender') || 'prefer-not-to-say') as FarmerGender,
          age: Number(form.get('age') || 0),
          province: String(form.get('province') || ''),
          district: String(form.get('district') || ''),
          sector: String(form.get('sector') || ''),
          cell: String(form.get('cell') || ''),
          village: String(form.get('village') || ''),
        },
        farming: {
          farmingTypes: [farms[0]?.cropType ?? ''],
          landSize: Number(farms[0]?.farmSize ?? 0),
          yearsFarming: savedProfile?.farming.yearsFarming ?? 0,
          usesIrrigation: savedProfile?.farming.usesIrrigation ?? false,
        },
        farms: farmPayloads,
      })

      authService.refreshUser()
      toast.success(t('farmerProfile.toast.completed'))
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

        {/* Personal Info Card – unchanged except location dropdowns already exist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-emerald-600" />
              {t('farmerProfile.personal.title')}
            </CardTitle>
            <CardDescription>{t('farmerProfile.personal.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={t('farmerProfile.personal.fullName')} name="fullName" defaultValue={savedProfile?.personal.fullName ?? currentUser?.name} required />
            <Field label={t('farmerProfile.personal.phone')} name="phone" defaultValue={savedProfile?.personal.phone ?? currentUser?.phone} required />
            <Field label={t('farmerProfile.personal.nationalId')} name="nationalId" defaultValue={savedProfile?.personal.nationalId} />
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
                  <option key={option.value} value={option.value}>{t(`farmerProfile.gender.${option.key}`)}</option>
                ))}
              </select>
            </div>
            <Field label={t('farmerProfile.personal.age')} name="age" type="number" min="1" defaultValue={savedProfile?.personal.age} required />
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

        {/* Farms Card – dynamic list */}
        {farms.map((farm, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  {t('farmerProfile.farm.title')} {farms.length > 1 ? `#${index + 1}` : ''}
                </CardTitle>
                <CardDescription>{t('farmerProfile.farm.description')}</CardDescription>
              </div>
              {farms.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFarm(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('farmerProfile.farm.name')}
                name={`farmName-${index}`}
                value={farm.farmName}
                onChange={(e) => updateFarm(index, 'farmName', e.target.value)}
                required
              />
              {/* Size + unit selector */}
              <div className="space-y-2">
                <Label htmlFor={`farmSize-${index}`}>{t('farmerProfile.farm.size')}</Label>
                <div className="flex gap-2">
                  <Input
                    id={`farmSize-${index}`}
                    name={`farmSize-${index}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={farm.farmSize}
                    onChange={(e) => updateFarm(index, 'farmSize', e.target.value)}
                    required
                  />
                  <select
                    name={`sizeUnit-${index}`}
                    value={farm.sizeUnit}
                    onChange={(e) => updateFarm(index, 'sizeUnit', e.target.value)}
                    className="h-10 w-24 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="ha">ha</option>
                    <option value="acre">acre</option>
                    <option value="sqm">sqm</option>
                  </select>
                </div>
              </div>

              {/* Farm location – nested dropdowns */}
              <LocationSelect
                label={t('farmerProfile.farm.province')}
                name={`farmProvince-${index}`}
                value={farm.farmProvince}
                options={provinceOptions}
                placeholder={t('farmerProfile.personal.selectProvince')}
                onChange={(value) => {
                  updateFarm(index, 'farmProvince', value)
                  updateFarm(index, 'farmDistrict', '')
                  updateFarm(index, 'farmSector', '')
                  updateFarm(index, 'farmCell', '')
                  updateFarm(index, 'farmVillage', '')
                }}
              />
              <LocationSelect
                label={t('farmerProfile.farm.district')}
                name={`farmDistrict-${index}`}
                value={farm.farmDistrict}
                options={farmDistrictOptions(farm.farmProvince)}
                placeholder={t('farmerProfile.personal.selectDistrict')}
                disabled={!farm.farmProvince}
                onChange={(value) => {
                  updateFarm(index, 'farmDistrict', value)
                  updateFarm(index, 'farmSector', '')
                  updateFarm(index, 'farmCell', '')
                  updateFarm(index, 'farmVillage', '')
                }}
              />
              <LocationSelect
                label={t('farmerProfile.farm.sector')}
                name={`farmSector-${index}`}
                value={farm.farmSector}
                options={farmSectorOptions(farm.farmDistrict)}
                placeholder={t('farmerProfile.personal.selectSector')}
                disabled={!farm.farmDistrict}
                onChange={(value) => {
                  updateFarm(index, 'farmSector', value)
                  updateFarm(index, 'farmCell', '')
                  updateFarm(index, 'farmVillage', '')
                }}
              />
              <LocationSelect
                label={t('farmerProfile.farm.cell')}
                name={`farmCell-${index}`}
                value={farm.farmCell}
                options={farmCellOptions(farm.farmDistrict, farm.farmSector)}
                placeholder={t('farmerProfile.personal.selectCell')}
                disabled={!farm.farmSector}
                onChange={(value) => {
                  updateFarm(index, 'farmCell', value)
                  updateFarm(index, 'farmVillage', '')
                }}
              />
              <LocationSelect
                label={t('farmerProfile.farm.village')}
                name={`farmVillage-${index}`}
                value={farm.farmVillage}
                options={farmVillageOptions(farm.farmDistrict, farm.farmSector, farm.farmCell)}
                placeholder={t('farmerProfile.personal.selectVillage')}
                disabled={!farm.farmCell}
                onChange={(value) => updateFarm(index, 'farmVillage', value)}
              />

              {/* Crop type */}
              <LocationSelect
                label={t('farmerProfile.farm.cropType')}
                name={`cropType-${index}`}
                value={farm.cropType}
                options={SUPPORTED_CROPS}
                placeholder={t('farmerProfile.farm.selectCrop')}
                onChange={(value) => updateFarm(index, 'cropType', value)}
              />

              {/* Planting date removed completely */}
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={addFarm} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {t('farmerProfile.farm.addAnother')}
        </Button>

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

// --- Helper components (unchanged except Field now accepts value/onChange for controlled inputs) ---

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
  icon?: ReactNode
}

function Field({ label, name, type = 'text', required, defaultValue, value, onChange, min, step, icon }: FieldProps) {
  // If controlled (value + onChange provided), use them; otherwise uncontrolled defaultValue
  const inputProps = value !== undefined && onChange
    ? { value, onChange }
    : { defaultValue: defaultValue ?? '' }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          min={min}
          step={step}
          className={icon ? 'pl-9' : undefined}
          {...inputProps}
        />
      </div>
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
  onChange: (value: string) => void
}

function LocationSelect({ label, name, value, options, placeholder, disabled, onChange }: LocationSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        value={value}
        required
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}