import { getSupabase } from './database';

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  date: string;
  impact?: 'minor' | 'major' | 'critical';
}

let inMemoryIncidents: SystemIncident[] = [];
try {
  const data = localStorage.getItem('system_incidents');
  if (data) inMemoryIncidents = JSON.parse(data);
} catch (e) {}

const saveFallback = () => {
  localStorage.setItem('system_incidents', JSON.stringify(inMemoryIncidents));
  window.dispatchEvent(new Event('storage'));
}

export const getIncidents = async (): Promise<SystemIncident[]> => {
  const supabase = getSupabase();
  if (!supabase) return inMemoryIncidents;
  
  try {
    const { data, error } = await supabase.from('system_incidents').select('*').order('date', { ascending: false });
    if (error) {
       console.error("DB fetch failed for incidents, using fallback", error);
       return inMemoryIncidents;
    }
    // If DB is empty but we have local backup, use local backup temporarily 
    // (helps when table was just created)
    if ((!data || data.length === 0) && inMemoryIncidents.length > 0) {
        return inMemoryIncidents;
    }
    return data || [];
  } catch (e) {
    console.error("DB fetch exception:", e);
    return inMemoryIncidents;
  }
};

export const addIncident = async (incident: SystemIncident): Promise<void> => {
  inMemoryIncidents = [incident, ...inMemoryIncidents];
  saveFallback();

  const supabase = getSupabase();
  if (!supabase) return;
  try {
      const { error } = await supabase.from('system_incidents').insert([incident]);
      if (error) console.error("Error inserting incident:", error);
  } catch(e) {
      console.error(e);
  }
};

export const updateIncident = async (id: string, updates: Partial<SystemIncident>): Promise<void> => {
  inMemoryIncidents = inMemoryIncidents.map(i => i.id === id ? { ...i, ...updates } : i);
  saveFallback();

  const supabase = getSupabase();
  if (!supabase) return;
  try {
      const { error } = await supabase.from('system_incidents').update(updates).eq('id', id);
      if (error) console.error("Error updating incident:", error);
  } catch(e) {
      console.error(e);
  }
};

export const deleteIncident = async (id: string): Promise<void> => {
  inMemoryIncidents = inMemoryIncidents.filter(i => i.id !== id);
  saveFallback();

  const supabase = getSupabase();
  if (!supabase) return;
  try {
      const { error } = await supabase.from('system_incidents').delete().eq('id', id);
      if (error) console.error("Error deleting incident:", error);
  } catch(e) {
      console.error(e);
  }
};