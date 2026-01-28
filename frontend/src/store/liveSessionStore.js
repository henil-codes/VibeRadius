import { create } from "zustand";

const useLiveSessionStore = create((set, get) => ({
  currentSession: null,
  sessionCode: null,
  isConnected: false,
  isJoining: false,
  joinError: null,

  participants: [],
  participantCount: 0,

  isHost: false,
  hostId: null,

  sessionStatus: "idle",

  currentTrack: null,
  queue: [],
  upNext: null,
  isPlaying: false,

  stats: {
    listeners: 0,
    inQueue: 0,
    estimatedWait: 0,
  },

  setCurrentSession: (session) => {
    set({
      currentSession: session,
      sessionCode: session.session_code,
      participantCount: session.participants?.length || 0,
      participants: session.participants || [],
      hostId: session.created_by,
      sessionStatus: session.status || "active",
      stats: {
        listeners: session.participants?.length || 0,
        inQueue: 0,
        estimatedWait: 0,
      },
    });
  },

  setSessionCode: (code) => set({ sessionCode: code }),

  setConnected: (isConnected) => set({ isConnected }),

  setJoining: (isJoining) => set({ isJoining }),
  setJoinError: (error) => set({ joinError: error }),

  setSessionData: (data) => {
    set({
      currentSession: data.session,
      sessionCode: data.session.code,
      hostId: data.session.hostId,
      sessionStatus: data.session.status,
      currentTrack: data.currentlyPlaying,
      queue: data.queue || [],
      upNext: data.upNext,
      stats: data.stats,
      participantCount: data.stats.listeners,
    });
  },

  handleUserJoined: (data) => {
    const { userId, participantCount } = data;

    set((state) => ({
      participantCount,
      participants: state.participants.includes(userId)
        ? state.participants
        : [...state.participants, userId],
    }));
  },

  handleUserLeft: (data) => {
    const { userId, participantCount } = data;

    set((state) => ({
      participantCount,
      participants: state.participants.filter((id) => id !== userId),
    }));
  },

  updateSessionStatus: (status) => set({ sessionStatus: status }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  updateParticipantCount: (count) => set({ participantCount: count }),
  updateSessionStatus: (status) => set({ sessionStatus: status }),

  reset: () =>
    set({
      currentSession: null,
      sessionCode: null,
      isConnected: false,
      isJoining: false,
      joinError: null,
      participants: [],
      participantCount: 0,
      isHost: false,
      hostId: null,
      sessionStatus: "idle",
      currentTrack: null,
      queue: [],
      upNext: null,
      isPlaying: false,
      stats: {
        listeners: 0,
        inQueue: 0,
        estimatedWait: 0,
      },
    }),

  clearError: () => set({ joinError: null }),
}));

export default useLiveSessionStore;
