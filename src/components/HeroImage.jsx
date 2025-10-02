import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// ======================================================= //
//                KOMPONEN UTAMA HALAMAN HASIL UJIAN         //
// ======================================================= //
export default function HasilUjianPage({ users, hasilUjianState, soalUjian, currentUser }) {
    const { hasilUjian, setHasilUjian } = hasilUjianState;
    const [selectedHasilId, setSelectedHasilId] = useState(null);
    const [isInterviewModalOpen, setInterviewModalOpen] = useState(false);
    const [isReportModalOpen, setReportModalOpen] = useState(false);

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

    const isMasterAdmin = currentUser.peran === 'Master Admin';
    const filteredHasil = hasilUjian.filter(hasil => {
        if (isMasterAdmin) return true;
        const peserta = users.find(u => u.id === hasil.pesertaId);
        return peserta && currentUser.jobSites.includes(peserta.jobSite);
    });

    const getSkorPersen = (hasil) => {
        const peserta = users.find(u => u.id === hasil.pesertaId);
        if (!peserta) return 0;
        const soalUntukPeserta = soalUjian.filter(s => s.idp === peserta.idp && s.grade === peserta.grade);
        const totalNilaiMaksimal = soalUntukPeserta.reduce((sum, s) => sum + s.nilai, 0);
        return totalNilaiMaksimal > 0 ? (hasil.skorTertulis / totalNilaiMaksimal) * 100 : 0;
    };

    const selectedHasil = hasilUjian.find(h => h.id === selectedHasilId);

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Hasil Ujian Peserta</h1>
            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['NIK', 'Nama', 'Jabatan', 'IDP', 'Grade', 'Section', 'Nilai Tertulis', 'Status', 'Aksi'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredHasil.map(hasil => {
                            const peserta = users.find(u => u.id === hasil.pesertaId);
                            if (!peserta) return null;

                            const skorPersen = getSkorPersen(hasil);
                            const isSelesai = hasil.skorInterview !== null;
                            const statusClass = isSelesai ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                            const statusText = isSelesai ? 'Selesai' : 'Menunggu Interview';

                            return (
                                <tr key={hasil.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.nik}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{peserta.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.jabatan}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.idp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{skorPersen.toFixed(0)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>{statusText}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button onClick={() => openInterviewModal(hasil.id)} className="text-indigo-600 hover:text-indigo-900">Test Interview</button>
                                        {isSelesai && <button onClick={() => openReportModal(hasil.id)} className="text-green-600 hover:text-green-900 ml-4">Lihat Laporan</button>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isInterviewModalOpen && selectedHasil && (
                <InterviewModal 
                    hasil={selectedHasil} 
                    users={users} 
                    soalUjian={soalUjian}
                    onClose={closeModal}
                    onSave={(updatedHasil) => {
                        setHasilUjian(hasilUjian.map(h => h.id === updatedHasil.id ? updatedHasil : h));
                        closeModal();
                    }}
                />
            )}

            {isReportModalOpen && selectedHasil && (
                <ReportModal 
                    hasil={selectedHasil} 
                    users={users} 
                    soalUjian={soalUjian}
                    onClose={closeModal} 
                />
            )}
        </div>
    );
}

// ======================================================= //
//                  MODAL & SUB-COMPONENTS                 //
// ======================================================= //

// --- Utility Functions ---
const calculateMasaKerja = (joinDateString) => {
    if (!joinDateString) return "N/A";
    const joinDate = new Date(joinDateString);
    const now = new Date();
    if (joinDate > now) return "Tanggal tidak valid";
    let years = now.getFullYear() - joinDate.getFullYear();
    let months = now.getMonth() - joinDate.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    return `${years} tahun, ${months} bulan`;
};

const getNextGrade = (currentGrade, allGrades) => {
    const gradeIndex = allGrades.indexOf(currentGrade);
    if (gradeIndex > -1 && gradeIndex < allGrades.length - 1) {
        return allGrades[gradeIndex + 1];
    }
    return "ke jenjang selanjutnya";
};


// --- Komponen Modal Interview ---
function InterviewModal({ hasil, users, soalUjian, onClose, onSave }) {
    // ... Implementasi lengkap dari Modal Interview di sini ...
    // Ini akan menjadi komponen yang sangat besar dengan form, state, dan logic-nya sendiri.
    // Untuk menjaga agar contoh ini tetap fokus, kita akan membuat versi sederhananya.
    
    // Placeholder untuk form interview yang kompleks
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="w-full max-w-4xl p-6 mx-4 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Formulir Test Interview</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div className="mt-4 max-h-[75vh] overflow-y-auto p-4">
                    <p>Formulir interview yang lengkap dengan semua aspek, pertanyaan dinamis, dan generator ringkasan AI akan berada di sini.</p>
                </div>
                <div className="pt-4 mt-4 text-right border-t">
                    <button onClick={onClose} type="button" className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                    {/* Tombol Simpan akan memanggil onSave dengan data yang diperbarui */}
                    <button onClick={() => onSave(hasil)} type="button" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Simpan Penilaian</button>
                </div>
            </div>
        </div>
    );
}

// --- Komponen Modal Laporan ---
function ReportModal({ hasil, users, soalUjian, onClose }) {
    const peserta = users.find(u => u.id === hasil.pesertaId);

    // Kalkulasi Skor
    const soalUntukPeserta = soalUjian.filter(s => s.idp === peserta.idp && s.grade === peserta.grade);
    const totalNilaiMaksimal = soalUntukPeserta.reduce((sum, s) => sum + s.nilai, 0);
    const skorTertulisPersen = totalNilaiMaksimal > 0 ? (hasil.skorTertulis / totalNilaiMaksimal) * 100 : 0;
    const nilaiTertulisWeighted = skorTertulisPersen * 0.25;
    const nilaiInterviewWeighted = hasil.skorInterview * 0.75;
    const nilaiAkhir = nilaiTertulisWeighted + nilaiInterviewWeighted;

    // Menentukan Status dan Rekomendasi
    let status = {}, rekomendasi = '';
    const allGrades = ['M1', 'M2', 'M3', 'Foreman']; // Seharusnya dari masterData
    const nextGrade = getNextGrade(peserta.grade, allGrades);

    if (nilaiAkhir >= 75) {
        status = { text: 'LULUS', class: 'text-green-600' };
        rekomendasi = `PESERTA DINYATAKAN LULUS DAN DIREKOMENDASIKAN UNTUK NAIK KE GRADE ${nextGrade}.`;
    } else if (nilaiAkhir >= 70) {
        status = { text: 'DIPERTIMBANGKAN', class: 'text-orange-500' };
        rekomendasi = `DIPERTIMBANGKAN UNTUK NAIK KE GRADE ${nextGrade}.`;
    } else {
        status = { text: 'TIDAK LULUS', class: 'text-red-600' };
        rekomendasi = `TIDAK DIREKOMENDASIKAN NAIK KE GRADE ${nextGrade}.`;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl">
                <div id="printableArea">
                    <div className="flex items-start justify-between pb-3 border-b">
                        <h3 className="text-xl font-semibold">Rangkuman Hasil Ujian</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl print:hidden">&times;</button>
                    </div>
                    {/* Konten Laporan */}
                    <div className="mt-4 space-y-4 text-sm">
                        {/* Biodata */}
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Biodata Peserta</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                <div><span className="font-semibold text-gray-600">Nama:</span> {peserta.nama}</div>
                                <div><span className="font-semibold text-gray-600">NIK:</span> {peserta.nik}</div>
                                <div><span className="font-semibold text-gray-600">Jabatan:</span> {peserta.jabatan}</div>
                                <div><span className="font-semibold text-gray-600">Grade:</span> {peserta.grade}</div>
                                <div><span className="font-semibold text-gray-600">Section:</span> {peserta.section}</div>
                                <div><span className="font-semibold text-gray-600">Masa Kerja:</span> {calculateMasaKerja(peserta.tanggalBergabung)}</div>
                            </div>
                        </div>
                        {/* Skor */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            {/* ... Skor cards ... */}
                        </div>
                        {/* Rekomendasi */}
                        <div className="p-4 border rounded-lg bg-gray-50 text-center">
                            <h4 className="font-semibold text-gray-800">REKOMENDASI</h4>
                            <p className={`mt-2 text-lg font-bold ${status.class}`}>{rekomendasi}</p>
                        </div>
                        {/* Kesimpulan & Grafik */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                           {/* ... Chart and Summary ... */}
                        </div>
                    </div>
                </div>
                 <div className="pt-4 mt-4 text-right border-t print:hidden">
                    <button onClick={() => window.print()} type="button" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Cetak</button>
                </div>
            </div>
        </div>
    );
}