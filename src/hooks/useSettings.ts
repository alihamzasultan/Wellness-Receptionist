import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const SETTINGS_STORAGE_KEY = 'clinic_settings_v1';
const SETTINGS_TABLE = 'clinic_settings';

export interface ClinicSettings {
    id?: string;
    reminder_timing: string;
    reminder_channels: string[];
    reminder_template: string;
    followup_timing: string;
    followup_channels: string[];
    followup_template: string;
    followup_enabled: boolean;
    business_hours: any;
    after_hours_behavior: 'voicemail' | 'callback' | 'message';
    holidays: string[];
    appointment_types: {
        id: string;
        name: string;
        duration: number;
        color: string;
        pre_buffer?: number;
        post_buffer?: number;
    }[];
    slot_duration: number;
    buffer_time: number;
}

const DEFAULT_SETTINGS: ClinicSettings = {
    reminder_timing: '24h',
    reminder_channels: ['sms', 'email'],
    reminder_template: '',
    followup_timing: '1d',
    followup_channels: ['sms'],
    followup_template: '',
    followup_enabled: true,
    business_hours: {
        monday:    { open: '08:00', close: '18:00', enabled: true },
        tuesday:   { open: '08:00', close: '18:00', enabled: true },
        wednesday: { open: '08:00', close: '18:00', enabled: true },
        thursday:  { open: '08:00', close: '18:00', enabled: true },
        friday:    { open: '08:00', close: '18:00', enabled: true },
        saturday:  { open: '09:00', close: '14:00', enabled: true },
        sunday:    { open: '00:00', close: '00:00', enabled: false },
    },
    after_hours_behavior: 'callback',
    holidays: [],
    appointment_types: [],
    slot_duration: 15,
    buffer_time: 10,
};

export function useSettings() {
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Try Supabase first
            const { data, error: supabaseError } = await supabase
                .from(SETTINGS_TABLE)
                .select('*')
                .limit(1)
                .maybeSingle();

            if (!supabaseError && data) {
                // Merge with defaults to ensure all fields exist
                const merged: ClinicSettings = {
                    ...DEFAULT_SETTINGS,
                    ...data,
                    business_hours: {
                        ...DEFAULT_SETTINGS.business_hours,
                        ...(data.business_hours || {}),
                    },
                    appointment_types: data.appointment_types || DEFAULT_SETTINGS.appointment_types,
                    reminder_channels: data.reminder_channels || DEFAULT_SETTINGS.reminder_channels,
                    followup_channels: data.followup_channels || DEFAULT_SETTINGS.followup_channels,
                    holidays: data.holidays || [],
                };
                setSettings(merged);
                setError(null);
                return;
            }

            if (supabaseError) {
                console.warn('clinic_settings table not found or error, falling back to localStorage:', supabaseError.message);
            }

            // 2. Fallback: localStorage
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    business_hours: { ...DEFAULT_SETTINGS.business_hours, ...(parsed.business_hours || {}) },
                    appointment_types: parsed.appointment_types || DEFAULT_SETTINGS.appointment_types,
                });
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
        } catch (err: any) {
            console.error('Error loading settings:', err);
            setError(err.message);
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (updates: Partial<ClinicSettings>) => {
        const next = { ...(settings || DEFAULT_SETTINGS), ...updates };
        try {
            // Try to upsert to Supabase
            const { error: supabaseError } = await supabase
                .from(SETTINGS_TABLE)
                .upsert({ ...next, id: settings?.id || undefined }, { onConflict: 'id' });

            if (supabaseError) {
                console.warn('Could not save to Supabase, saving to localStorage:', supabaseError.message);
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            }

            setSettings(next);
            return { error: null };
        } catch (err: any) {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            setSettings(next);
            return { error: err };
        }
    };

    return { settings, loading, error, updateSettings, refresh: fetchSettings };
}
