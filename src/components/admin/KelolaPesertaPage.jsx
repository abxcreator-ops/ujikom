import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { calculateMasaKerja } from '@/lib/utils';
import { Search, Plus, Download, Upload, Eye, EyeOff } from 'lucide-react';

// ======================================================= //
//                KOMPONEN MODAL (INTERNAL)                //
// ======================================================= //

function PesertaModal({ onClose, onSave, peserta, masterData }) {
    const [formData, setFormData] = useState({
        nik: '', nama: '', jabatan: '', grade: '', jobSite: '', section: '',
        tempatLahir: '', tanggalLahir: '', idp: '', tahunUjikom: new Date().getFullYear(),
        tanggalBergabung: '', password: '12345',
    });
    const [masaKerja, setMasaKerja] = useState('Otomatis terisi');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        if (peserta) {
            setFormData({ ...peserta });
        }
    }, [peserta]);

    useEffect(() => {
        setMasaKerja(calculateMasaKerja(formData.tanggalBergabung));
    }, [formData.tanggalBergabung]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{peserta ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <InputField label="NIK" id="nik" value={formData.nik} onChange={handleChange} required />
                        <InputField label="Nama Lengkap" id="nama" value={formData.nama} onChange={handleChange} required />
                        <SelectField label="Jabatan" id="jabatan" value={formData.jabatan} onChange={handleChange} options={masterData.jabatan} required />
                        <SelectField label="Grade" id="grade" value={formData.grade} onChange={handleChange} options={masterData.grade} required />
                        <SelectField label="Job Site" id="jobSite" value={formData.jobSite} onChange={handleChange} options={masterData.jobSite} required />
                        <SelectField label="Section" id="section" value={formData.section} onChange={handleChange} options={masterData.section} required />
                        <InputField label="Tempat Lahir" id="tempatLahir" value={formData.tempatLahir} onChange={handleChange} />
                        <InputField label="Tanggal Lahir" id="tanggalLahir" type="date" value={formData.tanggalLahir} onChange={handleChange} />
                        <SelectField label="IDP" id="idp" value={formData.idp} onChange={handleChange} options={masterData.idp} required />
                        <InputField label="Tahun Ujikom" id="tahunUjikom" type="number" value={formData.tahunUjikom} onChange={handleChange} />
                        <InputField label="Tanggal Bergabung" id="tanggalBergabung" type="date" value={formData.tanggalBergabung} onChange={handleChange} />
                        <div>
                            <label className="block font-medium text-gray-700">Masa Kerja</label>
                            <p className="mt-1 px-3 py-2 h-[38px] flex items-center bg-gray-100 rounded-md text-gray-600">{masaKerja}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
                            <div className="relative mt-1">
                                <input type={isPasswordVisible ? 'text' : 'password'} id="password" value={formData.password} onChange={handleChange} required className="block w-full border-gray-300 rounded-md shadow-sm pr-10"/>
                                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                                    {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 text-right border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper komponen untuk form fields
const InputField = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block font-medium text-gray-700">{label}</label>
        <input id={id} {...props} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
    </div>
);
const SelectField = ({ label, id, options, ...props }) => (
    <div>
        <label htmlFor={id} className="block font-medium text-gray-700">{label}</label>
        <select id={id} {...props} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option value="">-- Pilih --</option>
            {(options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


// ======================================================= //
//              KOMPONEN UTAMA HALAMAN (EXPORT)              //
// ======================================================= //

export default function KelolaPesertaPage({ usersState, hasilUjianState, masterData, currentUser }) {
    const { users, setUsers } = usersState;
    const { hasilUjian, setHasilUjian } = hasilUjianState;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPeserta, setEditingPeserta] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const importInputRef = useRef(null);

    const handleOpenModal = (peserta = null) => {
        setEditingPeserta(peserta);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingPeserta(null);
        setIsModalOpen(false);
    };

    const handleSavePeserta = (pesertaData) => {
        if (pesertaData.id) {
            // Mode Edit
            setUsers(users.map(u => u.id === pesertaData.id ? { ...u, ...pesertaData } : u));
        } else {
            // Mode Tambah
            const newPeserta = {
                ...pesertaData,
                id: Date.now(),
                role: 'peserta',
                username: pesertaData.nama.split(' ')[0].toLowerCase(),
            };
            const newHasil = { id: Date.now() + 1, pesertaId: newPeserta.id, skorTertulis: null, skorInterview: null, interviewDetail: {} };
            setUsers([...users, newPeserta]);
            setHasilUjian([...hasilUjian, newHasil]);
        }
        handleCloseModal();
    };

    const handleDeletePeserta = (pesertaId) => {
        const peserta = users.find(u => u.id === pesertaId);
        if (window.confirm(`Yakin ingin menghapus ${peserta.nama}? Data ujiannya juga akan terhapus.`)) {
            setUsers(users.filter(u => u.id !== pesertaId));
            setHasilUjian(hasilUjian.filter(h => h.pesertaId !== pesertaId));
        }
    };

    const handleDownloadFormat = () => {
        const sampleData = [{ NIK: "", NAMA: "", JABATAN: "", GRADE: "", JOB_SITE: "", SECTION: "", TEMPAT_LAHIR: "", TANGGAL_LAHIR: "YYYY-MM-DD", IDP: "", TAHUN_UJIKOM: "", TANGGAL_BERGABUNG: "YYYY-MM-DD", PASSWORD: "" }];
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Format Peserta");
        XLSX.writeFile(workbook, "Format-Import-Peserta.xlsx");
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const newUsers = [];
            const newHasilUjians = [];
            jsonData.forEach((row, index) => {
                const newId = Date.now() + index;
                newUsers.push({ id: newId, role: 'peserta', nik: row.NIK, nama: row.NAMA, jabatan: row.JABATAN, grade: row.GRADE, jobSite: row.JOB_SITE, section: row.SECTION, tempatLahir: row.TEMPAT_LAHIR, tanggalLahir: row.TANGGAL_LAHIR, idp: row.IDP, tahunUjikom: row.TAHUN_UJIKOM, tanggalBergabung: row.TANGGAL_BERGABUNG, password: row.PASSWORD, username: String(row.NAMA).split(' ')[0].toLowerCase() });
                newHasilUjians.push({ id: newId + 1000, pesertaId: newId, skorTertulis: null, skorInterview: null, interviewDetail: {} });
            });

            setUsers(prev => [...prev, ...newUsers]);
            setHasilUjian(prev => [...prev, ...newHasilUjians]);
            alert(`${newUsers.length} peserta berhasil diimpor.`);
        };
        reader.readAsArrayBuffer(file);
        event.target.value = ''; // Reset input
    };

    const pesertaList = useMemo(() => {
        const isMasterAdmin = currentUser.peran === 'Master Admin';
        const allPeserta = users.filter(u => u.role === 'peserta');
        const accessiblePeserta = allPeserta.filter(p => isMasterAdmin || currentUser.jobSites.length === 0 || currentUser.jobSites.includes(p.jobSite));
        
        if (!searchTerm) return accessiblePeserta;
        
        const searchTermLower = searchTerm.toLowerCase();
        return accessiblePeserta.filter(p => 
            p.nama.toLowerCase().includes(searchTermLower) ||
            p.nik.toLowerCase().includes(searchTermLower)
        );
    }, [users, currentUser, searchTerm]);

    return (
        <div>
            <div className="sm:flex sm:justify-between sm:items-center mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">Kelola Peserta</h1>
                    <span className="px-3 py-1 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full">{pesertaList.length} Peserta</span>
                </div>
                <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari NIK atau Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <button onClick={() => handleOpenModal()} className="w-full mt-2 sm:mt-0 sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" /> Tambah Manual</button>
                </div>
            </div>
            <div className="sm:flex sm:justify-end sm:items-center mb-4">
                 <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
                    <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
                    <button onClick={handleDownloadFormat} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"><Download className="h-4 w-4 mr-2" /> Format</button>
                    <button onClick={() => importInputRef.current.click()} className="w-full mt-2 sm:mt-0 sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"><Upload className="h-4 w-4 mr-2" /> Import</button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600">
                        <tr>
                             {['NIK', 'Nama', 'Grade', 'Job Site', 'IDP', 'Tahun Ujikom', 'Password', 'Aksi'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pesertaList.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.nik}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.grade}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.jobSite}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.idp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.tahunUjikom}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{p.password}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeletePeserta(p.id)} className="text-red-600 hover:text-red-900 ml-4">Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <PesertaModal
                    onClose={handleCloseModal}
                    onSave={handleSavePeserta}
                    peserta={editingPeserta}
                    masterData={masterData}
                />
            )}
        </div>
    );
}