import { FormEvent, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
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
  const [farmCropType, setFarmCropType] = useState('')

  const districtOptions = provinceDistricts[province] ?? []
  const sectorOptions = district ? Object.keys(locations[district] ?? {}) : []
  const cellOptions = district && sector ? Object.keys(locations[district]?.[sector] ?? {}) : []
  const villageOptions = district && sector && cell ? locations[district]?.[sector]?.[cell] ?? [] : []

  useEffect(() => {
    let cancelled = false
    farmerProfileService.get({ name: currentUser?.name, phone: currentUser?.phone })
      .then(({ profile }) => {
        if (cancelled) return
        setSavedProfile(profile)
        setFarmCropType(canonicalName([...SUPPORTED_CROPS], profile?.farms[0]?.cropType ?? '') ?? '')

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
          farmingTypes: [selectedFarmCrop],
          landSize: farmSize,
          yearsFarming: savedProfile?.farming.yearsFarming ?? 0,
          usesIrrigation: savedProfile?.farming.usesIrrigation ?? false,
        },
        farms: [
          {
            farmName: String(form.get('farmName') || ''),
            farmSize,
            farmLocation: String(form.get('farmLocation') || ''),
            cropType: String(form.get('cropType') || ''),
            plantingDate: String(form.get('plantingDate') || ''),
          },
        ],
      })

      authService.refreshUser()
      toast.success(t('farmerProfile.toast.completed'))
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('farmerProfile.toast.saveFailed'))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={savedProfile ? t('farmerProfile.reviewTitle') : t('farmerProfile.title')}
        subtitle={savedProfile ? t('farmerProfile.reviewSubtitle') : t('farmerProfile.subtitle')}
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {loadingProfile && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-sm text-muted-foreground">
              {t('common.actions.loading', { defaultValue: 'Loading...' })}
            </CardContent>
          </Card>
        )}
        <Card className="border-0 shadow-md">
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

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              {t('farmerProfile.farm.title')}
            </CardTitle>
            <CardDescription>{t('farmerProfile.farm.description')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label={t('farmerProfile.farm.name')} name="farmName" defaultValue={savedProfile?.farms[0]?.farmName} required />
            <Field label={t('farmerProfile.farm.size')} name="farmSize" type="number" step="1" min="1" defaultValue={savedProfile?.farms[0]?.farmSize} required />
            <Field label={t('farmerProfile.farm.location')} name="farmLocation" defaultValue={savedProfile?.farms[0]?.farmLocation} required />
            <LocationSelect
              label={t('farmerProfile.farm.cropType')}
              name="cropType"
              value={farmCropType}
              options={SUPPORTED_CROPS}
              placeholder={t('farmerProfile.farm.selectCrop')}
              onChange={setFarmCropType}
            />
            <Field label={t('farmerProfile.farm.plantingDate')} name="plantingDate" type="date" defaultValue={savedProfile?.farms[0]?.plantingDate} required icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />
          </CardContent>
        </Card>

        <div className="sticky bottom-20 z-20 flex justify-end rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur lg:bottom-4">
          <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-700">
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
  min?: string
  step?: string
  icon?: ReactNode
}

function Field({ label, name, type = 'text', required, defaultValue, min, step, icon }: FieldProps) {
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
          defaultValue={defaultValue ?? ''}
          min={min}
          step={step}
          className={icon ? 'pl-9' : undefined}
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
