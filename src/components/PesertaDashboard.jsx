import React, { useState, useEffect } from 'react';

export default function PesertaDashboard({ appState, onLogout }) {
    const { loggedInUser, hasilUjian, setHasilUjian, soalUjian } = appState;

    const [examState, setExamState] = useState('start'); 
    const [userResult, setUserResult] = useState(null);

    const relevantSoal = soalUjian.filter(s => s.idp === loggedInUser.idp && s.grade === loggedInUser.grade);

    useEffect(() => {
        const result = hasilUjian.find(h => h.pesertaId === loggedInUser.id);
        if (result && result.skorTertulis != null) {
            setUserResult(result);
            setExamState('finished');
        }
    }, [hasilUjian, loggedInUser.id]);

    const handleStartExam = () => {
        if (relevantSoal.length === 0) {
            alert("Tidak ada soal yang tersedia untuk Anda saat ini.");
            return;
        }
        setExamState('progress');
    };

    const handleFinishExam = (finalScore, correctAnswers) => {
        const resultIndex = hasilUjian.findIndex(h => h.pesertaId === loggedInUser.id);
        let newResult;

        if (resultIndex > -1) {
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
            newResult = {
                id: Date.now(),
                pesertaId: loggedInUser.id,
                skorTertulis: finalScore,
                jumlahSoal: relevantSoal.length,
                jawabanBenar: correctAnswers,
                jawabanSalah: relevantSoal.length - correctAnswers,
                skorInterview: null,
                interviewDetail: { 
                    tanggal: '', namaPenguji: '', nikPenguji: '', jabatanPenguji: '', 
                    penilaian: [ { aspek: 'Aspek Safety', items: [] }, { aspek: 'Aspek Teknik', items: [] }, { aspek: 'Aspek Maintenance Management', items: [] }, { aspek: 'Aspek HPU WAY', items: [] } ], 
                    ringkasan: '', keunggulan: '', saran: '' 
                }
            };
            setHasilUjian([...hasilUjian, newResult]);
        }
        setUserResult(newResult);
        setExamState('finished');
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {examState === 'start' && <UjianStartPage onStart={handleStartExam} namaPeserta={loggedInUser.nama} />}
            {examState === 'progress' && <UjianProgressPage soal={relevantSoal} onFinish={handleFinishExam} />}
            {examState === 'finished' && userResult && (
                <HasilUjianPesertaPage
                    onLogout={onLogout}
                />
            )}
        </div>
    );
}

function UjianStartPage({ onStart, namaPeserta }) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800">Selamat Datang, {namaPeserta}!</h1>
            <p className="mt-4 text-gray-600">Anda akan memulai Uji Kompetensi. Mohon perhatikan instruksi berikut:</p>
            <ul className="mt-6 text-left max-w-lg mx-auto space-y-2 text-gray-600">
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">&#10003;</span> Pastikan koneksi internet Anda stabil.</li>
                <li className="flex items-start"><span className="text-indigo-500 font-bold mr-2">&#10003;</span> Ujian memiliki batas waktu 90 menit yang akan berjalan setelah Anda menekan 'Mulai Ujian'.</li>
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

function UjianProgressPage({ soal, onFinish }) {
    const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const totalSoal = soal.length;

    useEffect(() => {
        if (timeLeft <= 0) {
            handleSubmit(true); // Auto-submit when time is up
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (soalId, pilihan) => {
        setAnswers(prev => ({ ...prev, [soalId]: pilihan }));
    };

    const handleAttemptSubmit = () => {
        setShowSubmitConfirm(true);
    };

    const handleSubmit = (isAutoSubmit = false) => {
        const unansweredQuestions = soal.filter(s => !answers[s.id]);
        if (unansweredQuestions.length > 0 && !isAutoSubmit) {
            alert(`Anda belum menjawab ${unansweredQuestions.length} soal. Harap jawab semua pertanyaan sebelum menyelesaikan ujian.`);
            setShowSubmitConfirm(false);
            return;
        }

        if (!isAutoSubmit && !window.confirm("Apakah Anda yakin ingin menyelesaikan ujian? Jawaban tidak dapat diubah kembali.")) {
            setShowSubmitConfirm(false);
            return;
        }

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

    const jumpToSoal = (index) => {
        setCurrentSoalIndex(index);
        setShowSubmitConfirm(false);
    };

    const currentSoal = soal[currentSoalIndex];
    
    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Pertanyaan {currentSoalIndex + 1} dari {totalSoal}</h2>
                <div className={`text-lg font-semibold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                    Waktu: {formatTime(timeLeft)}
                </div>
            </div>

            <div className="space-y-4">
                {currentSoal.gambar && <img src={currentSoal.gambar} alt="Gambar Soal" className="max-w-md w-full mx-auto rounded-lg mb-4 border" />}
                <p className="text-lg text-gray-700 leading-relaxed">{currentSoal.pertanyaan}</p>
                <div className="space-y-3 pt-4">
                    {currentSoal.pilihan.map((pilihan, index) => {
                        const pilihanLabel = String.fromCharCode(65 + index);
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
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        onClick={handleAttemptSubmit}
                        className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                        Selesaikan Ujian
                    </button>
                )}
            </div>

            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-lg font-bold mb-4">Konfirmasi Penyelesaian Ujian</h3>
                        <p className="mb-4">Silakan periksa kembali jawaban Anda. Soal yang belum terjawab ditandai dengan warna merah.</p>
                        <div className="flex flex-wrap gap-2 mb-6 border-t border-b py-4">
                            {soal.map((s, index) => (
                                <button
                                    key={s.id}
                                    onClick={() => jumpToSoal(index)}
                                    className={`w-10 h-10 rounded-md flex items-center justify-center font-semibold ${
                                        answers[s.id] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowSubmitConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-md">Kembali</button>
                            <button onClick={() => handleSubmit(false)} className="px-4 py-2 bg-green-600 text-white rounded-md">Kirim Jawaban</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function HasilUjianPesertaPage({ onLogout }) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-gray-800">Terima Kasih!</h1>
            <p className="mt-4 text-gray-600">Anda telah berhasil menyelesaikan tes tertulis.</p>
            <p className="mt-2 text-gray-600">Hasil akhir akan diumumkan oleh admin setelah seluruh rangkaian tes selesai.</p>
            <div className="mt-8">
                <button onClick={onLogout} className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                    Logout
                </button>
            </div>
        </div>
    );
}