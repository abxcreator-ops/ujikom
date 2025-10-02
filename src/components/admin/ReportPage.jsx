import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const getNilaiAkhir = (hasil, peserta, soalUjian) => {
  if (!peserta || hasil.skorInterview === null || hasil.skorInterview === undefined) {
    return 0;
  }
  const soalUntukPeserta = soalUjian.filter(s => s.idp === peserta.idp && s.grade === peserta.grade);
  const totalNilaiMaksimal = soalUntukPeserta.reduce((sum, s) => sum + (s.nilai || 0), 0);
  const skorTertulisPersen = totalNilaiMaksimal > 0 ? hasil.skorTertulis / totalNilaiMaksimal * 100 : 0;
  const nilaiAkhir = skorTertulisPersen * 0.25 + hasil.skorInterview * 0.75;
  return nilaiAkhir;
};

const getStatusInfo = nilaiAkhir => {
  if (nilaiAkhir === 0) return {
    text: 'Belum Selesai',
    class: 'bg-gray-100 text-gray-800',
    category: 'belumSelesai'
  };
  if (nilaiAkhir >= 70) return {
    text: 'Lulus',
    class: 'bg-green-100 text-green-800',
    category: 'lulus'
  };
  if (nilaiAkhir >= 68) return {
    text: 'Dipertimbangkan',
    class: 'bg-yellow-100 text-yellow-800',
    category: 'dipertimbangkan'
  };
  return {
    text: 'Tidak Lulus',
    class: 'bg-red-100 text-red-800',
    category: 'tidakLulus'
  };
};

const StatCard = ({
  title,
  value,
  subValue
}) => <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-3xl font-bold text-indigo-600 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>;

const DistributionChart = ({
  data,
  title,
  chartId
}) => {
  const chartRef = useRef(null);
  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    const ctx = document.getElementById(chartId)?.getContext('2d');
    if (ctx) {
      const labels = Object.keys(data);
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Lulus',
            data: labels.map(l => data[l]?.lulus || 0),
            backgroundColor: '#10B981'
          }, {
            label: 'Dipertimbangkan',
            data: labels.map(l => data[l]?.dipertimbangkan || 0),
            backgroundColor: '#F59E0B'
          }, {
            label: 'Tidak Lulus',
            data: labels.map(l => data[l]?.tidakLulus || 0),
            backgroundColor: '#EF4444'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              position: 'bottom'
            },
            datalabels: {
              color: 'white',
              formatter: value => value > 0 ? value : '',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      });
    }
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data, chartId]);
  return <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="relative h-80"><canvas id={chartId}></canvas></div>
        </div>;
};

const generateOverallConclusion = (reportData) => {
    const { avgScore, passRate, aspectScores, distribution } = reportData;
    if (reportData.totalPeserta === 0) {
        return "Tidak ada data peserta untuk dianalisis pada Job Site ini.";
    }

    let conclusion = `Analisis komprehensif untuk Job Site **${reportData.activeSite}** menunjukkan gambaran performa yang beragam. Dengan **rata-rata skor akhir ${avgScore}%** dan **tingkat kelulusan ${passRate}%**, terdapat beberapa area kunci yang memerlukan perhatian.\n\n`;

    // Analisis Rasio Interview
    const aspectAverages = Object.entries(aspectScores).map(([aspek, data]) => ({
        aspek,
        score: data.count > 0 ? data.total / data.count : 0
    })).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    if (aspectAverages.length > 0) {
        const strongestAspect = aspectAverages[0];
        const weakestAspect = aspectAverages[aspectAverages.length - 1];
        conclusion += `**Kekuatan Utama & Area Pengembangan:**\nDari sisi interview, kompetensi terkuat secara kolektif berada pada **${strongestAspect.aspek}** (rata-rata skor ${strongestAspect.score.toFixed(1)}). Ini mengindikasikan fondasi yang solid di area tersebut. Sebaliknya, **${weakestAspect.aspek}** (rata-rata skor ${weakestAspect.score.toFixed(1)}) menjadi area pengembangan prioritas yang membutuhkan intervensi strategis seperti pelatihan atau mentoring.\n\n`;
    } else {
        conclusion += `**Kekuatan Utama & Area Pengembangan:**\nData interview belum cukup untuk analisis mendalam. Penilaian lebih lanjut diperlukan untuk mengidentifikasi kekuatan dan kelemahan kompetensi.\n\n`;
    }

    // Analisis Distribusi
    const analyzeDistribution = (distData, category) => {
        const entries = Object.entries(distData).filter(([, value]) => value.lulus + value.dipertimbangkan + value.tidakLulus > 0);
        if (entries.length === 0) return `Tidak ada data kelulusan untuk dianalisis berdasarkan ${category}.`;

        const sortedByPassRate = entries.sort(([, a], [, b]) => {
            const rateA = a.lulus / (a.lulus + a.dipertimbangkan + a.tidakLulus);
            const rateB = b.lulus / (b.lulus + b.dipertimbangkan + b.tidakLulus);
            return rateB - rateA;
        });

        const topPerformer = sortedByPassRate[0];
        const bottomPerformer = sortedByPassRate[sortedByPassRate.length - 1];

        let text = `Berdasarkan **${category}**, performa tertinggi ditunjukkan oleh **${topPerformer[0]}**, dengan tingkat kelulusan yang menonjol. `;
        if (topPerformer[0] !== bottomPerformer[0]) {
            text += `Sementara itu, **${bottomPerformer[0]}** menunjukkan tantangan terbesar dan memerlukan perhatian khusus untuk peningkatan.`;
        }
        return text;
    };

    conclusion += `**Distribusi Performa:**\n- ${analyzeDistribution(distribution.grade, 'Grade')}\n- ${analyzeDistribution(distribution.section, 'Section')}\n- ${analyzeDistribution(distribution.idp, 'IDP')}\n\n`;

    // Rekomendasi Strategis
    conclusion += `**Rekomendasi Strategis:**\nBerdasarkan data ini, direkomendasikan untuk: \n1. Mengalokasikan sumber daya pelatihan untuk memperkuat area **${aspectAverages.length > 0 ? aspectAverages[aspectAverages.length - 1].aspek : 'yang teridentifikasi lemah'}.**\n2. Melakukan *best practice sharing* dari kelompok dengan performa tertinggi (misal: dari Grade/Section/IDP **${Object.keys(distribution.grade).length > 0 ? Object.keys(distribution.grade)[0] : 'teratas'}**) ke kelompok lain.\n3. Mengevaluasi kembali materi uji atau metode pengajaran untuk area dengan tingkat kelulusan terendah.`;

    return conclusion;
};

export default function ReportPage({
  users,
  hasilUjian,
  soalUjian,
  masterData,
  currentUser
}) {
  const {
    toast
  } = useToast();
  const [activeSite, setActiveSite] = useState('Semua');
  const [reportData, setReportData] = useState({
    totalPeserta: 0,
    avgScore: 0,
    passRate: 0,
    statusCounts: {
      lulus: 0,
      dipertimbangkan: 0,
      tidakLulus: 0,
      belumSelesai: 0
    },
    aspectScores: {},
    distribution: {
      grade: {},
      section: {},
      idp: {}
    },
    detailedResults: [],
    activeSite: 'Semua'
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const statusChartRef = useRef(null);
  const aspectChartRef = useRef(null);
  const reportContentRef = useRef(null);
  
  useEffect(() => {
    const isMasterAdmin = currentUser.peran === 'Master Admin';
    const sitePeserta = users.filter(u => u.role === 'peserta' && (activeSite === 'Semua' || u.jobSite === activeSite) && (isMasterAdmin || currentUser.jobSites.length === 0 || currentUser.jobSites.includes(u.jobSite)));
    let totalNilai = 0;
    let pesertaSelesaiCount = 0;
    const statusCounts = {
      lulus: 0,
      dipertimbangkan: 0,
      tidakLulus: 0,
      belumSelesai: 0
    };
    const aspectScores = {};
    const defaultAspek = ['Aspek Safety', 'Aspek Teknik', 'Aspek Maintenance Management', 'Aspek HPU WAY'];
    defaultAspek.forEach(aspek => {
      aspectScores[aspek] = {
        total: 0,
        count: 0
      };
    });
    const distribution = {
      grade: {},
      section: {},
      idp: {}
    };
    const detailedResults = [];
    sitePeserta.forEach(peserta => {
      const hasil = hasilUjian.find(h => h.pesertaId === peserta.id);
      if (!hasil) return;
      const nilaiAkhir = getNilaiAkhir(hasil, peserta, soalUjian);
      const {
        category
      } = getStatusInfo(nilaiAkhir);
      statusCounts[category]++;
      detailedResults.push({
        ...peserta,
        nilaiAkhir,
        status: category
      });
      if (category !== 'belumSelesai') {
        totalNilai += nilaiAkhir;
        pesertaSelesaiCount++;
      }
      ['grade', 'section', 'idp'].forEach(key => {
        const value = peserta[key];
        if (!distribution[key][value]) {
          distribution[key][value] = {
            lulus: 0,
            dipertimbangkan: 0,
            tidakLulus: 0
          };
        }
        if (category === 'lulus' || category === 'dipertimbangkan' || category === 'tidakLulus') {
          distribution[key][value][category]++;
        }
      });
      if (hasil.skorInterview !== null && hasil.interviewDetail?.penilaian) {
        hasil.interviewDetail.penilaian.forEach(penilaian => {
          const validItems = penilaian.items.filter(item => item.nilai !== '' && !isNaN(item.nilai));
          if (validItems.length > 0) {
            const aspectAvg = validItems.reduce((sum, item) => sum + Number(item.nilai), 0) / validItems.length;
            if (aspectScores[penilaian.aspek]) {
              aspectScores[penilaian.aspek].total += aspectAvg;
              aspectScores[penilaian.aspek].count++;
            }
          }
        });
      }
    });
    detailedResults.sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
    setReportData({
      totalPeserta: sitePeserta.length,
      avgScore: pesertaSelesaiCount > 0 ? (totalNilai / pesertaSelesaiCount).toFixed(2) : 0,
      passRate: pesertaSelesaiCount > 0 ? (statusCounts.lulus / pesertaSelesaiCount * 100).toFixed(2) : 0,
      statusCounts,
      aspectScores,
      distribution,
      detailedResults,
      activeSite
    });
  }, [activeSite, users, hasilUjian, soalUjian, currentUser]);
  
  useEffect(() => {
    const {
      statusCounts,
      aspectScores
    } = reportData;
    if (statusChartRef.current) statusChartRef.current.destroy();
    if (aspectChartRef.current) aspectChartRef.current.destroy();
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
      statusChartRef.current = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Lulus', 'Dipertimbangkan', 'Tidak Lulus', 'Belum Selesai'],
          datasets: [{
            data: [statusCounts.lulus, statusCounts.dipertimbangkan, statusCounts.tidakLulus, statusCounts.belumSelesai],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            datalabels: {
              formatter: (value, ctx) => {
                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                  sum += data;
                });
                if (sum === 0) return '';
                let percentage = (value * 100 / sum).toFixed(1) + "%";
                return value > 0 ? `${value}\n(${percentage})` : '';
              },
              color: '#fff',
              textAlign: 'center',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      });
    }
    const aspectCtx = document.getElementById('aspectChart')?.getContext('2d');
    if (aspectCtx) {
      const aspectLabels = Object.keys(aspectScores);
      const aspectAverages = aspectLabels.map(label => {
        const score = aspectScores[label];
        return score.count > 0 ? score.total / score.count : 0;
      });
      const totalOfAverages = aspectAverages.reduce((sum, avg) => sum + avg, 0);
      const aspectRatios = totalOfAverages > 0 ? aspectAverages.map(avg => avg / totalOfAverages * 100) : aspectAverages.map(() => 0);
      aspectChartRef.current = new Chart(aspectCtx, {
        type: 'bar',
        data: {
          labels: aspectLabels,
          datasets: [{
            label: 'Rasio Kontribusi (%)',
            data: aspectRatios,
            backgroundColor: 'rgba(79, 70, 229, 0.6)',
            borderColor: 'rgb(79, 70, 229)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              max: 100
            }
          },
          plugins: {
            legend: {
              display: false
            },
            datalabels: {
              anchor: 'end',
              align: 'end',
              formatter: value => `${value.toFixed(1)}%`,
              color: '#374151',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      });
    }
  }, [reportData]);
  
  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    toast({
      title: "Mengunduh PDF...",
      description: "Harap tunggu sebentar."
    });
    const content = reportContentRef.current;
    if (!content) {
      toast({
        title: "Gagal",
        description: "Konten laporan tidak ditemukan.",
        variant: "destructive"
      });
      setIsDownloading(false);
      return;
    }
    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document) => {
            const downloadButton = document.getElementById('download-pdf-button');
            if (downloadButton) {
                downloadButton.style.display = 'none';
            }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Laporan_Hasil_Ujian_${activeSite}_${new Date().toLocaleDateString()}.pdf`);
      toast({
        title: "Berhasil!",
        description: "Laporan PDF telah diunduh."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Gagal Mengunduh",
        description: "Terjadi kesalahan saat membuat PDF.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const jobSitesToDisplay = currentUser.peran === 'Master Admin' ? ['Semua', ...masterData.jobSite] : ['Semua', ...currentUser.jobSites];
  
  return <div ref={reportContentRef} className="p-1 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan Hasil Ujian</h1>
                    <p className="text-sm text-gray-500">Analisis performa peserta per lokasi kerja.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button id="download-pdf-button" onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:bg-gray-400">
                        <Download className="h-4 w-4 mr-2" /> {isDownloading ? 'Mengunduh...' : 'Unduh PDF'}
                    </button>
                    <img src={masterData.logo} alt="Logo" className="h-12 w-auto object-contain" />
                </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2 border-b pb-2">
                {jobSitesToDisplay.map(site => <button key={site} onClick={() => setActiveSite(site)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeSite === site ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                        {site}
                    </button>)}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Peserta" value={reportData.totalPeserta} />
                <StatCard title="Rata-rata Skor Akhir" value={`${reportData.avgScore}%`} />
                <StatCard title="Tingkat Kelulusan" value={`${reportData.passRate}%`} subValue="Dari peserta yang telah selesai ujian" />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Status Kelulusan</h3>
                    <div className="relative h-64 mt-4"><canvas id="statusChart"></canvas></div>
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Rasio Kontribusi Aspek Interview</h3>
                    <div className="relative h-64 mt-4"><canvas id="aspectChart"></canvas></div>
                </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Analisis Kesimpulan</h3>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-800 p-4 rounded-r-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{generateOverallConclusion(reportData)}</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DistributionChart data={reportData.distribution.grade} title="Distribusi Kelulusan per Grade" chartId="distGradeChart" />
                <DistributionChart data={reportData.distribution.section} title="Distribusi Kelulusan per Section" chartId="distSectionChart" />
                <DistributionChart data={reportData.distribution.idp} title="Distribusi Kelulusan per IDP" chartId="distIdpChart" />
            </div>

             <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                             {['Nama', 'NIK', 'Job Site', 'Grade', 'Section', 'IDP', 'Nilai Akhir', 'Status'].map(header => <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                         {reportData.detailedResults.map(peserta => {
            const statusInfo = getStatusInfo(peserta.nilaiAkhir);
            return <tr key={peserta.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{peserta.nama}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.nik}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.jobSite}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.grade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{peserta.idp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{peserta.nilaiAkhir.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>
                                            {statusInfo.text}
                                        </span>
                                    </td>
                                </tr>;
          })}
                    </tbody>
                </table>
             </div>
        </div>;
}