import { FormEvent, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CalendarDays, CheckCircle2, Droplets, MapPin, Sprout, UserRound } from 'lucide-react'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth'
import { FarmerGender, farmerProfileService } from '@/services/farmerProfile'

const farmingTypeOptions = [
  { key: 'irishPotatoes', value: 'Irish potatoes' },
  { key: 'maize', value: 'Maize' },
  { key: 'beans', value: 'Beans' },
  { key: 'vegetables', value: 'Vegetables' },
  { key: 'fruits', value: 'Fruits' },
]

const genderOptions: Array<{ value: FarmerGender; key: string }> = [
  { value: 'female', key: 'female' },
  { value: 'male', key: 'male' },
  { value: 'other', key: 'other' },
  { value: 'prefer-not-to-say', key: 'preferNotToSay' },
]

export default function FarmerProfileCompletionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  const [savedProfile, setSavedProfile] = useState<Awaited<ReturnType<typeof farmerProfileService.get>>['profile']>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [farmingTypes, setFarmingTypes] = useState<string[]>(
    ['Maize']
  )
  const [usesIrrigation, setUsesIrrigation] = useState(false)

  useEffect(() => {
    let cancelled = false
    farmerProfileService.get({ name: currentUser?.name, phone: currentUser?.phone })
      .then(({ profile }) => {
        if (cancelled) return
        setSavedProfile(profile)
        if (profile?.farming.farmingTypes.length) setFarmingTypes(profile.farming.farmingTypes)
        if (profile) setUsesIrrigation(profile.farming.usesIrrigation)
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

  const toggleFarmingType = (type: string) => {
    setFarmingTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser?.id) {
      toast.error(t('farmerProfile.toast.signInAgain'))
      navigate('/sign-in')
      return
    }

    if (farmingTypes.length === 0) {
      toast.error(t('farmerProfile.toast.selectFarmingType'))
      return
    }

    const form = new FormData(event.currentTarget)
    try {
      await farmerProfileService.save(currentUser.id, {
        personal: {
          fullName: String(form.get('fullName') || ''),
          phone: String(form.get('phone') || ''),
          nationalId: String(form.get('nationalId') || ''),
          gender: String(form.get('gender') || 'prefer-not-to-say') as FarmerGender,
          age: Number(form.get('age') || 0),
          district: String(form.get('district') || ''),
          sector: String(form.get('sector') || ''),
          cell: String(form.get('cell') || ''),
          village: String(form.get('village') || ''),
        },
        farming: {
          farmingTypes,
          landSize: Number(form.get('landSize') || 0),
          yearsFarming: Number(form.get('yearsFarming') || 0),
          usesIrrigation,
        },
        farms: [
          {
            farmName: String(form.get('farmName') || ''),
            farmSize: Number(form.get('farmSize') || 0),
            farmLocation: String(form.get('farmLocation') || ''),
            cropType: String(form.get('cropType') || ''),
            plantingDate: String(form.get('plantingDate') || ''),
            seedType: String(form.get('seedType') || ''),
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
            <Field label={t('farmerProfile.personal.district')} name="district" defaultValue={savedProfile?.personal.district ?? currentUser?.location} required />
            <Field label={t('farmerProfile.personal.sector')} name="sector" defaultValue={savedProfile?.personal.sector} required />
            <Field label={t('farmerProfile.personal.cell')} name="cell" defaultValue={savedProfile?.personal.cell} required />
            <Field label={t('farmerProfile.personal.village')} name="village" defaultValue={savedProfile?.personal.village} required />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-emerald-600" />
              {t('farmerProfile.farming.title')}
            </CardTitle>
            <CardDescription>{t('farmerProfile.farming.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t('farmerProfile.farming.type')}</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {farmingTypeOptions.map((type) => {
                  const selected = farmingTypes.includes(type.value)
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleFarmingType(type.value)}
                      className={`flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-input bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`farmerProfile.farming.types.${type.key}`)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label={t('farmerProfile.farming.landSize')} name="landSize" type="number" step="0.1" min="0.1" defaultValue={savedProfile?.farming.landSize ?? currentUser?.farmSize} required />
              <Field label={t('farmerProfile.farming.yearsFarming')} name="yearsFarming" type="number" min="0" defaultValue={savedProfile?.farming.yearsFarming} required />
              <div className="space-y-2">
                <Label>{t('farmerProfile.farming.irrigation')}</Label>
                <button
                  type="button"
                  onClick={() => setUsesIrrigation((value) => !value)}
                  className={`flex h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
                    usesIrrigation
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-input bg-background text-muted-foreground'
                  }`}
                >
                  <Droplets className="h-4 w-4" />
                  {usesIrrigation ? t('farmerProfile.farming.usesIrrigation') : t('farmerProfile.farming.noIrrigation')}
                </button>
              </div>
            </div>
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
            <Field label={t('farmerProfile.farm.size')} name="farmSize" type="number" step="0.1" min="0.1" defaultValue={savedProfile?.farms[0]?.farmSize} required />
            <Field label={t('farmerProfile.farm.location')} name="farmLocation" defaultValue={savedProfile?.farms[0]?.farmLocation} required />
            <Field label={t('farmerProfile.farm.cropType')} name="cropType" defaultValue={savedProfile?.farms[0]?.cropType} required />
            <Field label={t('farmerProfile.farm.plantingDate')} name="plantingDate" type="date" defaultValue={savedProfile?.farms[0]?.plantingDate} required icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />
            <Field label={t('farmerProfile.farm.seedType')} name="seedType" defaultValue={savedProfile?.farms[0]?.seedType} required />
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
