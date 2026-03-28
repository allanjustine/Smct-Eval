// src/hooks/useRealtimeUpdates.ts
// WebSocket-based real-time updates for Reverb-style architecture

import { useEffect, useRef, useCallback } from 'react';
import { mutate } from 'swr';
import { EvaluationRecord } from '@/lib/evaluationRecordsService';
import { CONFIG } from '../../config/config';

export interface RealtimeUpdate {
  type: 'evaluation_created' | 'evaluation_updated' | 'evaluation_deleted' | 'approval_added';
  record: EvaluationRecord;
  timestamp: string;
  userId?: string;
}

export interface RealtimeConnection {
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessage?: RealtimeUpdate;
}

// WebSocket hook for real-time evaluation updates
export const useRealtimeEvaluationUpdates = (
  enabled: boolean = true,
  url?: string
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Convert API URL to WebSocket URL
      const getWebSocketUrl = () => {
        if (url) return url;
        
        const apiUrl = CONFIG.API_URL;
        if (!apiUrl) {
          console.warn('API_URL not configured, falling back to localhost');
          return 'ws://localhost:3001/evaluations';
        }
        
        // Convert http:// or https:// to ws:// or wss://
        const wsUrl = apiUrl
          .replace(/^http:/, 'ws:')
          .replace(/^https:/, 'wss:');
        
        // Append /evaluations endpoint
        return `${wsUrl}/evaluations`;
      };
      
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected for evaluation updates');
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          handleRealtimeUpdate(update);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [enabled, url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
  }, []);

  const handleRealtimeUpdate = useCallback((update: RealtimeUpdate) => {
    console.log('Received realtime update:', update);

    switch (update.type) {
      case 'evaluation_created':
      case 'evaluation_updated':
        // Update the specific record in cache
        mutate(
          (key) => {
            if (typeof key === 'string' && key.startsWith('evaluation-record-')) {
              const recordId = key.split('-').pop();
              return recordId === update.record.id.toString();
            }
            return false;
          },
          update.record,
          false
        );

        // Update the records list
        mutate(
          'evaluation-records',
          (currentData: EvaluationRecord[] | undefined) => {
            if (!currentData) return currentData;
            
            const existingIndex = currentData.findIndex(r => r.id === update.record.id);
            if (existingIndex >= 0) {
              // Update existing record
              const newData = [...currentData];
              newData[existingIndex] = update.record;
              return newData;
            } else if (update.type === 'evaluation_created') {
              // Add new record
              return [...currentData, update.record];
            }
            return currentData;
          },
          false
        );

        // Update stats
        mutate('evaluation-records-stats');
        break;

      case 'evaluation_deleted':
        // Remove from records list
        mutate(
          'evaluation-records',
          (currentData: EvaluationRecord[] | undefined) => 
            currentData?.filter(record => record.id !== update.record.id),
          false
        );

        // Remove from individual record cache
        mutate(`evaluation-record-${update.record.id}`, null, false);
        
        // Update stats
        mutate('evaluation-records-stats');
        break;

      case 'approval_added':
        // Update the specific record with new approval
        mutate(
          `evaluation-record-${update.record.id}`,
          update.record,
          false
        );

        // Update in records list
        mutate(
          'evaluation-records',
          (currentData: EvaluationRecord[] | undefined) => {
            if (!currentData) return currentData;
            
            return currentData.map(record => 
              record.id === update.record.id ? update.record : record
            );
          },
          false
        );

        // Update approval history
        mutate(`approval-history-${update.record.id}`);
        break;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttemptsRef.current,
    connect,
    disconnect,
  };
};

// Hook for manual real-time updates (for testing or fallback)
export const useManualRealtimeUpdate = () => {
  const triggerUpdate = useCallback((update: RealtimeUpdate) => {
    // Manually trigger the same update logic
    mutate(
      'evaluation-records',
      (currentData: EvaluationRecord[] | undefined) => {
        if (!currentData) return currentData;
        
        switch (update.type) {
          case 'evaluation_created':
            return [...currentData, update.record];
          case 'evaluation_updated':
            return currentData.map(record => 
              record.id === update.record.id ? update.record : record
            );
          case 'evaluation_deleted':
            return currentData.filter(record => record.id !== update.record.id);
          case 'approval_added':
            return currentData.map(record => 
              record.id === update.record.id ? update.record : record
            );
          default:
            return currentData;
        }
      },
      false
    );

    // Update stats
    mutate('evaluation-records-stats');
  }, []);

  return { triggerUpdate };
};

// Hook for connection status and debugging
export const useRealtimeConnectionStatus = () => {
  const { isConnected, reconnectAttempts } = useRealtimeEvaluationUpdates();
  
  return {
    isConnected,
    reconnectAttempts,
    status: isConnected ? 'connected' : 'disconnected',
  };
};
