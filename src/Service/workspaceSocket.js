// File: /src/services/workspaceSocket.js
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class WorkspaceSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {
      message: [],
      file: [],
      milestone: [],
      payment: [],
      meeting: [],
      notification: [],
      typing: [],
      userStatus: [],
      connection: []
    };
    this.workspaceId = null;
    this.userId = null;
  }

  /**
   * Connect to workspace WebSocket
   */
  connect(workspaceId, userId, token) {
    this.workspaceId = workspaceId;
    this.userId = userId;

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    console.log('🔌 Connecting to workspace:', workspaceId);
    
    this.socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      query: { workspaceId, userId, type: 'workspace' }
    });

    // Core connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected, joining workspace:', workspaceId);
      this.socket.emit('join_workspace', { workspaceId, userId });
      this.emitToListeners('connection', true);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      this.emitToListeners('connection', false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    // ===== MESSAGING EVENTS =====
    this.socket.on('new_message', (message) => {
      console.log('📨 New message:', message);
      this.emitToListeners('message', message);
    });

    this.socket.on('typing_indicator', (data) => {
      this.emitToListeners('typing', data);
    });

    this.socket.on('message_read', (data) => {
      this.emitToListeners('message', { type: 'read', ...data });
    });

    // ===== FILE EVENTS =====
    this.socket.on('new_file', (file) => {
      console.log('📁 New file:', file.name);
      this.emitToListeners('file', file);
    });

    this.socket.on('file_deleted', (fileId) => {
      this.emitToListeners('file', { type: 'deleted', fileId });
    });

    // ===== MILESTONE EVENTS =====
    this.socket.on('milestone_submitted', (milestone) => {
      console.log('📋 Milestone submitted:', milestone.title);
      this.emitToListeners('milestone', { type: 'submitted', ...milestone });
    });

    this.socket.on('milestone_approved', (data) => {
      console.log('✅ Milestone approved:', data.milestoneId);
      this.emitToListeners('milestone', { type: 'approved', ...data });
      this.emitToListeners('notification', {
        type: 'milestone_approved',
        title: 'Milestone Approved!',
        message: `Milestone "${data.title}" has been approved`,
        data
      });
    });

    this.socket.on('milestone_changes_requested', (data) => {
      console.log('✏️ Changes requested:', data.milestoneId);
      this.emitToListeners('milestone', { type: 'changes_requested', ...data });
      this.emitToListeners('notification', {
        type: 'milestone_revision',
        title: 'Changes Requested',
        message: `Changes requested for "${data.title}"`,
        data
      });
    });

    this.socket.on('milestone_paid', (data) => {
      console.log('💰 Milestone paid:', data.milestoneId);
      this.emitToListeners('milestone', { type: 'paid', ...data });
      this.emitToListeners('payment', data);
      this.emitToListeners('notification', {
        type: 'payment_received',
        title: 'Payment Received!',
        message: `Payment for "${data.title}" has been processed`,
        data
      });
    });

    // ===== PAYMENT EVENTS =====
    this.socket.on('payment_made', (payment) => {
      console.log('💰 Payment made:', payment.amount);
      this.emitToListeners('payment', payment);
    });

    this.socket.on('payment_failed', (payment) => {
      this.emitToListeners('payment', { type: 'failed', ...payment });
    });

    // ===== MEETING EVENTS =====
    this.socket.on('meeting_scheduled', (meeting) => {
      console.log('📅 Meeting scheduled:', meeting.title);
      this.emitToListeners('meeting', { type: 'scheduled', ...meeting });
      this.emitToListeners('notification', {
        type: 'meeting_scheduled',
        title: 'Meeting Scheduled',
        message: `Meeting "${meeting.title}" scheduled for ${new Date(meeting.scheduledTime).toLocaleString()}`,
        data: meeting
      });
    });

    this.socket.on('call_invitation', (call) => {
      console.log('📞 Call invitation:', call.fromUserName);
      this.emitToListeners('meeting', { type: 'invitation', ...call });
      
      // Show notification to user
      if (window.confirm(`${call.fromUserName} is inviting you to a video call. Join now?`)) {
        window.open(call.meetingLink, '_blank');
      }
    });

    this.socket.on('call_ended', (data) => {
      this.emitToListeners('meeting', { type: 'ended', ...data });
    });

    // ===== NOTIFICATION & USER STATUS =====
    this.socket.on('notification', (notification) => {
      console.log('🔔 Notification:', notification.title);
      this.emitToListeners('notification', notification);
    });

    this.socket.on('user_online', (user) => {
      console.log('🟢 User online:', user.userName);
      this.emitToListeners('userStatus', { user, online: true });
    });

    this.socket.on('user_offline', (user) => {
      console.log('🔴 User offline:', user.userName);
      this.emitToListeners('userStatus', { user, online: false });
    });

    return this.socket;
  }

  /**
   * Send message to workspace
   */
  sendMessage(messageData) {
    if (this.isConnected()) {
      this.socket.emit('send_message', {
        ...messageData,
        workspaceId: this.workspaceId,
        senderId: this.userId
      });
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(isTyping, userName) {
    if (this.isConnected()) {
      this.socket.emit('typing', {
        workspaceId: this.workspaceId,
        userId: this.userId,
        userName,
        isTyping
      });
    }
  }

  /**
   * Submit milestone work
   */
  submitMilestone(milestoneData) {
    if (this.isConnected()) {
      this.socket.emit('submit_milestone', {
        ...milestoneData,
        workspaceId: this.workspaceId,
        freelancerId: this.userId
      });
    }
  }

  /**
   * Approve milestone
   */
  approveMilestone(milestoneId, feedback = '') {
    if (this.isConnected()) {
      this.socket.emit('approve_milestone', {
        workspaceId: this.workspaceId,
        milestoneId,
        feedback,
        approverId: this.userId
      });
    }
  }

  /**
   * Request milestone changes
   */
  requestMilestoneChanges(milestoneId, feedback) {
    if (this.isConnected()) {
      this.socket.emit('request_milestone_changes', {
        workspaceId: this.workspaceId,
        milestoneId,
        feedback,
        requesterId: this.userId
      });
    }
  }

  /**
   * Upload file notification
   */
  uploadFile(fileData) {
    if (this.isConnected()) {
      this.socket.emit('upload_file', {
        ...fileData,
        workspaceId: this.workspaceId,
        uploaderId: this.userId
      });
    }
  }

  /**
   * Schedule meeting
   */
  scheduleMeeting(meetingData) {
    if (this.isConnected()) {
      this.socket.emit('schedule_meeting', {
        ...meetingData,
        workspaceId: this.workspaceId,
        schedulerId: this.userId
      });
    }
  }

  /**
   * Send call invitation
   */
  inviteToCall(callData) {
    if (this.isConnected()) {
      this.socket.emit('call_invitation', {
        ...callData,
        workspaceId: this.workspaceId,
        fromUserId: this.userId
      });
    }
  }

  /**
   * Make payment notification
   */
  makePayment(paymentData) {
    if (this.isConnected()) {
      this.socket.emit('make_payment', {
        ...paymentData,
        workspaceId: this.workspaceId,
        payerId: this.userId
      });
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Helper to emit to all listeners of a type
   */
  emitToListeners(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting from workspace:', this.workspaceId);
      this.socket.emit('leave_workspace', {
        workspaceId: this.workspaceId,
        userId: this.userId
      });
      this.socket.disconnect();
      this.socket = null;
      
      // Clear all listeners
      Object.keys(this.listeners).forEach(key => {
        this.listeners[key] = [];
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }

  /**
   * Get current workspace ID
   */
  getWorkspaceId() {
    return this.workspaceId;
  }

  /**
   * Get current user ID
   */
  getUserId() {
    return this.userId;
  }
}

// Singleton instance
export const workspaceSocket = new WorkspaceSocketService();