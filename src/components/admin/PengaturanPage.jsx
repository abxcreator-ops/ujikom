import React, { useState, useRef } from 'react';

function MasterDataCard({ title, type, dataList, onAdd, onDelete }) {
    const [newItem, setNewItem] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            onAdd(type, newItem.trim());
            setNewItem('');
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-gray-800 border-b pb-2">{title}</h3>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-2">
                {(dataList || []).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded">
                        <span>{item}</span>
                        <button
                            onClick={() => onDelete(type, index)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title={`Hapus ${item}`}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAdd} className="mt-3 flex space-x-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`${title.replace('Kelola ', '')} Baru`}
                    required
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm"
                />
                <button type="submit" className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add</button>
            </form>
        </div>
    );
}

export default function PengaturanPage({ masterDataState }) {
    const { masterData, setMasterData } = masterDataState;
    const logoInputRef = useRef(null);

    const handleAddItem = (type, value) => {
        if (masterData[type]?.includes(value)) {
            alert(`Item "${value}" sudah ada.`);
            return;
        }
        setMasterData(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), value]
        }));
    };

    const handleDeleteItem = (type, index) => {
        const itemToDelete = masterData[type]?.[index];
        if (itemToDelete && window.confirm(`Apakah Anda yakin ingin menghapus "${itemToDelete}"?`)) {
            setMasterData(prev => ({
                ...prev,
                [type]: prev[type].filter((_, i) => i !== index)
            }));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setMasterData(prev => ({ ...prev, logo: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Pengaturan Data Master</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <MasterDataCard title="Kelola IDP" type="idp" dataList={masterData.idp} onAdd={handleAddItem} onDelete={handleDeleteItem} />
                <MasterDataCard title="Kelola Grade" type="grade" dataList={masterData.grade} onAdd={handleAddItem} onDelete={handleDeleteItem} />
                <MasterDataCard title="Kelola Section" type="section" dataList={masterData.section} onAdd={handleAddItem} onDelete={handleDeleteItem} />
                <MasterDataCard title="Kelola Jabatan Peserta" type="jabatan" dataList={masterData.jabatan} onAdd={handleAddItem} onDelete={handleDeleteItem} />
                <MasterDataCard title="Kelola Jabatan Admin" type="jabatanAdmin" dataList={masterData.jabatanAdmin} onAdd={handleAddItem} onDelete={handleDeleteItem} />
                <MasterDataCard title="Kelola Job Site" type="jobSite" dataList={masterData.jobSite} onAdd={handleAddItem} onDelete={handleDeleteItem} />

                <div className="bg-white p-4 rounded-lg shadow md:col-span-2 lg:col-span-3">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">Kelola Logo Aplikasi</h3>
                    <div className="mt-4 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo Saat Ini</label>
                            <img
                                src={masterData.logo}
                                className="mt-2 h-20 w-auto object-contain rounded-md bg-gray-100 p-2 border"
                                alt="Logo Preview"
                            />
                        </div>
                        <div>
                            <input type="file" ref={logoInputRef} onChange={handleLogoChange} className="hidden" accept="image/*" />
                            <button
                                type="button"
                                onClick={() => logoInputRef.current.click()}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                            >
                                Pilih File Gambar
                            </button>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG direkomendasikan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}