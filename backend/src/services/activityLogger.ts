import { io } from '../index';

export enum ActivityType {
  INFO = 'info',
  PROMPT = 'prompt',
  RESPONSE = 'response',
  PROCESSING = 'processing',
  ERROR = 'error'
}

export interface ActivityLogEvent {
  type: ActivityType;
  message: string;
  data?: any;
  timestamp: string;
}

export class ActivityLogger {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * Log an activity event and emit it via socket.io
   */
  log(type: ActivityType, message: string, data?: any) {
    const event: ActivityLogEvent = {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Emit to project-specific room
    io.emit(`activity:${this.projectId}`, event);
    
    // Log to console for debugging
    console.log(`[${this.projectId}] ${type.toUpperCase()}: ${message}`);
    
    return event;
  }

  info(message: string, data?: any) {
    return this.log(ActivityType.INFO, message, data);
  }

  prompt(message: string, data?: any) {
    return this.log(ActivityType.PROMPT, message, data);
  }

  response(message: string, data?: any) {
    return this.log(ActivityType.RESPONSE, message, data);
  }

  processing(message: string, data?: any) {
    return this.log(ActivityType.PROCESSING, message, data);
  }

  error(message: string, data?: any) {
    return this.log(ActivityType.ERROR, message, data);
  }
}
