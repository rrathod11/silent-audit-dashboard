import { createContext, useContext, useState } from 'react';
import { supabase, handleSupabaseError } from '../supabaseClient';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch logs with pagination and filters
  const fetchLogs = async ({ 
    page = 1, 
    pageSize = 10, 
    deviceId = null, 
    startDate = null, 
    endDate = null,
    searchQuery = null,
    sortBy = 'timestamp',
    sortDirection = 'desc'
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('logs')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortDirection === 'asc' });
      
      // Apply filters
      if (deviceId) {
        query = query.eq('device_key', deviceId);
      }
      
      if (startDate && endDate) {
        query = query.gte('timestamp', startDate).lte('timestamp', endDate);
      }
      
      // Pagination
      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Client-side search filtering
      let filteredData = data;
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        filteredData = data.filter(
          log =>
            log.active_app?.toLowerCase().includes(lower) ||
            log.browser_url?.toLowerCase().includes(lower)
        );
      }
      
      return { 
        data: filteredData,
        count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      };
    } catch (error) {
      const formattedError = handleSupabaseError(error);
      setError(formattedError);
      console.error('Error fetching logs:', error);
      return { data: [], count: 0, page, pageSize, totalPages: 0, error: formattedError };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unique device IDs
  const fetchDeviceIds = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('logs')
        .select('device_key')
        .neq('device_key', '')
        .limit(500);
      
      if (error) {
        throw error;
      }
      
      const uniqueDeviceIds = [...new Set(data.map(item => item.device_key))];
      return uniqueDeviceIds;
    } catch (error) {
      const formattedError = handleSupabaseError(error);
      setError(formattedError);
      console.error('Error fetching device IDs:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch device locations
  const fetchDeviceLocations = async (limit = 100) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('logs')
        .select('device_key, location_data')
        .not('location_data', 'is', null)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      const locations = data.map(log => ({
        device_id: log.device_key,
        latitude: log.location_data?.latitude || 0,
        longitude: log.location_data?.longitude || 0,
        city: log.location_data?.city || 'Unknown'
      }));
      
      return locations;
    } catch (error) {
      const formattedError = handleSupabaseError(error);
      setError(formattedError);
      console.error('Error fetching device locations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch suspicious activities
  const fetchSuspiciousActivities = async (limit = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('is_suspicious', true)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      const activities = data.map(log => ({
        id: log.id,
        title: log.suspicious_reasons?.join(', ') || 'Suspicious activity',
        device_id: log.device_key,
        timestamp: new Date(log.timestamp).toLocaleString()
      }));
      
      return activities;
    } catch (error) {
      const formattedError = handleSupabaseError(error);
      setError(formattedError);
      console.error('Error fetching suspicious activities:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  const subscribeToLogs = (callback) => {
    const subscription = supabase
      .channel('logs-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
        callback(payload);
      })
      .subscribe();
    
    return () => supabase.removeChannel(subscription);
  };

  const value = {
    isLoading,
    error,
    fetchLogs,
    fetchDeviceIds,
    fetchDeviceLocations,
    fetchSuspiciousActivities,
    subscribeToLogs
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 