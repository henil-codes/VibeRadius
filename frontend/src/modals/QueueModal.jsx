import { useState } from "react";
import { searchTrack } from "../services/SpotifyService.js"
import { FaListUl, FaTimes, FaSearch, FaChevronUp, FaChevronDown, FaMusic, FaTrashAlt } from "react-icons/fa";


const QueueModal = ({ isOpen, onClose, queue }) => {
    if (!isOpen) return null;

    /* Spotify Track Search */
    const [query, setQuery] = useState("");
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState("");

    const searchTracks = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const items = await searchTrack(query);
            setTracks(items || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Unable to reach Spotify. Please try again.");
            setTracks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") searchTracks();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-accent-dark/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-200 border border-primary-light/20">
                <div className="p-6 border-b border-primary-subtle bg-surface-alt flex justify-between items-center">
                    <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                            <FaListUl size={14} />
                        </div>
                        Session Queue
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-primary-subtle rounded-full text-text-muted transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 bg-surface">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search and add a new song instantly..."
                            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-surface-bg border border-primary-subtle focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
                    {queue.map((song, i) => (
                        <div
                            key={song.id || i}
                            className="flex items-center gap-4 p-4 hover:bg-surface-alt rounded-2xl transition-all mb-2 group border border-transparent hover:border-primary-subtle"
                        >
                            <div className="flex flex-col items-center min-w-[32px] bg-surface-bg py-1 rounded-lg">
                                <FaChevronUp
                                    className="text-text-muted hover:text-success cursor-pointer transition-colors"
                                    size={10}
                                />
                                <span className="text-xs font-black text-text-primary py-0.5">
                                    {song.votes || 0}
                                </span>
                                <FaChevronDown
                                    className="text-text-muted hover:text-error cursor-pointer transition-colors"
                                    size={10}
                                />
                            </div>
                            <div className="w-12 h-12 bg-primary-subtle text-primary rounded-xl flex items-center justify-center shadow-inner font-bold">
                                <FaMusic size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-text-primary text-sm truncate">
                                    {song.title || song.name}
                                </h4>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">
                                    {song.artist || song.artists?.[0]?.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error-light rounded-lg">
                                    <FaTrashAlt size={14} />
                                </button>
                                <span className="text-[10px] font-black text-primary uppercase bg-primary-subtle px-3 py-1.5 rounded-lg border border-primary/10">
                                    {song.table || song.requestedBy || "—"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QueueModal;