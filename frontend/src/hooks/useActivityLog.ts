import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import config from '@/config';

export interface ActivityLogEvent {
  type: 'info' | 'prompt' | 'response' | 'processing' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}



export const useActivityLog = (projectId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [activities, setActivities] = useState<ActivityLogEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Connect to socket server
  useEffect(() => {
    const socketInstance = io(config.socket.url);
    
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  // Listen for activity events for this project
  useEffect(() => {
    if (!socket || !projectId) return;
    
    const activityChannel = `activity:${projectId}`;
    
    const handleActivity = (event: ActivityLogEvent) => {
      setActivities(prev => [...prev, event]);
      
      // Update processing status based on events
      if (event.type === 'info' && event.message === 'Starting user story generation process') {
        setIsProcessing(true);
      } else if (event.type === 'info' && event.message === 'Generation complete') {
        setIsProcessing(false);
      } else if (event.type === 'error') {
        setIsProcessing(false);
      }
    };
    
    socket.on(activityChannel, handleActivity);
    
    return () => {
      socket.off(activityChannel, handleActivity);
    };
  }, [socket, projectId]);
  
  const clearActivities = () => {
    setActivities([]);
  };
  
  return {
    connected,
    activities,
    isProcessing,
    clearActivities
  };
};
