import { io } from 'socket.io-client';
import { ONLINE_SOCKET_PORT } from './online-constants.js';

const SESSION_KEY = 'ssa-online-session-id';
const DEFAULT_SOCKET_URL = `http://star-war.westcat.cn`;

function getSessionId() {
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = (window.crypto?.randomUUID?.() || `ssa-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

function resolveServerUrl() {
  return DEFAULT_SOCKET_URL;
}

export class NetworkClient {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.socket = null;
    this.playerSlotId = null;
    this.roomId = null;
    this.sessionId = getSessionId();
    this.handlePageHide = () => this.leave();
  }

  connect() {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(resolveServerUrl(), {
      autoConnect: true,
      closeOnBeforeunload: true,
      reconnection: true,
      reconnectionDelay: 600,
      reconnectionDelayMax: 2200,
      timeout: 7000,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.callbacks.onConnection?.('connected');
      this.socket.emit('match:join', { sessionId: this.sessionId });
    });

    this.socket.on('disconnect', (reason) => {
      this.callbacks.onConnection?.('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.callbacks.onConnection?.('error', error?.message || 'Unable to connect');
    });

    this.socket.on('match:joined', (payload) => {
      this.playerSlotId = payload.slotId;
      this.roomId = payload.roomId;
      this.callbacks.onJoined?.(payload);
    });

    this.socket.on('match:status', (payload) => {
      this.callbacks.onStatus?.(payload);
    });

    this.socket.on('match:snapshot', (payload) => {
      this.callbacks.onSnapshot?.(payload);
    });

    window.addEventListener('pagehide', this.handlePageHide);
    window.addEventListener('beforeunload', this.handlePageHide);

    return this.socket;
  }

  sendInput(input) {
    if (!this.socket?.connected) return;
    this.socket.emit('match:input', input);
  }

  disconnect() {
    if (!this.socket) return;
    window.removeEventListener('pagehide', this.handlePageHide);
    window.removeEventListener('beforeunload', this.handlePageHide);
    this.socket.disconnect();
    this.socket = null;
    this.playerSlotId = null;
    this.roomId = null;
  }

  leave() {
    if (!this.socket) return;
    if (this.socket.connected) {
      this.socket.emit('match:leave');
    }
    this.disconnect();
  }
}
