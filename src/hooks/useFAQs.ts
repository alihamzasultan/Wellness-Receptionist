import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FAQEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    last_updated: string;
}

export function useFAQs() {
    const [faqs, setFaqs] = useState<FAQEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFAQs = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('FAQs table may not exist, using demo data');
                setFaqs([
                ]);
            } else {
                const mappedData = data?.map(item => ({
                    id: String(item.id),
                    question: item.question,
                    answer: item.answer,
                    category: 'General',
                    last_updated: item.created_at
                })) || [];
                setFaqs(mappedData);
            }
        } catch (err: any) {
            console.error('Error fetching FAQs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFAQs();
    }, [fetchFAQs]);

    const saveFAQ = async (faq: Partial<FAQEntry>) => {
        const isNew = !faq.id;

        // Remove any special characters, only allowing alphabets, numbers, commas, full stops, and spaces/newlines
        const sanitize = (text?: string) => {
            if (!text) return '';
            return text.replace(/[^a-zA-Z0-9., \n\r]/g, '');
        };

        const entry = {
            question: sanitize(faq.question),
            answer: sanitize(faq.answer)
        };

        let result;
        if (isNew) {
            result = await supabase.from('knowledge_base').insert([entry]).select();
        } else {
            result = await supabase.from('knowledge_base').update(entry).eq('id', faq.id).select();
        }

        if (!result.error) {
            fetchFAQs();
        }
        return result;
    };

    const deleteFAQ = async (id: string) => {
        const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
        if (!error) {
            setFaqs(curr => curr.filter(f => f.id !== id));
        }
        return { error };
    };

    return { faqs, loading, error, refresh: fetchFAQs, saveFAQ, deleteFAQ };
}
