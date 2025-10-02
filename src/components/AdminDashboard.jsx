import React, { useState } from 'react';
import { BookUser, Users, ClipboardList, BarChart3, UserCog, Settings, LogOut } from 'lucide-react';
import HasilUjianPage from '@/components/admin/HasilUjianPage';
import KelolaPesertaPage from '@/components/admin/KelolaPesertaPage';
import KelolaSoalPage from '@/components/admin/KelolaSoalPage';
import KelolaAdminPage from '@/components/admin/KelolaAdminPage';
import PengaturanPage from '@/components/admin/PengaturanPage';
import ReportPage from '@/components/admin/ReportPage';

const navItems = [
    { id: 'hasilujian', label: 'Hasil Ujian', icon: ClipboardList },
    { id: 'kelolapeserta', label: 'Kelola Peserta', icon: Users },
    { id: 'kelolasoal', label: 'Kelola Soal', icon: BookUser },
    { id: 'report', label: 'Report', icon: BarChart3 },
    { id: 'kelolaadmin', label: 'Kelola Admin', icon: UserCog, adminOnly: true },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
];

export default function AdminDashboard({ currentUser, onLogout, usersState, hasilUjianState, soalUjianState, masterDataState }) {
  const [activePage, setActivePage] = useState('hasilujian');

  const renderActivePage = () => {
    switch (activePage) {
      case 'hasilujian':
        return <HasilUjianPage users={usersState} hasilUjianState={hasilUjianState} soalUjian={soalUjianState.soalUjian} masterData={masterDataState.masterData} currentUser={currentUser} />;
      case 'kelolapeserta':
        return <KelolaPesertaPage usersState={usersState} hasilUjianState={hasilUjianState} masterData={masterDataState.masterData} currentUser={currentUser} />;
      case 'kelolasoal':
        return <KelolaSoalPage soalUjianState={soalUjianState} masterData={masterDataState.masterData} />;
      case 'kelolaadmin':
        return <KelolaAdminPage usersState={usersState} masterData={masterDataState.masterData} />;
      case 'pengaturan':
        return <PengaturanPage masterDataState={masterDataState} />;
      case 'report':
        return <ReportPage users={usersState.users} hasilUjian={hasilUjianState.hasilUjian} soalUjian={soalUjianState.soalUjian} masterData={masterDataState.masterData} currentUser={currentUser} />;
      default:
        return <HasilUjianPage users={usersState} hasilUjianState={hasilUjianState} soalUjian={soalUjianState.soalUjian} masterData={masterDataState.masterData} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 mx-auto max-w-screen-xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
                <div className="flex items-center">
                    <span className="text-gray-600 text-sm mr-4">{`Halo, ${currentUser.nama}`}</span>
                    <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:block">
                <div className="flex items-baseline ml-10 space-x-1">
                  {navItems.map(item => {
                    if (item.adminOnly && currentUser.peran !== 'Master Admin') {
                      return null;
                    }
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activePage === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center ml-4 md:ml-6">
                <img src={masterDataState.masterData.logo} className="h-10 w-auto object-contain" alt="Nav Logo" />
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="py-8 mx-auto max-w-screen-xl sm:px-6 lg:px-8" id="main-content">
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
}