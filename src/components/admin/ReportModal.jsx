import React, { useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Chart from 'chart.js/auto';
import { getNextGrade, calculateMasaKerja } from '@/lib/utils';

export default function ReportModal({ hasil, users, soalUjian, masterData, onClose }) {
  const { toast } = useToast();
  const reportContentRef = useRef(null);
  const aspectChartRef = useRef(null);
  const peserta = users.find(u => u.id === hasil.pesertaId);

  const getSkorPersen = (hasilData, p) => {
    const soalUntukPeserta = soalUjian.filter(s => s.idp === p.idp && s.grade === p.grade);
    const totalNilaiMaksimal = soalUntukPeserta.reduce((sum, s) => sum + (s.nilai || 0), 0);
    return totalNilaiMaksimal > 0 ? (hasilData.skorTertulis / totalNilaiMaksimal) * 100 : 0;
  };

  const getNilaiAkhir = (hasilData, p) => {
    if (!p || hasilData.skorInterview === null || hasilData.skorInterview === undefined) return 0;
    const skorTertulisPersen = getSkorPersen(hasilData, p);
    const skorInterview = hasilData.skorInterview || 0;
    const nilaiBobotTertulis = skorTertulisPersen * 0.25;
    const nilaiBobotInterview = skorInterview * 0.75;
    return nilaiBobotTertulis + nilaiBobotInterview;
  };

  const getRekomendasiInfo = (nilaiAkhir) => {
    if (nilaiAkhir >= 70) return { text: 'LULUS', color: 'text-green-600' };
    if (nilaiAkhir >= 68) return { text: 'DIPERTIMBANGKAN', color: 'text-yellow-500' };
    return { text: 'TIDAK LULUS', color: 'text-red-600' };
  };

  useEffect(() => {
    if (!peserta || !hasil.interviewDetail?.penilaian) return;

    if (aspectChartRef.current) {
        aspectChartRef.current.destroy();
    }

    const aspectCtx = document.getElementById('modalAspectChart')?.getContext('2d');
    if (aspectCtx) {
        const aspectLabels = hasil.interviewDetail.penilaian.map(p => p.aspek);
        const aspectAverages = hasil.interviewDetail.penilaian.map(p => {
            const validItems = p.items.filter(item => item.nilai !== '' && !isNaN(item.nilai));
            if (validItems.length === 0) return 0;
            const total = validItems.reduce((sum, item) => sum + Number(item.nilai), 0);
            return (total / validItems.length);
        });

        const totalOfAverages = aspectAverages.reduce((sum, avg) => sum + avg, 0);
        const aspectRatios = totalOfAverages > 0 ? aspectAverages.map(avg => (avg / totalOfAverages) * 100) : aspectAverages.map(() => 0);

        aspectChartRef.current = new Chart(aspectCtx, {
            type: 'bar',
            data: {
                labels: aspectLabels,
                datasets: [{
                    label: 'Rasio Kontribusi Aspek (%)',
                    data: aspectRatios,
                    backgroundColor: ['#818CF8', '#60A5FA', '#34D399', '#FBBF24'],
                    borderColor: ['#4F46E5', '#2563EB', '#059669', '#D97706'],
                    borderWidth: 1,
                    borderRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: { x: { beginAtZero: true, max: 100, grid: { display: false } }, y: { grid: { display: false } } },
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Rasio: ${context.raw.toFixed(2)}%`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value) => `${value.toFixed(1)}%`,
                        color: '#374151',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            }
        });
    }
    return () => {
        if (aspectChartRef.current) {
            aspectChartRef.current.destroy();
        }
    };
  }, [hasil, peserta]);

  if (!peserta) {
    return null;
  }

  const nilaiAkhir = getNilaiAkhir(hasil, peserta);
  const skorTertulisPersen = getSkorPersen(hasil, peserta);
  const skorInterview = hasil.skorInterview || 0;
  const nilaiBobotTertulis = skorTertulisPersen * 0.25;
  const nilaiBobotInterview = skorInterview * 0.75;
  const rekomendasiInfo = getRekomendasiInfo(nilaiAkhir);

  const gradeTujuan = getNextGrade(peserta.grade, masterData.grade);
  let rekomendasiFinal = "";
  if (nilaiAkhir >= 70) {
    rekomendasiFinal = `PESERTA DINYATAKAN LULUS DAN DIREKOMENDASIKAN UNTUK NAIK KE GRADE ${gradeTujuan}.`;
  } else if (nilaiAkhir >= 68) {
    rekomendasiFinal = `PESERTA DIPERTIMBANGKAN UNTUK NAIK KE GRADE ${gradeTujuan}.`;
  } else {
    rekomendasiFinal = `PESERTA TIDAK DIREKOMENDASIKAN NAIK KE GRADE ${gradeTujuan}.`;
  }

  const handleDownloadPDF = async () => {
    toast({ title: "Mengunduh PDF...", description: "Harap tunggu, proses ini mungkin memakan waktu." });
    const reportElement = reportContentRef.current;
    if (!reportElement) {
        toast({ title: "Gagal", description: "Konten laporan tidak ditemukan.", variant: "destructive" });
        return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pdfWidth - (margin * 2);
    let yPos = margin;

    const addPageIfNeeded = (elementHeight) => {
        if (yPos + elementHeight > pdfHeight - margin) {
            pdf.addPage();
            yPos = margin;
        }
    };

    const renderElement = async (element) => {
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        const heightInPdf = contentWidth / ratio;

        addPageIfNeeded(heightInPdf);
        pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, heightInPdf);
        yPos += heightInPdf + 5; // Add some space after the element
    };

    try {
        const sections = reportElement.querySelectorAll('.pdf-section');
        for (const section of sections) {
            await renderElement(section);
        }

        pdf.save(`Laporan_${peserta.nama.replace(/\s/g, '_')}.pdf`);
        toast({ title: "Berhasil!", description: "Laporan PDF telah diunduh." });
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ title: "Gagal Mengunduh", description: "Terjadi kesalahan saat membuat PDF.", variant: "destructive" });
    }
  };

  const pengujiList = hasil.interviewDetail?.penguji || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Laporan Hasil Uji Kompetensi</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="overflow-y-auto p-1">
            <div ref={reportContentRef} className="p-5 bg-white">
                <header className="pdf-section flex justify-between items-start pb-4 border-b-2 border-gray-800">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">LAPORAN HASIL UJI KOMPETENSI</h1>
                        <p className="text-sm text-gray-600">CONFIDENTIAL</p>
                    </div>
                    <img src={masterData.logo} alt="Logo Perusahaan" className="h-16 w-auto object-contain" />
                </header>

                <section className="pdf-section mt-6">
                    <h2 className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">A. BIODATA PESERTA UJIAN</h2>
                    <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">Nama</span><span className="font-semibold text-gray-800">{peserta.nama}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">NIK</span><span className="font-semibold text-gray-800">{peserta.nik}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">Jabatan</span><span className="font-semibold text-gray-800">{peserta.jabatan}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">Grade</span><span className="font-semibold text-gray-800">{peserta.grade}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">Section</span><span className="font-semibold text-gray-800">{peserta.section}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">Masa Kerja</span><span className="font-semibold text-gray-800">{calculateMasaKerja(peserta.tanggalBergabung)}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">Tahun Ujikom</span><span className="font-semibold text-gray-800">{peserta.tahunUjikom}</span></div>
                        <div className="flex justify-between border-b py-1"><span className="text-gray-600">IDP</span><span className="font-semibold text-gray-800">{peserta.idp}</span></div>
                    </div>
                </section>

                {pengujiList.length > 0 && (
                <section className="pdf-section mt-6">
                    <h2 className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">B. TIM PENGUJI</h2>
                    <div className="mt-3 space-y-3 text-sm">
                        {pengujiList.map((p, index) => (
                            <div key={index} className="p-2 border rounded-md bg-gray-50">
                                <p className="font-semibold">{index + 1}. {p.nama} <span className="font-normal text-gray-600">({p.jabatan})</span></p>
                                <p className="text-xs text-gray-500 ml-4">NIK: {p.nik}</p>
                            </div>
                        ))}
                        <div className="flex justify-end text-xs text-gray-600 pt-1">
                            <span>Tanggal Interview: {hasil.interviewDetail.tanggal}</span>
                        </div>
                    </div>
                </section>
                )}

                <section className="pdf-section mt-6">
                    <h2 className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">C. SKOR UJIAN</h2>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-blue-800">Tes Tertulis</p>
                            <p className="text-3xl font-bold text-blue-600">{skorTertulisPersen.toFixed(0)}</p>
                            <p className="text-xs text-blue-500">(Bobot 25%: {nilaiBobotTertulis.toFixed(1)})</p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-indigo-800">Tes Interview</p>
                            <p className="text-3xl font-bold text-indigo-600">{skorInterview.toFixed(0)}</p>
                            <p className="text-xs text-indigo-500">(Bobot 75%: {nilaiBobotInterview.toFixed(1)})</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-green-800">Nilai Akhir</p>
                            <p className="text-3xl font-bold text-green-600">{nilaiAkhir.toFixed(0)}</p>
                            <p className={`text-sm font-bold ${rekomendasiInfo.color}`}>{rekomendasiInfo.text}</p>
                        </div>
                    </div>
                </section>

                <section className="pdf-section mt-6">
                    <h2 className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">D. ANALISIS ASPEK INTERVIEW</h2>
                    <div className="mt-3 relative h-64"><canvas id="modalAspectChart"></canvas></div>
                </section>

                <section className="pdf-section mt-6">
                    <h2 className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">E. KESIMPULAN & SARAN</h2>
                    <div className="mt-3 space-y-4 text-sm">
                        {hasil.interviewDetail?.ringkasan && <div className="bg-gray-50 p-3 rounded-md"><h4 className="font-semibold text-gray-700 mb-1">Ringkasan Analisis</h4><p className="text-gray-600 whitespace-pre-wrap">{hasil.interviewDetail.ringkasan}</p></div>}
                        <div className="grid grid-cols-2 gap-4">
                            {hasil.interviewDetail?.keunggulan && <div className="bg-green-50 p-3 rounded-md"><h4 className="font-semibold text-green-800 mb-1">Keunggulan</h4><p className="text-green-700 whitespace-pre-wrap">{hasil.interviewDetail.keunggulan}</p></div>}
                            {hasil.interviewDetail?.saran && <div className="bg-red-50 p-3 rounded-md"><h4 className="font-semibold text-red-800 mb-1">Saran Pengembangan</h4><p className="text-red-700 whitespace-pre-wrap">{hasil.interviewDetail.saran}</p></div>}
                        </div>
                    </div>
                </section>

                <section className="pdf-section mt-8">
                    <h2 className="text-base font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">F. REKOMENDASI</h2>
                    <div className="mt-3 bg-indigo-100 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                        <p className="text-base font-bold text-indigo-800">{rekomendasiFinal}</p>
                    </div>
                </section>
            </div>
        </div>
        <div className="flex justify-end p-4 border-t space-x-2 print:hidden">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            Tutup
          </button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
            Cetak Laporan (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}