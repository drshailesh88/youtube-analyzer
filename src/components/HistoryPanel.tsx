'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Video, Trash2 } from 'lucide-react';
import { HistoryItem } from '@/lib/types';

interface HistoryPanelProps {
  onSelectAnalysis: (id: string) => void;
  isLoading?: boolean;
}

export default function HistoryPanel({ onSelectAnalysis, isLoading = false }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/history/list?limit=50');
      const data = await response.json();

      if (data.success) {
        setHistory(data.analyses);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Collapsed Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-ink-800 hover:bg-ink-700 text-ink-100 p-3 rounded-l-lg shadow-lg transition-all z-40 border-l-2 border-accent-blue"
          aria-label="Open history panel"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* History Panel */}
      <div
        className={`fixed right-0 top-0 h-screen bg-ink-900 border-l border-ink-700 shadow-2xl transition-all duration-300 z-50 flex flex-col ${
          isOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-700 bg-ink-800">
          <h2 className="text-lg font-semibold text-ink-50 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent-blue" />
            History
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-ink-400 hover:text-ink-100 transition-colors p-1 rounded hover:bg-ink-700"
            aria-label="Close history panel"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading || isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-ink-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mb-2"></div>
              <p className="text-sm">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-ink-500 text-center px-4">
              <Video className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No analysis history yet</p>
              <p className="text-xs mt-1">Your analyses will appear here</p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectAnalysis(item.id)}
                className="w-full text-left p-3 rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-700 hover:border-accent-blue transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-medium text-ink-100 line-clamp-2 group-hover:text-accent-blue transition-colors">
                    {item.videoTitle}
                  </h3>
                </div>
                <p className="text-xs text-ink-400 mb-2">{item.videoChannel}</p>
                <div className="flex items-center justify-between text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(item.createdAt.toString())}
                  </span>
                  <span>{item.totalComments} comments</span>
                </div>
                <div className="mt-2 text-xs text-ink-600">
                  {item.modelUsed.split('/')[1]?.split(':')[0] || item.modelUsed}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer with refresh button */}
        <div className="p-3 border-t border-ink-700 bg-ink-800">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="w-full py-2 px-3 text-sm bg-ink-700 hover:bg-ink-600 text-ink-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh History'}
          </button>
        </div>
      </div>

      {/* Overlay when panel is open (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
