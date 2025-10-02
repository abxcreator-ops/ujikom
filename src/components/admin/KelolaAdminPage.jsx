import React, { useState, useMemo } from 'react';
import { Search, Plus, UserCog, Trash2, Edit } from 'lucide-react';

// ======================================================= //
//                KOMPONEN MODAL (INTERNAL)                //
// ======================================================= //

function AdminModal({ onClose, onSave, admin, masterData }) {
    const [formData, setFormData] = useState({
        nik: '',
        nama: '',
        jabatan: '',
        peran: 'Admin Biasa',
        password: '',
        jobSites: [],
    });

    // useEffect untuk mengisi form jika dalam mode edit
    useState(() => {
        if (admin) {
            setFormData({
                id: admin.id,
                nik: admin.nik || '',
                nama: admin.nama || '',
                jabatan: admin.jabatan || '',
                peran: admin.peran || 'Admin Biasa',
                password: admin.password || '',
                jobSites: admin.jobSites || [],
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleJobSiteChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentSites = prev.jobSites;
            if (checked) {
                return { ...prev, jobSites: [...currentSites, value] };
            } else {
                return { ...prev, jobSites: currentSites.filter(site => site !== value) };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{admin ? 'Edit Data Admin' : 'Tambah Admin Baru'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="mt-4 max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK</label>
                            <input type="text" id="nik" value={formData.nik} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" id="nama" value={formData.nama} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan</label>
                            <select id="jabatan" value={formData.jabatan} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="">-- Pilih Jabatan --</option>
                                {(masterData.jabatanAdmin || []).map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="peran" className="block text-sm font-medium text-gray-700">Peran</label>
                            <select id="peran" value={formData.peran} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                <option value="Admin Biasa">Admin Biasa</option>
                                <option value="Master Admin">Master Admin</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="text" id="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Lokasi Dinas (Job Site)</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {(masterData.jobSite || []).map(site => (
                                <label key={site} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={site}
                                        checked={formData.jobSites.includes(site)}
                                        onChange={handleJobSiteChange}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm"
                                    />
                                    <span>{site}</span>
                                </label>
                            ))}
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


// ======================================================= //
//              KOMPONEN UTAMA HALAMAN (EXPORT)              //
// ======================================================= //

export default function KelolaAdminPage({ usersState, masterData }) {
    const { users, setUsers } = usersState;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (admin = null) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingAdmin(null);
        setIsModalOpen(false);
    };

    const handleSaveAdmin = (adminData) => {
        if (adminData.id) {
            // Mode Edit
            setUsers(users.map(u => u.id === adminData.id ? { ...u, ...adminData } : u));
        } else {
            // Mode Tambah
            const newAdmin = {
                ...adminData,
                id: Date.now(),
                role: 'admin',
                username: adminData.nama.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 100),
            };
            setUsers([...users, newAdmin]);
        }
        handleCloseModal();
    };

    const handleDeleteAdmin = (adminId) => {
        const adminToDelete = users.find(u => u.id === adminId);
        if (adminToDelete.peran === 'Master Admin') {
            alert('Master Admin tidak dapat dihapus.');
            return;
        }

        if (window.confirm(`Apakah Anda yakin ingin menghapus admin ${adminToDelete.nama}?`)) {
            setUsers(users.filter(u => u.id !== adminId));
        }
    };

    const filteredAdmins = useMemo(() => {
        const admins = users.filter(u => u.role === 'admin');
        if (!searchTerm) return admins;
        const searchTermLower = searchTerm.toLowerCase();
        return admins.filter(admin => 
            admin.nama.toLowerCase().includes(searchTermLower) ||
            admin.nik.toLowerCase().includes(searchTermLower)
        );
    }, [users, searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Kelola Admin</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari NIK atau Nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-xs pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Tambah Admin
                    </button>
                </div>
            </div>

            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-600">
                        <tr>
                            {['NIK', 'Nama', 'Jabatan', 'Peran', 'Lokasi Dinas', 'Aksi'].map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAdmins.map(admin => (
                            <tr key={admin.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.nik}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.jabatan}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${admin.peran === 'Master Admin' ? 'text-indigo-600' : 'text-gray-500'}`}>{admin.peran}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.jobSites?.join(', ') || 'Semua Lokasi'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleOpenModal(admin)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"><Edit className="h-4 w-4" /> Edit</button>
                                        <button onClick={() => handleDeleteAdmin(admin.id)} className="flex items-center gap-1 text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AdminModal 
                    onClose={handleCloseModal}
                    onSave={handleSaveAdmin}
                    admin={editingAdmin}
                    masterData={masterData}
                />
            )}
        </div>
    );
}