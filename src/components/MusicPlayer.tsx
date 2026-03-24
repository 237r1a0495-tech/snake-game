import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, TerminalSquare } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'STREAM_01.WAV',
    artist: 'UNKNOWN_ENTITY',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'STREAM_02.WAV',
    artist: 'UNKNOWN_ENTITY',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'STREAM_03.WAV',
    artist: 'UNKNOWN_ENTITY',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    playNext();
  };

  return (
    <div className="bg-black border-t-4 border-[#ff00ff] p-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4 font-['VT323'] text-2xl">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleEnded}
      />
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-full sm:w-1/3">
        <div className="w-12 h-12 bg-[#00ffff] flex items-center justify-center border-2 border-[#ff00ff]">
          <TerminalSquare className="text-black w-8 h-8" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[#00ffff] font-bold truncate tracking-widest uppercase drop-shadow-[2px_2px_0_#ff00ff]">
            {currentTrack.title}
          </span>
          <span className="text-[#ff00ff] text-lg truncate uppercase">
            SRC: {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={playPrev}
          className="text-[#00ffff] hover:text-[#ff00ff] hover:scale-110 transition-none"
        >
          <SkipBack className="w-8 h-8" />
        </button>
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-black border-4 border-[#00ffff] flex items-center justify-center text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-none"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button
          onClick={playNext}
          className="text-[#00ffff] hover:text-[#ff00ff] hover:scale-110 transition-none"
        >
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 w-full sm:w-1/3 justify-end">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="text-[#ff00ff] hover:text-[#00ffff] transition-none"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-8 h-8" />
          ) : (
            <Volume2 className="w-8 h-8" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-32 h-4 bg-black border-2 border-[#00ffff] appearance-none cursor-pointer accent-[#ff00ff]"
        />
      </div>
    </div>
  );
}
