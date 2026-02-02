import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaMusic,
  FaChevronUp,
  FaChevronDown,
  FaFire,
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaCommentAlt,
  FaCircle,
  FaArrowLeft,
  FaListUl,
  FaHistory,
  FaBolt,
} from "react-icons/fa";
import { useParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useLiveSessionStore from "../store/liveSessionStore";
import { useQueueActions, useSessionSocket } from "../socket/session.socket";

export default function CustomerView() {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { sessionCode: urlSessionCode } = useParams();
  const { isAuthenticated } = useAuthStore();

  const {
    currentSession,
    sessionCode,
    setSessionCode,
    currentTrack,
    queue,
    participants,
    isConnected,
    sessionStatus,
    stats,
  } = useLiveSessionStore();

  const { refreshSessionData } = useQueueActions();

  useEffect(() => {
    if (urlSessionCode && urlSessionCode !== sessionCode) {
      console.log(`📍 Setting session code from URL: ${urlSessionCode}`);
      setSessionCode(urlSessionCode);
    }
  }, [urlSessionCode, sessionCode, setSessionCode]);

  const socketEventHandlers = React.useMemo(
    () => ({
      track_changed: (data) => {
        console.log("🎵 Track changed:", data);
        useLiveSessionStore.getState().setCurrentTrack(data.track);
      },
      queue_updated: (data) => {
        console.log("📋 Queue updated:", data);
        useLiveSessionStore.getState().setQueue(data.queue);
      },
      playback_state_changed: (data) => {
        console.log("⏯️ Playback state changed:", data);
        useLiveSessionStore.getState().setIsPlaying(data.isPlaying);
      },
      user_joined: (data) => {
        console.log("👋 User joined:", data);
        useLiveSessionStore.getState().handleUserJoined(data);
      },
      user_left: (data) => {
        console.log("👋 User left:", data);
        useLiveSessionStore.getState().handleUserLeft(data);
      },
    }),
    []
  );

  useSessionSocket(sessionCode || null, socketEventHandlers);

  useEffect(() => {
    if (sessionCode && refreshSessionData) {
      refreshSessionData();
    }
  }, [sessionCode, refreshSessionData]);

  const handleVote = async (songId, delta) => {
    try {
      const updatedQueue = queue
        .map((s) => (s.id === songId ? { ...s, votes: s.votes + delta } : s))
        .sort((a, b) => b.votes - a.votes);

      useLiveSessionStore.getState().setQueue(updatedQueue);

      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  console.log("Rendering CustomerView with queue:", queue);
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F7] font-sans pb-44 relative overflow-hidden">
      {/* 1. BRAND ACCENT BAR */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-[110]">
        <div className="h-full bg-[#E07A3D] w-2/3 shadow-[0_0_20px_#E07A3D]" />
      </div>

      {/* 2. SUCCESS TOAST */}
      {requestSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm pointer-events-none">
          <div className="bg-[#1DB954] text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top duration-300">
            <FaCheckCircle className="animate-bounce" />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">
              Action Confirmed
            </span>
          </div>
        </div>
      )}

      {/* 3. HEADER */}
      <header className="px-6 pt-12 flex justify-between items-center relative z-10">
        <button
          onClick={() => setActiveDrawer("left")}
          className="w-12 h-12 bg-[#1A1A1C] rounded-2xl border border-white/5 flex items-center justify-center text-gray-400"
        >
          <FaListUl size={18} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            {displaySession.name}
          </h1>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center justify-center gap-2">
            {displaySession.venue} •{" "}
            <span
              className={`flex items-center gap-1 ${
                isConnected && sessionStatus === "active"
                  ? "text-[#1DB954]"
                  : "text-gray-500"
              }`}
            >
              <FaCircle className="text-[6px]" />
              {isConnected && sessionStatus === "active" ? "Live" : "Offline"}
            </span>
          </span>
        </div>
        <button
          onClick={() => setActiveDrawer("right")}
          className="w-12 h-12 bg-[#1A1A1C] rounded-2xl border border-white/5 flex items-center justify-center text-[#E07A3D] relative"
        >
          <FaCommentAlt size={18} />
          {participants.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E07A3D] rounded-full border-2 border-[#0A0A0B]" />
          )}
        </button>
      </header>

      {/* Queue Container */}
      {isQueueOpen && (
        <QueueModal isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
      )}

      {/* 4. MAIN VIBE FEED */}
      <main className="px-6 mt-10 space-y-12 relative z-10">
        <section className="bg-[#111113] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-[#E07A3D] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <FaBolt /> Now Spinning
            </p>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2">
              {displayTrack.name}
            </h2>
            <p className="text-lg text-gray-400 italic opacity-70">
              {displayTrack.artists?.map((a) => a.name).join(", ") ||
                displayTrack.artist ||
                "—"}
            </p>
          </div>
          <FaMusic className="absolute -right-6 -bottom-6 text-white/[0.02] text-9xl rotate-12" />
        </section>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 px-2">Upcoming Tracks</h3>
          <div className="space-y-3">
            {queue.slice(0, 5).map(song => <SongCard key={song.id} song={song} onVote={handleVote} />)}
          </div>
          <button disabled onClick={() => setActiveDrawer('left')} className="w-full py-5 rounded-[2.5rem] bg-[#111113] border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#E07A3D]">
            Full Queue ({queue.length})
          </button>
        </div>
      </main>

      {/* 5. SEARCH TRIGGER */}
      <div className="fixed bottom-10 left-0 right-0 px-8 z-[100]">
        <button
          onClick={() => setIsQueueOpen(true)}
          className="w-full bg-[#E07A3D] py-6 rounded-[2.5rem] flex items-center justify-center gap-4 shadow-[0_25px_50px_rgba(224,122,61,0.35)] active:scale-95 transition-all"
        >
          <FaPlus className="text-white" />
          <span className="font-black text-sm uppercase tracking-[0.2em] text-white">
            Add Song
          </span>
        </button>
      </div>

      {/* --- DRAWERS --- */}
      <Drawer
        side="left"
        isOpen={activeDrawer === "left"}
        onClose={() => setActiveDrawer(null)}
        title="Full Queue"
      >
        <div className="space-y-4 pb-24">
          <button
            onClick={() => { setActiveDrawer(null); setIsSearching(true); }}
            className="w-full p-6 rounded-[2.5rem] border-2 border-dashed border-[#E07A3D]/20 flex items-center justify-center gap-3 text-[#E07A3D] mb-4"
          >
            <FaSearch size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Search & Add More
            </span>
          </button>
          {queue.length === 0 ? (
            <p className="text-center text-gray-500 text-sm italic mt-20">The queue is currently empty. Be the first to add a song!</p>
          ) : (
            queue.map((song, index) => (
              <div
                key={song.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SongCard song={song} onVote={handleVote} />
              </div>
            ))
          )}
        </div>
      </Drawer>

      <Drawer
        side="right"
        isOpen={activeDrawer === "right"}
        onClose={() => setActiveDrawer(null)}
        title="Activity"
      >
        <div className="space-y-3 pb-24">
          <div className="mb-6">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
              Live Participants ({participants.length})
            </p>
          </div>
          {participants.length > 0 ? (
            participants.map((participant, idx) => (
              <div
                key={participant.id || idx}
                className="p-4 rounded-2xl bg-[#111113] border border-white/5 flex items-start gap-4"
              >
                <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-[#1DB954] animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {participant.name || `Listener ${idx + 1}`}
                  </p>
                  <p className="text-[10px] text-gray-500 font-black mt-1 uppercase tracking-tighter">
                    Active
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FaCommentAlt className="mx-auto text-gray-600 mb-3" size={32} />
              <p className="text-gray-500 text-sm">No active participants</p>
            </div>
          )}
        </div>
      </Drawer>

      {/* --- FULL SCREEN SEARCH OVERLAY --- */}
      <div
        className={`fixed inset-0 bg-[#0A0A0B] z-[300] transition-all duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] ${isSearching ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      >
        <div className="p-8 h-full flex flex-col">
          <header className="flex justify-between items-center mb-10">
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="w-12 h-12 bg-[#1A1A1C] rounded-2xl flex items-center justify-center text-gray-400"
            >
              <FaArrowLeft />
            </button>
            <h3 className="text-xl font-black uppercase tracking-tighter text-[#E07A3D]">
              Search Music
            </h3>
            <div className="w-12" /> {/* Spacer */}
          </header>

          <div className="relative mb-8">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E07A3D]" />
            <input
              autoFocus={isSearching}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full bg-[#111113] border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-white text-lg outline-none focus:border-[#E07A3D]/50 transition-all"
              placeholder="Search artist or song..."
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-10">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">
              {searchQuery ? "Search Results" : "Start typing to search"}
            </p>
            {searchResults.length > 0 ? (
              searchResults.map((song, i) => (
                <div
                  key={song.id || i}
                  className="flex items-center gap-5 p-5 bg-[#111113] rounded-[2rem] border border-white/5"
                >
                  <div className="w-14 h-14 bg-[#1A1A1C] rounded-2xl flex items-center justify-center text-[#E07A3D]">
                    <FaMusic />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white truncate text-base">
                      {song.name || song.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-black uppercase">
                      {song.artists?.map((a) => a.name).join(", ") ||
                        song.artist}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddSong(song)}
                    className="w-12 h-12 bg-[#E07A3D] rounded-2xl flex items-center justify-center shadow-lg active:scale-90"
                  >
                    <FaPlus className="text-white" />
                  </button>
                </div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-12">
                <FaSearch className="mx-auto text-gray-600 mb-3" size={32} />
                <p className="text-gray-500">No results found</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0B] to-transparent pointer-events-none z-40" />
    </div>
  );
}

// --- SHARED COMPONENTS ---
function SongCard({ song, onVote }) {
  // Determine if this song belongs to the current user
  // TODO: Replace with actual user ID comparison
  const isMine = song.isMine || false;

  return (
    <div className={`p-6 rounded-[2.5rem] border flex items-center gap-5 transition-all ${song.isPlaying ? 'bg-[#1DB954]/10 border-[#1DB954]' : 'bg-[#111113] border-white/5'}`}>
      <div className="w-16 h-16 bg-[#1A1A1C] rounded-2xl flex items-center justify-center text-[#E07A3D] relative">
        {song.albumArtUrl ? (
          <img src={song.albumArtUrl} alt={song.name} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <FaMusic size={24} />
        )}
        {song.isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
            <FaCircle className="text-[#1DB954] animate-pulse" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white truncate text-base">{song.name}</h4>
        <p className="text-[10px] text-gray-500 font-black uppercase">{song.artist}</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button 
          onClick={() => onVote(song.id, 1)}
          className="p-2 bg-[#1A1A1C] rounded-full text-gray-400 hover:text-white active:scale-90 transition"
        >
          <FaChevronUp />
        </button>
        <span className="text-sm font-black text-white">{song.votes}</span>
        <button 
          onClick={() => onVote(song.id, -1)}
          className="p-2 bg-[#1A1A1C] rounded-full text-gray-400 hover:text-white active:scale-90 transition"
        >
          <FaChevronDown />
        </button>
      </div>
    </div>
  );
}

function Drawer({ side, isOpen, onClose, title, children }) {
  const transform =
    side === "left"
      ? isOpen
        ? "translate-x-0"
        : "-translate-x-full"
      : isOpen
        ? "translate-x-0"
        : "translate-x-full";
  const edge = side === "left" ? "left-0 border-r" : "right-0 border-l";

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/85 backdrop-blur-md z-[140] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 bg-[#0D0D0F] z-[150] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] border-white/5 w-[88%] max-w-sm ${edge} ${transform}`}
      >
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter text-[#E07A3D] italic">
              {title}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-500">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
        </div>
      </div>
    </>
  );
}
