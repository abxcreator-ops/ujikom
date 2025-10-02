import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FileLock as FilePen, Trash2, PlusCircle, ChevronDown, Upload, Download, ImagePlus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SoalModal({ soal, onSave, onClose, masterData }) {
    const [editedSoal, setEditedSoal] = useState(soal || {
        id: Date.now(),
        idp: '',
        grade: '',
        nilai: 10,
        pertanyaan: '',
        pilihan: ['', '', '', ''],
        jawabanBenar: 'A',
        gambar: ''
    });
    const imageInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedSoal(prev => ({ ...prev, [name]: value }));
    };

    const handlePilihanChange = (index, value) => {
        const newPilihan = [...editedSoal.pilihan];
        newPilihan[index] = value;
        setEditedSoal(prev => ({ ...prev, pilihan: newPilihan }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedSoal(prev => ({ ...prev, gambar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editedSoal);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{soal ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">IDP</label>
                            <select name="idp" value={editedSoal.idp} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="">Pilih IDP</option>
                                {masterData.idp.map(idp => <option key={idp} value={idp}>{idp}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Grade</label>
                            <select name="grade" value={editedSoal.grade} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="">Pilih Grade</option>
                                {masterData.grade.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pertanyaan</label>
                        <textarea name="pertanyaan" value={editedSoal.pertanyaan} onChange={handleChange} required rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gambar</label>
                        <div className="mt-1">
                            <input type="file" accept="image/*" onChange={handleImageUpload} ref={imageInputRef} className="hidden" />
                            <button type="button" onClick={() => imageInputRef.current.click()} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                                <ImagePlus className="h-5 w-5 mr-2" />
                                {editedSoal.gambar ? 'Ganti Gambar' : 'Tambah Gambar'}
                            </button>
                        </div>
                        {editedSoal.gambar && <img src={editedSoal.gambar} alt="Preview" className="mt-2 max-h-40 rounded border" />}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editedSoal.pilihan.map((p, index) => (
                            <div key={index}>
                                <label className="block text-sm font-medium text-gray-700">Pilihan {String.fromCharCode(65 + index)}</label>
                                <input type="text" value={p} onChange={(e) => handlePilihanChange(index, e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jawaban Benar</label>
                            <select name="jawabanBenar" value={editedSoal.jawabanBenar} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nilai</label>
                            <input type="number" name="nilai" value={editedSoal.nilai} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const AccordionItem = ({ title, children, isOpen, onClick, onDelete }) => (
    <div className="border-b">
        <div className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50">
            <button onClick={onClick} className="flex-grow flex items-center text-gray-800 font-semibold">
                <span>{title}</span>
                <ChevronDown className={`ml-2 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {onDelete && (
                <button onClick={onDelete} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors" title={`Hapus semua soal IDP ini`}>
                    <Trash2 className="h-5 w-5" />
                </button>
            )}
        </div>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                        open: { opacity: 1, height: 'auto' },
                        collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                >
                    <div className="p-4 bg-gray-50">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default function KelolaSoalPage({ soalUjianState, masterData }) {
    const { soalUjian, setSoalUjian } = soalUjianState;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSoal, setEditingSoal] = useState(null);
    const [openIdp, setOpenIdp] = useState(null);
    const [openGrade, setOpenGrade] = useState(null);

    const handleImport = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            const newSoal = json.map((row, index) => ({
                id: Date.now() + index,
                idp: row.IDP,
                grade: row.Grade,
                nilai: row.Nilai,
                pertanyaan: row.Pertanyaan,
                pilihan: [row.PilihanA, row.PilihanB, row.PilihanC, row.PilihanD].filter(p => p !== undefined),
                jawabanBenar: row.JawabanBenar,
                gambar: row.Gambar || '',
            }));

            setSoalUjian(prev => [...prev, ...newSoal]);
        };
        reader.readAsArrayBuffer(file);
        event.target.value = null;
    };

    const handleExportTemplate = () => {
        const templateData = [
            { IDP: 'ENGINE-01', Grade: 'M1', Nilai: 10, Pertanyaan: 'Apa fungsi oli mesin?', PilihanA: 'Mendinginkan', PilihanB: 'Membersihkan', PilihanC: 'Melumasi', PilihanD: 'Menambah tenaga', JawabanBenar: 'C', Gambar: 'url_gambar_opsional' }
        ];
        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Soal");
        XLSX.writeFile(workbook, "Template_Soal_Ujian.xlsx");
    };

    const handleOpenModal = (soal = null) => {
        setEditingSoal(soal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSoal(null);
    };

    const handleSaveSoal = (soalToSave) => {
        if (editingSoal) {
            setSoalUjian(prev => prev.map(s => s.id === soalToSave.id ? soalToSave : s));
        } else {
            setSoalUjian(prev => [...prev, soalToSave]);
        }
    };
    
    const handleDeleteSoal = (soalId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
            setSoalUjian(prev => prev.filter(s => s.id !== soalId));
        }
    };

    const handleDeleteIdp = (idpToDelete) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus semua soal untuk IDP "${idpToDelete}"? Tindakan ini tidak dapat dibatalkan.`)) {
            setSoalUjian(prev => prev.filter(s => s.idp !== idpToDelete));
        }
    };

    const groupedSoal = soalUjian.reduce((acc, soal) => {
        const { idp, grade } = soal;
        if (!acc[idp]) acc[idp] = {};
        if (!acc[idp][grade]) acc[idp][grade] = [];
        acc[idp][grade].push(soal);
        return acc;
    }, {});

    const filteredIdps = Object.keys(groupedSoal).filter(idp => 
        idp.toLowerCase().includes(searchTerm.toLowerCase()) || 
        Object.values(groupedSoal[idp]).flat().some(s => s.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Bank Soal</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm transition-colors">
                        <PlusCircle className="h-5 w-5 mr-2" /> Tambah Soal
                    </button>
                    <button onClick={handleExportTemplate} className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                        <Download className="h-5 w-5 mr-2" /> Template
                    </button>
                    <label className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 cursor-pointer transition-colors">
                        <Upload className="h-5 w-5 mr-2" /> Import
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
                    </label>
                </div>
            </div>
            
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari berdasarkan IDP atau isi pertanyaan..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {filteredIdps.length > 0 ? filteredIdps.sort().map(idp => (
                    <AccordionItem 
                        key={idp} 
                        title={`IDP: ${idp}`}
                        isOpen={openIdp === idp}
                        onClick={() => setOpenIdp(openIdp === idp ? null : idp)}
                        onDelete={(e) => { e.stopPropagation(); handleDeleteIdp(idp); }}
                    >
                        <div className="space-y-2">
                            {Object.keys(groupedSoal[idp]).sort().map(grade => (
                                <AccordionItem
                                    key={grade}
                                    title={`Grade: ${grade}`}
                                    isOpen={openGrade === `${idp}-${grade}`}
                                    onClick={() => setOpenGrade(openGrade === `${idp}-${grade}` ? null : `${idp}-${grade}`)}
                                >
                                    <div className="space-y-3">
                                        {groupedSoal[idp][grade].map(soal => (
                                            <div key={soal.id} className="p-3 border bg-white rounded-md flex justify-between items-start hover:shadow-sm transition-shadow">
                                                <div>
                                                    <p className="font-medium text-gray-800">{soal.pertanyaan}</p>
                                                    {soal.gambar && <img src={soal.gambar} alt="Soal" className="mt-2 max-h-40 rounded border" />}
                                                    <div className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
                                                        <span>Jawaban: <span className="font-semibold text-green-600">{soal.jawabanBenar}</span></span>
                                                        <span>Nilai: <span className="font-semibold text-gray-700">{soal.nilai}</span></span>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1 ml-4">
                                                    <button onClick={() => handleOpenModal(soal)} className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors">
                                                        <FilePen className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteSoal(soal.id)} className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionItem>
                            ))}
                        </div>
                    </AccordionItem>
                )) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">Tidak ada soal yang ditemukan.</p>
                        <p className="text-sm text-gray-400 mt-2">Coba kata kunci lain atau buat soal baru.</p>
                    </div>
                )}
            </div>
            {isModalOpen && <SoalModal soal={editingSoal} onSave={handleSaveSoal} onClose={handleCloseModal} masterData={masterData} />}
        </div>
    );
}