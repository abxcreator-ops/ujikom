import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, UserPlus, Trash2 } from 'lucide-react';

function PengujiModal({ onClose, onSave }) {
    const [pengujiData, setPengujiData] = useState({ nama: '', nik: '', jabatan: '' });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setPengujiData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pengujiData.nama && pengujiData.nik && pengujiData.jabatan) {
            onSave(pengujiData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Tambah Penguji Baru</h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Penguji</label>
                        <input type="text" id="nama" value={pengujiData.nama} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK Penguji</label>
                        <input type="text" id="nik" value={pengujiData.nik} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">Jabatan Penguji</label>
                        <input type="text" id="jabatan" value={pengujiData.jabatan} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function InterviewModal({ hasil, users, soalUjian, masterData, onClose, onSave }) {
  const { toast } = useToast();
  const peserta = users.find(u => u.id === hasil.pesertaId);
  const [isPengujiModalOpen, setIsPengujiModalOpen] = useState(false);

  const getCatatanOtomatis = (nilai) => {
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || nilai === '') return '';
    if (numNilai < 56) return "Peserta tidak memahami";
    if (numNilai < 65) return "Peserta pernah mendengar tapi belum memahami";
    if (numNilai < 75) return "Peserta cukup memahami";
    if (numNilai < 80) return "Peserta sudah memahami";
    return "Peserta sudah sangat memahami";
  };

  const initialInterviewDetail = {
    tanggal: new Date().toISOString().split('T')[0],
    penguji: [],
    penilaian: [
      { aspek: 'Aspek Safety', items: [{ pertanyaan: '', nilai: '', catatan: '' }] },
      { aspek: 'Aspek Teknik', items: [{ pertanyaan: '', nilai: '', catatan: '' }] },
      { aspek: 'Aspek Maintenance Management', items: [{ pertanyaan: '', nilai: '', catatan: '' }] },
      { aspek: 'Aspek HPU WAY', items: [{ pertanyaan: '', nilai: '', catatan: '' }] },
    ],
    ringkasan: '',
    keunggulan: '',
    saran: '',
  };

  const [interviewData, setInterviewData] = useState(
    hasil.interviewDetail && hasil.interviewDetail.penilaian?.length > 0
      ? JSON.parse(JSON.stringify(hasil.interviewDetail))
      : JSON.parse(JSON.stringify(initialInterviewDetail))
  );
  const [averageScores, setAverageScores] = useState({});

  useEffect(() => {
    const newAverageScores = {};
    interviewData.penilaian.forEach(p => {
      const validItems = p.items.filter(item => item.nilai !== '' && !isNaN(item.nilai));
      if (validItems.length > 0) {
        const total = validItems.reduce((sum, item) => sum + Number(item.nilai), 0);
        newAverageScores[p.aspek] = (total / validItems.length).toFixed(2);
      } else {
        newAverageScores[p.aspek] = '--';
      }
    });
    setAverageScores(newAverageScores);
  }, [interviewData]);

  const handleDetailChange = (e) => {
    const { id, value } = e.target;
    setInterviewData(prev => ({ ...prev, [id]: value }));
  };

  const handlePenilaianChange = (aspekIndex, itemIndex, field, value) => {
    const newData = { ...interviewData };
    const currentItem = newData.penilaian[aspekIndex].items[itemIndex];
    currentItem[field] = value;

    if (field === 'nilai') {
      currentItem.catatan = getCatatanOtomatis(value);
    }
    
    setInterviewData(newData);
  };

  const addPertanyaan = (aspekIndex) => {
    const newData = { ...interviewData };
    newData.penilaian[aspekIndex].items.push({ pertanyaan: '', nilai: '', catatan: '' });
    setInterviewData(newData);
  };

  const removePertanyaan = (aspekIndex, itemIndex) => {
    const newData = { ...interviewData };
    newData.penilaian[aspekIndex].items.splice(itemIndex, 1);
    setInterviewData(newData);
  };

  const generateKesimpulan = () => {
    let allItems = [];
    interviewData.penilaian.forEach(p => {
        allItems = [...allItems, ...p.items.map(item => ({ ...item, aspek: p.aspek }))];
    });

    const validItems = allItems.filter(item => item.nilai !== '' && !isNaN(item.nilai) && item.pertanyaan.trim() !== '');
    if (validItems.length === 0) {
        toast({ title: "Analisa Gagal", description: "Isi data penilaian terlebih dahulu.", variant: "destructive" });
        return;
    }

    const sortedItems = [...validItems].sort((a, b) => Number(b.nilai) - Number(a.nilai));
    const topStrengths = sortedItems.slice(0, 3).filter(item => Number(item.nilai) >= 75);
    const topWeaknesses = sortedItems.slice(-3).filter(item => Number(item.nilai) < 70).reverse();

    let keunggulanText = "Peserta menunjukkan pemahaman yang baik pada beberapa area kunci:\n";
    if (topStrengths.length > 0) {
        keunggulanText += topStrengths.map(item => `- Pemahaman kuat pada topik "${item.pertanyaan}" (${item.aspek}) dengan nilai ${item.nilai}.`).join("\n");
    } else {
        keunggulanText = "Peserta menunjukkan pemahaman yang cukup merata di berbagai aspek yang diujikan.";
    }

    let saranText = "Area yang memerlukan pengembangan lebih lanjut:\n";
    if (topWeaknesses.length > 0) {
        saranText += topWeaknesses.map(item => `- Perlu peningkatan pemahaman pada topik "${item.pertanyaan}" (${item.aspek}) yang mendapat nilai ${item.nilai}.`).join("\n");
    } else {
        saranText = "Secara umum, tidak ada area kelemahan yang signifikan. Disarankan untuk terus memperdalam pengetahuan secara menyeluruh.";
    }

    const aspectAverages = Object.entries(averageScores)
        .filter(([, score]) => score !== '--')
        .map(([aspek, score]) => ({ aspek, score: Number(score) }))
        .sort((a, b) => b.score - a.score);

    let ringkasanText = `Peserta, ${peserta.nama}, telah menyelesaikan sesi interview. `;
    if (aspectAverages.length > 0) {
        const strongestAspect = aspectAverages[0];
        const weakestAspect = aspectAverages[aspectAverages.length - 1];

        ringkasanText += `Analisis menunjukkan kompetensi terkuat pada ${strongestAspect.aspek} dengan skor rata-rata ${strongestAspect.score.toFixed(0)}. `;
        if (strongestAspect.score > weakestAspect.score + 10) {
             ringkasanText += `Sebaliknya, area yang paling membutuhkan perhatian adalah ${weakestAspect.aspek} (skor ${weakestAspect.score.toFixed(0)}). `;
        } else {
            ringkasanText += `Performa cukup seimbang di semua aspek. `;
        }
    } else {
        ringkasanText += "Data penilaian belum cukup untuk membuat ringkasan analitis. ";
    }
    ringkasanText += "Rekomendasi pengembangan telah diidentifikasi untuk meningkatkan performa di masa depan.";


    setInterviewData(prev => ({
        ...prev,
        ringkasan: ringkasanText,
        keunggulan: keunggulanText,
        saran: saranText
    }));

    toast({ title: "Analisa Berhasil!", description: "Ringkasan, keunggulan, dan saran telah dibuat secara otomatis." });
  };

  const handleSave = () => {
    let totalNilai = 0;
    let totalBobot = 0;
    interviewData.penilaian.forEach(p => {
      const validItems = p.items.filter(item => item.nilai !== '' && !isNaN(item.nilai));
      if (validItems.length > 0) {
        const total = validItems.reduce((sum, item) => sum + Number(item.nilai), 0);
        totalNilai += total / validItems.length;
        totalBobot++;
      }
    });

    const skorInterview = totalBobot > 0 ? (totalNilai / totalBobot) : 0;

    const updatedHasil = {
      ...hasil,
      skorInterview: Math.round(skorInterview),
      interviewDetail: interviewData,
    };

    onSave(updatedHasil);
    toast({
      title: "Berhasil! ✨",
      description: "Data interview telah berhasil disimpan.",
    });
  };

  const handleAddPenguji = (newPenguji) => {
    setInterviewData(prev => ({
        ...prev,
        penguji: [...(prev.penguji || []), newPenguji]
    }));
    toast({ title: "Penguji Ditambahkan", description: `Data ${newPenguji.nama} telah ditambahkan ke daftar.` });
  };

  const handleRemovePenguji = (index) => {
    setInterviewData(prev => ({
        ...prev,
        penguji: prev.penguji.filter((_, i) => i !== index)
    }));
  };

  if (!peserta) {
    return null;
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Test Interview Peserta</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Data Diri Peserta</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
              <div><span className="font-medium">NIK:</span> {peserta.nik}</div>
              <div><span className="font-medium">Nama:</span> {peserta.nama}</div>
              <div><span className="font-medium">Jabatan:</span> {peserta.jabatan}</div>
              <div><span className="font-medium">Grade:</span> {peserta.grade}</div>
              <div><span className="font-medium">Section:</span> {peserta.section}</div>
              <div><span className="font-medium">IDP:</span> {peserta.idp}</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Nilai Test Tertulis</h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm text-blue-700">
              <div><span className="font-medium">Skor:</span> {hasil.skorTertulis}</div>
              <div><span className="font-medium">Jawaban Benar:</span> {hasil.jawabanBenar}</div>
              <div><span className="font-medium">Jawaban Salah:</span> {hasil.jawabanSalah}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Detail Interview</h3>
                <div className="flex items-center gap-4">
                    <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal Test</label>
                    <input type="date" id="tanggal" className="border border-gray-300 rounded-md shadow-sm p-2" value={interviewData.tanggal} onChange={handleDetailChange} />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-700">Tim Penguji</h4>
                    <button onClick={() => setIsPengujiModalOpen(true)} className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">
                        <UserPlus className="h-4 w-4 mr-2" /> Tambah Penguji
                    </button>
                </div>
                <div className="border rounded-lg p-2 space-y-2 bg-gray-50">
                    {interviewData.penguji && interviewData.penguji.length > 0 ? (
                        interviewData.penguji.map((p, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                                <div>
                                    <p className="font-semibold">{p.nama} <span className="font-normal text-gray-500">({p.jabatan})</span></p>
                                    <p className="text-sm text-gray-500">NIK: {p.nik}</p>
                                </div>
                                <button onClick={() => handleRemovePenguji(index)} className="p-1 text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-sm text-gray-500 py-2">Belum ada penguji ditambahkan.</p>
                    )}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Penilaian Wawancara</h3>
            {interviewData.penilaian.map((aspek, aspekIndex) => (
              <div key={aspekIndex} className="border p-4 rounded-md bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-800">{aspek.aspek}</h4>
                  <span className="text-sm font-medium text-gray-600">Nilai Rata-rata: {averageScores[aspek.aspek]}</span>
                </div>
                <div className="space-y-2">
                  {aspek.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="grid grid-cols-12 gap-2 items-start">
                      <textarea placeholder="Pertanyaan" rows="1" className="col-span-5 border border-gray-300 rounded-md p-2 text-sm resize-y" value={item.pertanyaan} onChange={(e) => handlePenilaianChange(aspekIndex, itemIndex, 'pertanyaan', e.target.value)} />
                      <input type="number" placeholder="Nilai" className="col-span-2 border border-gray-300 rounded-md p-2 text-sm" value={item.nilai} onChange={(e) => handlePenilaianChange(aspekIndex, itemIndex, 'nilai', e.target.value)} />
                      <textarea placeholder="Catatan" rows="1" className="col-span-4 border border-gray-300 rounded-md p-2 text-sm resize-y bg-gray-50" value={item.catatan} readOnly />
                      <button onClick={() => removePertanyaan(aspekIndex, itemIndex)} className="col-span-1 text-red-500 hover:text-red-700 text-xl font-bold self-center">&times;</button>
                    </div>
                  ))}
                  <button onClick={() => addPertanyaan(aspekIndex)} className="mt-2 px-3 py-1 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                    + Tambah Pertanyaan
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Kesimpulan</h3>
                <button onClick={generateKesimpulan} className="flex items-center px-3 py-1 text-sm text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-md hover:from-purple-600 hover:to-indigo-700">
                    <Sparkles className="h-4 w-4 mr-2" /> Buat Analisa Otomatis
                </button>
            </div>
            <textarea
              id="ringkasan"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[100px] bg-gray-50"
              placeholder="Klik tombol 'Buat Analisa Otomatis' atau tulis ringkasan manual di sini..."
              value={interviewData.ringkasan}
              onChange={handleDetailChange}
            ></textarea>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Keunggulan</h4>
                <textarea
                  id="keunggulan"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[80px] bg-gray-50"
                  placeholder="Keunggulan peserta akan muncul di sini..."
                  value={interviewData.keunggulan}
                  onChange={handleDetailChange}
                ></textarea>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Saran Pengembangan</h4>
                <textarea
                  id="saran"
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 min-h-[80px] bg-gray-50"
                  placeholder="Saran pengembangan akan muncul di sini..."
                  value={interviewData.saran}
                  onChange={handleDetailChange}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end p-6 border-t space-x-2 sticky bottom-0 bg-white z-10">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Batal
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Simpan Interview
          </button>
        </div>
      </div>
    </div>
    {isPengujiModalOpen && <PengujiModal onClose={() => setIsPengujiModalOpen(false)} onSave={handleAddPenguji} />}
    </>
  );
}