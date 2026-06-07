'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Loader2, Play } from 'lucide-react';

interface DashboardClientProps {
  businessId: string;
  isSeeded: boolean;
}

export default function DashboardClient({ businessId, isSeeded }: DashboardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Demo verileri yüklenirken hata oluştu.');
      }

      // Refresh page to load seeded metrics
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Hata oluştu.');
      setLoading(false);
    }
  };

  if (isSeeded) {
    return null; // Don't show buttons if already populated
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      {error && <span className="text-red-400 text-xs mb-2">{error}</span>}
      <button
        onClick={handleSeedData}
        disabled={loading}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Yükleniyor...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 text-white fill-white" />
            <span>Örnek Konuşma Verileri Yükle</span>
          </>
        )}
      </button>
    </div>
  );
}
