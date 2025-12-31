import { useState } from 'react'
import { Link } from 'react-router-dom'

export type SiteForm = {
    name: string
    address: string
    city: string
    power: string
    bays: string
    lease: string
    footfall: string
    amenities: Set<string>
}

const Bolt = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
)

const AMENITIES = ['Security', 'Lighting', 'Coffee', 'Restrooms', 'Shelter']

interface AddSiteProps {
    onSuccess?: (site: SiteForm) => void
    onCancel?: () => void
    isOnboarding?: boolean
}

export function AddSite({ onSuccess, onCancel, isOnboarding = false }: AddSiteProps) {
    const [form, setForm] = useState<SiteForm>({
        name: '',
        address: '',
        city: 'Kampala',
        power: '150',
        bays: '10',
        lease: 'Revenue share',
        footfall: 'Medium',
        amenities: new Set(['Security', 'Lighting']),
    })
    const [error, setError] = useState('')
    const [ack, setAck] = useState('')

    const update = <K extends keyof SiteForm>(key: K, value: SiteForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setError('')
        setAck('')
    }

    const toggleAmenity = (value: string) => {
        setForm((prev) => {
            const next = new Set(prev.amenities)
            next.has(value) ? next.delete(value) : next.add(value)
            return { ...prev, amenities: next }
        })
        setError('')
        setAck('')
    }

    const validate = () => {
        if (form.name.trim().length < 3) return 'Please enter a site name (3+ chars).'
        if (form.address.trim().length < 5) return 'Please enter a valid address.'
        if (Number.isNaN(Number(form.power)) || Number(form.power) <= 0) return 'Power capacity must be a positive number.'
        if (Number.isNaN(Number(form.bays)) || Number(form.bays) <= 0) return 'Parking bays must be a positive number.'
        return ''
    }

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const err = validate()
        if (err) {
            setError(err)
            return
        }
        setError('')
        setAck('Saved successfully.')
        if (onSuccess) onSuccess(form)
    }

    return (
        <div className={`${isOnboarding ? '' : 'bg-surface rounded-2xl border border-border p-8 shadow-lg'}`}>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
                        <Bolt className="w-6 h-6" />
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">Add Your First Site</h2>
                </div>
                <p className="text-subtle">Enter the location and capacity details for your electric vehicle charging site.</p>
            </div>

            <form className="space-y-6" onSubmit={submit} noValidate>
                {(error || ack) && (
                    <div role="alert" aria-live="polite" className={`text-sm font-medium p-3 rounded-lg flex items-center gap-2 ${error ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {error ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            )}
                        </svg>
                        {error || ack}
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Site name</span>
                        <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input bg-background" placeholder="e.g. City Mall Rooftop" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">City</span>
                        <input value={form.city} onChange={(e) => update('city', e.target.value)} className="input bg-background" placeholder="Kampala" />
                    </label>
                    <label className="flex flex-col gap-2 sm:col-span-2">
                        <span className="text-sm font-semibold">Address</span>
                        <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input bg-background" placeholder="Street name, District, Floor..." />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Power capacity (kW)</span>
                        <input type="number" value={form.power} onChange={(e) => update('power', e.target.value)} className="input bg-background" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Parking bays</span>
                        <input type="number" value={form.bays} onChange={(e) => update('bays', e.target.value)} className="input bg-background" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Lease type</span>
                        <select value={form.lease} onChange={(e) => update('lease', e.target.value)} className="select bg-background font-medium">
                            {['Revenue share', 'Fixed rent'].map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold">Expected Footfall</span>
                        <select value={form.footfall} onChange={(e) => update('footfall', e.target.value)} className="select bg-background font-medium">
                            {['Low', 'Medium', 'High', 'Very high'].map((o) => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <fieldset className="p-0 border-none m-0">
                    <legend className="text-sm font-semibold mb-3">Available Amenities</legend>
                    <div className="flex flex-wrap gap-2">
                        {AMENITIES.map((a) => (
                            <label
                                key={a}
                                className={`cursor-pointer transition-all text-xs font-bold px-4 py-2 rounded-xl border-2 flex items-center gap-2 ${form.amenities.has(a)
                                        ? 'bg-accent/10 border-accent text-accent shadow-sm'
                                        : 'bg-muted/30 border-border text-subtle hover:border-subtle/30'
                                    }`}
                            >
                                <input type="checkbox" className="sr-only" checked={form.amenities.has(a)} onChange={() => toggleAmenity(a)} />
                                {form.amenities.has(a) && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                {a}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
                    {isOnboarding ? (
                        <Link to="/onboarding/site-owner" className="flex-1 text-center py-3 rounded-xl border-2 border-border font-bold hover:bg-muted transition-all">
                            Back
                        </Link>
                    ) : (
                        onCancel && (
                            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border-2 border-border font-bold hover:bg-muted transition-all">
                                Cancel
                            </button>
                        )
                    )}
                    <button type="submit" className="flex-[2] py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-all shadow-md active:scale-[0.98]">
                        {isOnboarding ? 'Create Site & Continue' : 'Create Parking Site'}
                    </button>
                </div>
            </form>
        </div>
    )
}
