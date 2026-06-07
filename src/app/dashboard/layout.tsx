import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { 
  Bot, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Scissors, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  User as UserIcon, 
  ShieldAlert,
  Menu,
  Camera,
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session and get auth context
  const authCtx = await getAuthContext();
  if (!authCtx || !authCtx.user) {
    redirect('/login');
  }

  const user = authCtx.user;
  const business = authCtx.business;
  const role = authCtx.role;

  if (!business || !role) {
    redirect('/onboarding');
  }

  // Fetch count of open handoffs for notifications badge
  const handoffCount = await db.handoff.count({
    where: { 
      businessId: business.id,
      status: 'open'
    }
  });

  // Fetch count of pending appointments
  const pendingApptCount = await db.appointment.count({
    where: {
      businessId: business.id,
      status: 'new'
    }
  });

  return (
    <div className="bg-[#09090b] min-h-screen text-zinc-100 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0 hidden md:flex">
        
        {/* Upper Menu */}
        <div>
          {/* Logo & Tenant Info */}
          <div className="p-6 border-b border-zinc-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h3 className="font-black text-sm text-white truncate tracking-tight">OtoCevap</h3>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase block -mt-0.5">{business.name}</span>
            </div>
          </div>
 
          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {[
              { label: 'Özet (Dashboard)', href: '/dashboard', icon: LayoutDashboard },
              { label: 'Sohbetler', href: '/dashboard/conversations', icon: MessageSquare, badge: handoffCount ? handoffCount : 0 },
              { label: 'Müşteriler (CRM)', href: '/dashboard/customers', icon: Users },
              { label: 'Bilgi Bankası', href: '/dashboard/knowledge-base', icon: BookOpen },
              { label: 'Hizmetler & Fiyatlar', href: '/dashboard/services', icon: Scissors },
              { label: 'Randevular', href: '/dashboard/appointments', icon: Calendar, badge: pendingApptCount ? pendingApptCount : 0 },
              { label: 'Analiz & Raporlar', href: '/dashboard/reports', icon: BarChart3 },
              { label: 'Instagram Kur', href: '/dashboard/instagram-setup', icon: Camera },
              { label: 'Ayarlar', href: '/dashboard/settings', icon: Settings },
            ].map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="w-full px-3.5 py-2.5 rounded-lg flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                  <span>{link.label}</span>
                </div>
                {link.badge && link.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold text-white">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
 
        {/* Lower Profile & Logout */}
        <div className="p-4 border-t border-zinc-800/80 space-y-3 bg-zinc-950">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-zinc-850 flex items-center justify-center text-zinc-400 border border-zinc-800">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user.fullName || user.email?.split('@')[0]}</p>
              <span className="text-[10px] text-zinc-500 block truncate">{user.email}</span>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full px-3.5 py-2.5 rounded-lg flex items-center gap-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          </form>
        </div>
 
      </aside>
 
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/40 backdrop-blur-sm px-6 flex items-center justify-between z-10">
          
          {/* Mobile Sidebar Trigger */}
          <button className="p-2 text-zinc-400 hover:text-white md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium hidden md:block">B2B SaaS Portal</span>
          </div>
 
          {/* Quick Actions & Notifications */}
          <div className="flex items-center gap-4">
            
            {/* Urgent Handoff alert popup in navbar */}
            {handoffCount && handoffCount > 0 ? (
              <Link 
                href="/dashboard/conversations?filter=handoff"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{handoffCount} Bekleyen El-Devri</span>
              </Link>
            ) : null}
 
            {/* Notification Bell */}
            <button className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all relative">
              <Bell className="w-4 h-4" />
              {handoffCount || pendingApptCount ? (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
              ) : null}
            </button>
          </div>
        </header>
 
        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#09090b]">
          {children}
        </main>
      </div>
 
    </div>
  );
}
