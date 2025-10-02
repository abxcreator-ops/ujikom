import React, { useState, useEffect } from 'react';

// Komponen utama untuk Dashboard Peserta
export default function PesertaDashboard({ currentUser, onLogout, soalUjian: allSoal, hasilUjianState }) {
    const { hasilUjian, setHasilUjian } = hasilUjianState;
    const [examState, setExamState] = useState('start'); // 'start', 'progress', 'finished'
    const [userResult, setUserResult] = useState(null);

    // Filter soal yang relevan untuk peserta yang login
    const relevantSoal = allSoal.filter(s => s.idp === currentUser.idp && s.grade === currentUser.grade);

    // Cari hasil ujian peserta saat komponen dimuat
    useEffect(() => {
        const result = hasilUjian.find(h => h.pesertaId === currentUser.id);
        if (result && result.skorTertulis != null) {
            setUserResult(result);
            setExamState('finished');
        }
    }, [hasilUjian, currentUser.id]);

    const handleStartExam = () => {
        setExamState('progress');
    };

    const handleFinishExam = (finalScore, correctAnswers) => {
        const resultIndex = hasilUjian.findIndex(h => h.pesertaId === currentUser.id);
        let newResult;

        if (resultIndex > -1) {
            // Update hasil yang ada
            const updatedResults = [...hasilUjian];
            updatedResults[resultIndex] = {
                ...updatedResults[resultIndex],
                skorTertulis: finalScore,
                jawabanBenar: correctAnswers,
                jawabanSalah: relevantSoal.length - correctAnswers,
                jumlahSoal: relevantSoal.length
            };
            setHasilUjian(updatedResults);
            newResult = updatedResults[resultIndex];
        } else {
            // Buat hasil baru
            newResult = {
                id: Date.now(),
                pesertaId: currentUser.id,
                skorTertulis: finalScore,
                jumlahSoal: relevantSoal.length,
                jawabanBenar: correctAnswers,
                jawabanSalah: relevantSoal.length - correctAnswers,
                skorInterview: null,
                interviewDetail: { /* Inisialisasi detail interview kosong */ }
            };
            setHasilUjian([...hasilUjian, newResult]);
        }
        setUserResult(newResult);
        setExamState('finished');
    };

    // Tampilan berdasarkan state ujian
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {examState === 'start' && <UjianStartPage onStart={handleStartExam} namaPeserta={currentUser.nama} />}
            {examState === 'progress' && <UjianProgressPage soal={relevantSoal} onFinish={handleFinishExam} />}
            {examState === 'finished' && userResult && (
                <HasilUjianPesertaPage
                    onLogout={onLogout}
                    skor={userResult.skorTertulis}
                    totalNilai={relevantSoal.reduce((sum, s) => sum + s.nilai, 0)}
                />
            )}
        </div>
    );
}

// --- Komponen Halaman Mulai Ujian ---
function UjianStartPage({ onStart, namaPeserta }) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {namaPeserta}!</h1>
            <p className="mt-4 text-gray-600">Anda akan memulai Uji Kompetensi. Mohon perhatikan instruksi berikut:</p>
            <ul className="mt-6 text-left max-w-lg mx-auto space-y-2 text-gray-600">
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">&#10003;</span> Pastikan koneksi internet Anda stabil.</li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">&#10003;</span> Ujian memiliki batas waktu yang akan berjalan setelah Anda menekan 'Mulai Ujian'.</li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">&#10003;</span> Jawablah setiap pertanyaan dengan teliti.</li>
            </ul>
            <div className="mt-8">
                <button onClick={onStart} className="w-full max-w-xs px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                    Mulai Ujian
                </button>
            </div>
        </div>
    );
}

// --- Komponen Halaman Pengerjaan Ujian ---
function UjianProgressPage({ soal, onFinish }) {
    const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { soalId: 'A' }
    const totalSoal = soal.length;

    const handleAnswer = (soalId, pilihan) => {
        setAnswers(prev => ({ ...prev, [soalId]: pilihan }));
    };

    const handleSubmit = () => {
        if (!window.confirm("Apakah Anda yakin ingin menyelesaikan ujian?")) return;

        let score = 0;
        let correctAnswers = 0;
        soal.forEach(s => {
            if (answers[s.id] === s.jawabanBenar) {
                score += s.nilai;
                correctAnswers++;
            }
        });
        onFinish(score, correctAnswers);
    };

    const currentSoal = soal[currentSoalIndex];
    if (totalSoal === 0) {
         return <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800">Tidak Ada Soal</h2>
            <p className="mt-4 text-gray-600">Tidak ada soal ujian yang tersedia untuk IDP dan Grade Anda saat ini.</p>
        </div>
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Pertanyaan {currentSoalIndex + 1} dari {totalSoal}</h2>
                <div className="text-lg font-semibold text-indigo-600">Waktu: --:--</div>
            </div>

            <div className="space-y-4">
                {currentSoal.gambar && <img src={currentSoal.gambar} alt="Gambar Soal" className="max-w-md mx-auto rounded-lg mb-4" />}
                <p className="text-lg text-gray-700">{currentSoal.pertanyaan}</p>
                <div className="space-y-3 pt-4">
                    {currentSoal.pilihan.map((pilihan, index) => {
                        const pilihanLabel = String.fromCharCode(65 + index); // A, B, C, D
                        return (
                            <label key={pilihanLabel} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
                                <input
                                    type="radio"
                                    name={`soal-${currentSoal.id}`}
                                    value={pilihanLabel}
                                    checked={answers[currentSoal.id] === pilihanLabel}
                                    onChange={() => handleAnswer(currentSoal.id, pilihanLabel)}
                                    className="hidden"
                                />
                                <span className="font-semibold mr-4">{pilihanLabel}.</span>
                                <span>{pilihan}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between mt-8 border-t pt-6">
                <button
                    onClick={() => setCurrentSoalIndex(prev => prev - 1)}
                    disabled={currentSoalIndex === 0}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                    Sebelumnya
                </button>
                {currentSoalIndex < totalSoal - 1 ? (
                    <button
                        onClick={() => setCurrentSoalIndex(prev => prev + 1)}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Selanjutnya
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                        Selesaikan Ujian
                    </button>
                )}
            </div>
        </div>
    );
}


// --- Komponen Halaman Hasil Ujian ---
function HasilUjianPesertaPage({ onLogout, skor, totalNilai }) {
    const skorPersen = totalNilai > 0 ? (skor / totalNilai) * 100 : 0;
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800">Ujian Telah Selesai</h1>
            <p className="mt-4 text-gray-600">Terima kasih telah menyelesaikan tes tertulis.</p>
            <div className="mt-6">
                <p className="text-lg text-gray-700">Skor Anda:</p>
                <p className="text-6xl font-bold text-indigo-600 my-4">{skorPersen.toFixed(0)}</p>
                <p className="text-gray-600">Hasil akhir akan diumumkan oleh admin setelah sesi interview.</p>
            </div>
            <div className="mt-8">
                <button onClick={onLogout} className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    Logout
                </button>
            </div>
        </div>
    );
}