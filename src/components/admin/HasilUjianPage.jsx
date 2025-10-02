import React, { useState, useMemo } from 'react';
import InterviewModal from '@/components/admin/InterviewModal';
import ReportModal from '@/components/admin/ReportModal';
import { Search, FileText, Edit, Trash2, Mic } from 'lucide-react';

export default function HasilUjianPage({ users, hasilUjianState, soalUjian, masterData, currentUser }) {
    const { hasilUjian, setHasilUjian } = hasilUjianState;
    const { users: allUsers, setUsers } = users;

    const [selectedHasilId, setSelectedHasilId] = useState(null);
    const [isInterviewModalOpen, setInterviewModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const openInterviewModal = (id) => {
        setSelectedHasilId(id);
        setInterviewModalOpen(true);
    };

    const openReportModal = (id) => {
        setSelectedHasilId(id);
        setReportModalOpen(true);
    };

    const closeModal = () => {
        setInterviewModalOpen(false);
        setReportModalOpen(false);
        setSelectedHasilId(null);
    };

    const handleSaveInterview = (updatedHasil) => {
        setHasilUjian(hasilUjian.map(h => h.id === updatedHasil.id ? updatedHasil : h));
        closeModal();
    };

    const handleDeletePeserta = (pesertaId) => {
        const peserta = allUsers.find(u => u.id === pesertaId);
        if (window.confirm(`Yakin ingin menghapus ${peserta.nama}? Data ujian dan data peserta akan terhapus permanen.`)) {
            setUsers(allUsers.filter(u => u.id !== pesertaId));
            setHasilUjian(hasilUjian.filter(h => h.pesertaId !== pesertaId));
        }
    };

    const filteredHasil = useMemo(() => {
        const isMasterAdmin = currentUser.peran === 'Master Admin';
        return hasilUjian.filter(hasil => {
            const peserta = allUsers.find(u => u.id === hasil.pesertaId);
            if (!peserta) return false;

            const hasAccess = isMasterAdmin || currentUser.jobSites.length === 0 || currentUser.jobSites.includes(peserta.jobSite);
            if (!hasAccess) return false;

            const searchTermLower = searchTerm.toLowerCase();
            return peserta.nama.toLowerCase().includes(searchTermLower) || peserta.nik.toLowerCase().includes(searchTermLower);
        });
    }, [hasilUjian, allUsers, currentUser, searchTerm]);

    const getSkorPersen = (hasil) => {
        const peserta = allUsers.find(u => u.id === hasil.pesertaId);
        if (!peserta) return 0;
        const soalUntukPeserta = soalUjian.filter(s => s.idp === peserta.idp && s.grade === peserta.grade);
        const totalNilaiMaksimal = soalUntukPeserta.reduce((sum, s) => sum + (s.nilai || 0), 0);
        return totalNilaiMaksimal > 0 ? (hasil.skorTertulis / totalNilaiMaksimal) * 100 : 0;
    };

    const selectedHasil = hasilUjian.find(h => h.id === selectedHasilId);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Hasil Ujian Peserta</h1>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari NIK atau Nama..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
            </div>
            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600">
                        <tr>
                            {['NIK', 'Nama', 'Jabatan', 'IDP', 'Grade', 'Section', 'Nilai Tertulis', 'Status', 'Aksi'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredHasil.length > 0 ? filteredHasil.map(hasil => {
                            const peserta = allUsers.find(u => u.id === hasil.pesertaId);
                            if (!peserta) return null;

                            const skorPersen = getSkorPersen(hasil);
                            const isSelesai = hasil.skorInterview !== null;
                            const statusClass = isSelesai ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                            const statusText = isSelesai ? 'Selesai' : 'Menunggu Interview';

                            return (
                                <tr key={hasil.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.nik}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{peserta.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.jabatan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.idp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{skorPersen.toFixed(0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>{statusText}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openInterviewModal(hasil.id)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50" title="Test Interview"><Mic className="h-4 w-4" /> Interview</button>
                                            {isSelesai && <button onClick={() => openReportModal(hasil.id)} className="flex items-center gap-1 text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50" title="Lihat Laporan"><FileText className="h-4 w-4" /> Laporan</button>}
                                            <button onClick={() => handleDeletePeserta(peserta.id)} className="flex items-center gap-1 text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50" title="Hapus"><Trash2 className="h-4 w-4" /> Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="9" className="text-center py-10 text-gray-500">Tidak ada data hasil ujian yang cocok dengan pencarian Anda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isInterviewModalOpen && selectedHasil && (
                <InterviewModal 
                    hasil={selectedHasil} 
                    users={allUsers} 
                    soalUjian={soalUjian}
                    masterData={masterData}
                    onClose={closeModal}
                    onSave={handleSaveInterview}
                />
            )}

            {isReportModalOpen && selectedHasil && (
                <ReportModal 
                    hasil={selectedHasil} 
                    users={allUsers} 
                    soalUjian={soalUjian}
                    masterData={masterData}
                    onClose={closeModal} 
                />
            )}
        </div>
    );
}