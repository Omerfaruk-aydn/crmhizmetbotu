import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  Coins, 
  ShieldAlert, 
  Activity, 
  ArrowLeft,
  Settings,
  Bot
} from 'lucide-react';

export default async function AdminPage() {
  // Validate session via JWT auth context
  const authCtx = await getAuthContext();
  if (!authCtx || !authCtx.user) {
    redirect('/login');
  }

  const isSuperAdmin = authCtx.role === 'super_admin';

  // Query system overview statistics using Prisma
  const bizCount = await db.business.count();
  const userCount = await db.profile.count();
  const totalMsg = await db.message.count();

  const allBiz = await db.business.findMany({
    select: {
      id: true,
      name: true,
      sector: true,
      slug: true,
      createdAt: true,
      status: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen p-6 md:p-10 font-sans select-none">
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Bot className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Süper Admin Yönetim Paneli
              </h1>
              <p className="text-zinc-500 text-xs mt-0.5">Sistem geneli multi-tenant işletmeler, abonelikler ve kullanım durumları.</p>
            </div>
          </div>
          
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard'a Dön</span>
          </Link>
        </div>

        {!isSuperAdmin && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <strong>Bilgilendirme:</strong> Hesabınızda super_admin rolü tanımlı değildir. Bu ekran sistem genelinde yalnızca yetkili yöneticilere görünür. Geliştirme aşamasında olduğunuz için bu demo görünümünü izlemektesiniz.
            </div>
          </div>
        )}

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Kayıtlı İşletme</span>
              <span className="text-lg font-bold text-white mt-0.5">{bizCount || 0}</span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Sistem Kullanıcısı</span>
              <span className="text-lg font-bold text-white mt-0.5">{userCount || 0}</span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">İşlenen AI Mesajı</span>
              <span className="text-lg font-bold text-white mt-0.5">{totalMsg || 0}</span>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Tahmini MRR</span>
              <span className="text-lg font-bold text-white mt-0.5">2.490 TL</span>
            </div>
          </div>

        </div>

        {/* Tenant Businesses List */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-purple-400" />
            Sistemdeki Aktif İşletmeler
          </h3>

          <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold">
                  <th className="p-4">İşletme Adı</th>
                  <th className="p-4">Sektör</th>
                  <th className="p-4">Slug (Domain)</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {allBiz.length === 0 ? (
                  <tr className="text-zinc-500">
                    <td colSpan={5} className="p-4 text-center">İşletme bulunamadı.</td>
                  </tr>
                ) : (
                  allBiz.map((biz) => (
                    <tr key={biz.id} className="border-b border-zinc-800/80 hover:bg-zinc-900/10 text-zinc-300">
                      <td className="p-4 font-bold text-white">
                        {biz.name}
                      </td>
                      <td className="p-4">{biz.sector || 'Belirtilmedi'}</td>
                      <td className="p-4 font-mono text-purple-400">/{biz.slug}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400 uppercase tracking-wider">
                          {biz.status || 'aktif'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        {new Date(biz.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
