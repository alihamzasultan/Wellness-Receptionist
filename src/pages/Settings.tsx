import { useState } from 'react';
import { useSettings, ClinicSettings } from '../hooks/useSettings';
import { Bell, Zap, Calendar, Save, Trash2, Plus, Clock, Shield, X, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TokenEditor } from '../components/shared/TokenEditor';

export function Settings() {
    const { settings, loading, updateSettings } = useSettings();
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<'reminders' | 'automation' | 'operations' | 'scheduling'>('reminders');
    const [isSaving, setIsSaving] = useState(false);

    if (loading || !settings) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading clinic settings...</div>;

    const handleSave = async (updates: Partial<ClinicSettings>) => {
        if (role !== 'Admin') return alert('Access Denied: Administrative privileges required.');
        setIsSaving(true);
        await updateSettings(updates);
        setIsSaving(false);
    };

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="page-title">Clinic Control Settings</h1>
                    <p className="page-subtitle">Configure AI behavior, automated messaging, and clinic operations.</p>
                </div>
                {role !== 'Admin' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        <Shield size={16} /> READ-ONLY MODE
                    </div>
                )}
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 8px' }}>
                    <TabButton active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell size={16} />} label="Reminders" />
                    <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={<Zap size={16} />} label="Automation" />
                    {/* <TabButton active={activeTab === 'scheduling'} onClick={() => setActiveTab('scheduling')} icon={<Clock size={16} />} label="Scheduling" /> */}
                </div>
                <div style={{ padding: '32px' }}>
                    {activeTab === 'reminders' && <RemindersTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'automation' && <AutomationTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'operations' && <OperationsTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'scheduling' && <SchedulingTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                </div>
            </div>
        </div>
    );
}

// ------------------------ UI Utilities ------------------------

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '14px 20px',
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: active ? '700' : '500',
                color: active ? 'var(--primary)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                marginBottom: '-1px'
            }}
            onMouseOver={e => { if (!active) e.currentTarget.style.color = 'var(--foreground)'; }}
            onMouseOut={e => { if (!active) e.currentTarget.style.color = 'var(--muted)'; }}
        >
            {icon}
            {label}
        </button>
    );
}

function SettingRow({ title, description, children, isLast, vertical }: { title: string, description: string, children: React.ReactNode, isLast?: boolean, vertical?: boolean }) {
    return (
        <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', justifyContent: vertical ? 'flex-start' : 'space-between', alignItems: vertical ? 'flex-start' : 'center', gap: vertical ? '16px' : '32px', padding: '24px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
            <div style={{ width: vertical ? '100%' : 'auto', maxWidth: vertical ? '100%' : '60%' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--foreground)' }}>{title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: '1.4' }}>{description}</p>
            </div>
            <div style={{ width: vertical ? '100%' : 'auto' }}>
                {children}
            </div>
        </div>
    );
}

function PillSelector({ options, selected, onChange, disabled }: { options: string[], selected: string[], onChange: (s: string[]) => void, disabled: boolean }) {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            {options.map(opt => {
                const isActive = selected.includes(opt);
                return (
                    <button
                        key={opt}
                        disabled={disabled}
                        onClick={() => {
                            if (isActive) onChange(selected.filter(x => x !== opt));
                            else onChange([...selected, opt]);
                        }}
                        style={{
                            padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase',
                            cursor: disabled ? 'not-allowed' : 'pointer', border: '1px solid',
                            backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                            color: isActive ? 'white' : 'var(--muted)',
                            borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean, onChange: (c: boolean) => void, disabled?: boolean }) {
    return (
        <button
            disabled={disabled}
            onClick={() => onChange(!checked)}
            style={{
                width: '40px', height: '24px', borderRadius: '12px',
                backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
                border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
                position: 'relative', transition: 'background-color 0.2s',
                opacity: disabled ? 0.5 : 1
            }}
        >
            <div style={{
                width: '18px', height: '18px', borderRadius: '9px',
                backgroundColor: 'white', position: 'absolute', top: '3px',
                left: checked ? '19px' : '3px', transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} />
        </button>
    );
}

const FooterSaveActions = ({ onSave, isSaving, isAdmin, localSettings }: { onSave: any, isSaving: boolean, isAdmin: boolean, localSettings: any }) => (
    <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'flex-end' }}>
        {isAdmin && (
            <button disabled={isSaving} onClick={() => onSave(localSettings)} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                {isSaving ? 'Processing...' : <span><Save size={16} /> Save Changes</span>}
            </button>
        )}
    </div>
);

// ------------------------ Tab Components ------------------------

function RemindersTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SettingRow title="Reminder Timing" description="How far in advance should we send appointment reminders to patients?">
                <select className="search-input" value={localSettings.reminder_timing} disabled={!isAdmin} onChange={(e) => setLocalSettings({ ...localSettings, reminder_timing: e.target.value })}>
                    <option value="12h">12 hours before</option>
                    <option value="24h">24 hours before</option>
                    <option value="48h">48 hours before</option>
                    <option value="1w">1 week before</option>
                </select>
            </SettingRow>


            <FooterSaveActions onSave={onSave} isSaving={isSaving} isAdmin={isAdmin} localSettings={localSettings} />
        </div>
    );
}


function AutomationTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SettingRow title="Enable Follow-ups" description="Automatically send messages after appointments to gather feedback.">
                <ToggleSwitch checked={localSettings.followup_enabled} disabled={!isAdmin} onChange={(c) => setLocalSettings({ ...localSettings, followup_enabled: c })} />
            </SettingRow>

            {localSettings.followup_enabled && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                    <SettingRow title="Follow-up Timing" description="How long after the appointment should the system reach out?">
                        <select className="search-input" value={localSettings.followup_timing} disabled={!isAdmin} onChange={(e) => setLocalSettings({ ...localSettings, followup_timing: e.target.value })}>
                            <option value="1h">1 hour after</option>
                            <option value="4h">4 hours after</option>
                            <option value="1d">1 day after</option>
                            <option value="3d">3 days after</option>
                        </select>
                    </SettingRow>

                    <SettingRow title="Delivery Channels" description="The communication methods allowed for sending out follow-ups.">
                        <PillSelector options={['sms']} selected={localSettings.followup_channels} disabled={!isAdmin} onChange={(selected) => setLocalSettings({ ...localSettings, followup_channels: selected })} />
                    </SettingRow>


                </div>
            )}

            <FooterSaveActions onSave={onSave} isSaving={isSaving} isAdmin={isAdmin} localSettings={localSettings} />
        </div>
    );
}

function OperationsTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SettingRow title="After-Hours Behavior" description="How should the system respond to inbound calls when the clinic is closed?">
                <select className="search-input" value={localSettings.after_hours_behavior} disabled={!isAdmin} onChange={(e) => setLocalSettings({ ...localSettings, after_hours_behavior: e.target.value as any })}>
                    <option value="voicemail">Send to Voicemail</option>
                    <option value="callback">Offer Callback Request</option>
                    <option value="message">Provide Automated Message</option>
                </select>
            </SettingRow>


            <FooterSaveActions onSave={onSave} isSaving={isSaving} isAdmin={isAdmin} localSettings={localSettings} />
        </div>
    );
}

function SchedulingTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleAddType = () => {
        const newType = { id: Math.random().toString(36).substr(2, 9), name: 'New Procedure', duration: 30, color: '#3b82f6', pre_buffer: 5, post_buffer: 5 };
        setLocalSettings({ ...localSettings, appointment_types: [...localSettings.appointment_types, newType] });
    };
    const handleRemoveType = (id: string) => setLocalSettings({ ...localSettings, appointment_types: localSettings.appointment_types.filter(t => t.id !== id) });
    const handleUpdateType = (id: string, updates: any) => setLocalSettings({ ...localSettings, appointment_types: localSettings.appointment_types.map(t => t.id === id ? { ...t, ...updates } : t) });

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SettingRow title="Global Slot Duration" description="The foundational block of time interval your clinic schedules operate on.">
                <select className="search-input" value={localSettings.slot_duration} disabled={!isAdmin} onChange={(e) => setLocalSettings({ ...localSettings, slot_duration: parseInt(e.target.value) })}>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                </select>
            </SettingRow>
            <SettingRow title="Business Hours Matrix" description="Standard active working hours for the clinic throughout the week." isLast vertical>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', width: '100%' }}>
                    {Object.entries(localSettings.business_hours).map(([day, hours]: [string, any]) => (
                        <div key={day} style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px', opacity: hours.enabled ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', textTransform: 'capitalize', fontSize: '13px' }}>{day}</span>
                                <ToggleSwitch checked={hours.enabled} disabled={!isAdmin} onChange={(c) => {
                                    const newHours = { ...localSettings.business_hours, [day]: { ...hours, enabled: c } };
                                    setLocalSettings({ ...localSettings, business_hours: newHours });
                                }} />
                            </div>
                            {hours.enabled && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input type="time" className="search-input" style={{ fontSize: '12px', padding: '6px' }} value={hours.open} disabled={!isAdmin} onChange={(e) => {
                                        const newHours = { ...localSettings.business_hours, [day]: { ...hours, open: e.target.value } };
                                        setLocalSettings({ ...localSettings, business_hours: newHours });
                                    }} />
                                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>→</span>
                                    <input type="time" className="search-input" style={{ fontSize: '12px', padding: '6px' }} value={hours.close} disabled={!isAdmin} onChange={(e) => {
                                        const newHours = { ...localSettings.business_hours, [day]: { ...hours, close: e.target.value } };
                                        setLocalSettings({ ...localSettings, business_hours: newHours });
                                    }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SettingRow>
            <SettingRow title="Appointment Library Defaults" description="Manage treatment types, their intrinsic duration, visual colors, and prep/cleanup intervals." isLast vertical>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', width: '100%' }}>
                    {isAdmin && <button onClick={handleAddType} className="btn"><Plus size={14} /> Add New Procedure</button>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    {localSettings.appointment_types.map((type: any) => (
                        <div key={type.id} style={{ padding: '16px', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                            <div style={{ width: '8px', alignSelf: 'stretch', borderRadius: '4px', backgroundColor: type.color }} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', flex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '0.05em' }}>NAME</label>
                                    <input type="text" className="search-input" style={{ fontSize: '13px', height: '32px' }} value={type.name} disabled={!isAdmin} onChange={(e) => handleUpdateType(type.id, { name: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '0.05em' }}>DURATION (MIN)</label>
                                    <input type="number" className="search-input" style={{ fontSize: '13px', height: '32px' }} value={type.duration} disabled={!isAdmin} onChange={(e) => handleUpdateType(type.id, { duration: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '0.05em' }}>COLOR TAG</label>
                                    <input type="color" style={{ width: '100%', height: '32px', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'transparent' }} value={type.color} disabled={!isAdmin} onChange={(e) => handleUpdateType(type.id, { color: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '10px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '0.05em' }}>BUFFER PRE / POST</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="number" placeholder="Pre" className="search-input" style={{ fontSize: '12px', height: '32px' }} value={type.pre_buffer} disabled={!isAdmin} onChange={(e) => handleUpdateType(type.id, { pre_buffer: parseInt(e.target.value) || 0 })} />
                                        <input type="number" placeholder="Post" className="search-input" style={{ fontSize: '12px', height: '32px' }} value={type.post_buffer} disabled={!isAdmin} onChange={(e) => handleUpdateType(type.id, { post_buffer: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                            </div>
                            {isAdmin && (
                                <button onClick={() => handleRemoveType(type.id)} className="btn" style={{ color: '#ef4444', padding: '6px', backgroundColor: 'transparent', alignSelf: 'center' }}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </SettingRow>

            <FooterSaveActions onSave={onSave} isSaving={isSaving} isAdmin={isAdmin} localSettings={localSettings} />
        </div>
    );
}
