import { getSupabase } from './database';

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  date: string;
  impact?: 'minor' | 'major' | 'critical';
  impactPercentage?: number;
  affectedComponent?: 'All Systems' | 'Core Application' | 'Database Clusters' | 'API Endpoints' | 'Background Workers' | string;
}

let inMemoryIncidents: SystemIncident[] = [];
try {
  const data = localStorage.getItem('system_incidents');
  if (data) inMemoryIncidents = JSON.parse(data);
} catch (e) {}

const saveFallback = () => {
  localStorage.setItem('system_incidents', JSON.stringify(inMemoryIncidents));
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('incidents_updated'));
}

export const getIncidents = async (): Promise<SystemIncident[]> => {
  const supabase = getSupabase();
  if (!supabase) {
    return inMemoryIncidents.map(item => ({
      ...item,
      affectedComponent: item.affectedComponent || (item as any).affected_component || 'All Systems',
      impact: item.impact || (item as any).impact_level || 'minor'
    }));
  }
  
  try {
    const { data, error } = await supabase.from('system_incidents').select('*').order('date', { ascending: false });
    if (error) {
       const msg = error.message || String(error);
       if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
          console.warn("DB fetch failed for incidents (Network issue), using fallback:", msg);
       } else {
          console.error("DB fetch failed for incidents, using fallback:", error);
       }
       return inMemoryIncidents.map(item => ({
         ...item,
         affectedComponent: item.affectedComponent || (item as any).affected_component || 'All Systems',
         impact: item.impact || (item as any).impact_level || 'minor'
       }));
    }

    const rawData = (data && data.length > 0) ? data : inMemoryIncidents;
    const normalized: SystemIncident[] = rawData.map((item: any) => {
      const imp = item.impact || item.impact_level || 'minor';
      const defaultPerc = imp === 'critical' ? 2.5 : imp === 'major' ? 1.2 : 0.5;
      return {
        id: item.id || crypto.randomUUID(),
        title: item.title || 'Untitled Incident',
        description: item.description || '',
        status: item.status || 'investigating',
        date: item.date || new Date().toISOString(),
        impact: imp,
        impactPercentage: typeof item.impactPercentage === 'number' ? item.impactPercentage : (typeof item.impact_percentage === 'number' ? item.impact_percentage : defaultPerc),
        affectedComponent: item.affectedComponent || item.affected_component || 'All Systems'
      };
    });

    // Keep fallback synced
    inMemoryIncidents = normalized;
    localStorage.setItem('system_incidents', JSON.stringify(inMemoryIncidents));

    return normalized;
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
       console.warn("DB fetch exception (Network issue):", msg);
    } else {
       console.error("DB fetch exception:", e);
    }
    return inMemoryIncidents.map(item => ({
      ...item,
      affectedComponent: item.affectedComponent || (item as any).affected_component || 'All Systems',
      impact: item.impact || (item as any).impact_level || 'minor',
      impactPercentage: item.impactPercentage || (item.impact === 'critical' ? 2.5 : item.impact === 'major' ? 1.2 : 0.5)
    }));
  }
};

export const addIncident = async (incident: SystemIncident): Promise<void> => {
  inMemoryIncidents = [incident, ...inMemoryIncidents];
  saveFallback();

  const supabase = getSupabase();
  if (!supabase) return;
  try {
      const { error } = await supabase.from('system_incidents').insert([incident]);
      if (error) {
          const msg = error.message || String(error);
          if (error.code === 'PGRST204' || msg.includes('affectedComponent') || msg.includes('impactPercentage')) {
              // Retry without extra columns if not in Supabase schema
              const { affectedComponent, impactPercentage, ...rest } = incident;
              await supabase.from('system_incidents').insert([rest]);
          } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
              console.warn("Error inserting incident (network):", msg);
          } else {
              console.error("Error inserting incident:", error);
          }
      }
  } catch(e: any) {
      const msg = e?.message || String(e);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
          console.warn("Error inserting incident exception (network):", msg);
      } else {
          console.error(e);
      }
  }
};

export const updateIncident = async (id: string, updates: Partial<SystemIncident>): Promise<void> => {
  inMemoryIncidents = inMemoryIncidents.map(i => i.id === id ? { ...i, ...updates } : i);
  saveFallback();

  const supabase = getSupabase();
  if (!supabase) return;
  try {
      const { error } = await supabase.from('system_incidents').update(updates).eq('id', id);
      if (error) {
          const msg = error.message || String(error);
          if (error.code === 'PGRST204' || msg.includes('affectedComponent') || msg.includes('impactPercentage')) {
              // Retry without extra columns if not in Supabase schema
              const { affectedComponent, impactPercentage, ...rest } = updates;
              if (Object.keys(rest).length > 0) {
                  await supabase.from('system_incidents').update(rest).eq('id', id);
              }
          } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
              console.warn("Error updating incident (network):", msg);
          } else {
              console.error("Error updating incident:", error);
          }
      }
  } catch(e: any) {
      const msg = e?.message || String(e);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
          console.warn("Error updating incident exception (network):", msg);
      } else {
          console.error(e);
      }
  }
};

export const deleteIncident = async (id: string): Promise<void> => {
  inMemoryIncidents = inMemoryIncidents.filter(i => i.id !== id);
  saveFallback();

  const supabase = getSupabase();
  if (!supabase) return;
  try {
      const { error } = await supabase.from('system_incidents').delete().eq('id', id);
      if (error) {
          const msg = error.message || String(error);
          if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
              console.warn("Error deleting incident (network):", msg);
          } else {
              console.error("Error deleting incident:", error);
          }
      }
  } catch(e: any) {
      const msg = e?.message || String(e);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
          console.warn("Error deleting incident exception (network):", msg);
      } else {
          console.error(e);
      }
  }
};