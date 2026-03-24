import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { Terminal } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-[#00ffff] flex flex-col font-['VT323'] overflow-hidden relative crt screen-tear selection:bg-[#ff00ff] selection:text-black">
      <div className="static-noise"></div>
      
      {/* Header */}
      <header className="w-full p-4 border-b-4 border-[#ff00ff] bg-black z-10 relative">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="flex items-center gap-4 text-xl md:text-3xl font-['Press_Start_2P'] text-[#00ffff] uppercase drop-shadow-[4px_4px_0_#ff00ff]">
            <Terminal className="w-8 h-8 md:w-10 md:h-10 text-[#00ffff]" />
            SYS.TERMINAL_
          </h1>
          <div className="text-xl md:text-2xl text-[#ff00ff] uppercase tracking-widest animate-pulse font-bold">
            ERR_CODE: 0xDEADBEEF
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
        <SnakeGame />
      </main>

      {/* Footer / Music Player */}
      <footer className="w-full z-20 sticky bottom-0 border-t-4 border-[#00ffff] bg-black">
        <MusicPlayer />
      </footer>
    </div>
  );
}
