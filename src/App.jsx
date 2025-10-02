import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Toaster from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';
import PesertaDashboard from '@/components/PesertaDashboard';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [hasilUjian, setHasilUjian] = useState([]);
  const [soalUjian, setSoalUjian] = useState([]);
  const [masterData, setMasterData] = useState({});
  const { toast } = useToast();

  // Initialize default data
  useEffect(() => {
    const defaultUsers = [
      { 
        id: 1, 
        username: 'admin', 
        password: '12345', 
        role: 'admin', 
        nama: 'Administrator Utama', 
        nik: 'MASTER-001', 
        jabatan: 'Master Admin', 
        peran: 'Master Admin', 
        jobSites: [] 
      },
      { 
        id: 2, 
        username: 'instruktur', 
        password: '12345', 
        role: 'admin', 
        nama: 'Bambang Instruktur', 
        nik: 'P-001', 
        jabatan: 'Instruktur', 
        peran: 'Admin Biasa', 
        jobSites: ['Site A'] 
      },
      { 
        id: 3, 
        username: 'budi', 
        password: '12345', 
        role: 'peserta', 
        nama: 'Budi Santoso', 
        nik: '3301010101900001', 
        grade: 'M1', 
        jobSite: 'Site A', 
        section: 'Engine Assembly', 
        jabatan: 'Mekanik', 
        idp: 'ENGINE-01', 
        tahunUjikom: 2024, 
        tanggalBergabung: '2015-05-20' 
      },
      { 
        id: 4, 
        username: 'citra', 
        password: '12345', 
        role: 'peserta', 
        nama: 'Citra Ayu', 
        nik: '3301010202920002', 
        grade: 'M2', 
        jobSite: 'Site B', 
        section: 'Quality Control', 
        jabatan: 'Team Leader', 
        idp: 'ELECTRICAL-01', 
        tahunUjikom: 2024, 
        tanggalBergabung: '2018-07-15' 
      },
    ];

    const defaultHasilUjian = [
      { 
        id: 1, 
        pesertaId: 3, 
        skorTertulis: 20, 
        jumlahSoal: 2, 
        jawabanBenar: 2, 
        jawabanSalah: 0, 
        skorInterview: null, 
        interviewDetail: { 
          tanggal: '', 
          penguji: [],
          penilaian: [ 
            { aspek: 'Aspek Safety', items: [] }, 
            { aspek: 'Aspek Teknik', items: [] },
            { aspek: 'Aspek Maintenance Management', items: [] },
            { aspek: 'Aspek HPU WAY', items: [] }
          ], 
          ringkasan: '', 
          keunggulan: '', 
          saran: '' 
        } 
      },
      { 
        id: 2, 
        pesertaId: 4, 
        skorTertulis: 15, 
        jumlahSoal: 1, 
        jawabanBenar: 1, 
        jawabanSalah: 0, 
        skorInterview: 88, 
        interviewDetail: { 
          tanggal: '2025-09-27', 
          penguji: [{ nama: 'Bapak Ahmad', nik: 'P-001', jabatan: 'Supervisor' }],
          penilaian: [ 
            { 
              aspek: 'Aspek Safety', 
              items: [{ pertanyaan: 'Prosedur LOTO', nilai: 90, catatan: 'Baik' }] 
            },
            { aspek: 'Aspek Teknik', items: [{ pertanyaan: 'Wiring Diagram', nilai: 85, catatan: 'Cukup Baik' }] },
            { aspek: 'Aspek Maintenance Management', items: [] },
            { aspek: 'Aspek HPU WAY', items: [] }
          ], 
          ringkasan: 'Cukup Baik.', 
          keunggulan: '• Safety.', 
          saran: '' 
        } 
      },
    ];

    const defaultSoalUjian = [
      { 
        id: 1, 
        idp: 'ENGINE-01', 
        grade: 'M1', 
        nilai: 10, 
        pertanyaan: 'Fungsi utama oli mesin?', 
        pilihan: ['Mendinginkan', 'Membersihkan', 'Melumasi', 'Menambah tenaga'], 
        jawabanBenar: 'C',
        gambar: ''
      },
      { 
        id: 2, 
        idp: 'ELECTRICAL-01', 
        grade: 'M2', 
        nilai: 15, 
        pertanyaan: 'Penyimpan energi listrik saat mesin mati?', 
        pilihan: ['Alternator', 'Aki', 'Regulator', 'Koil'], 
        jawabanBenar: 'B',
        gambar: ''
      },
      { 
        id: 3, 
        idp: 'ENGINE-01', 
        grade: 'M1', 
        nilai: 10, 
        pertanyaan: 'Apa nama komponen yang ditunjuk pada gambar?', 
        pilihan: ['Piston', 'Connecting Rod', 'Crankshaft', 'Cylinder Head'], 
        jawabanBenar: 'A',
        gambar: 'https://placehold.co/400x250/e2e8f0/64748b?text=Gambar+Piston'
      },
    ];

    const defaultMasterData = {
      idp: ['ENGINE-01', 'ELECTRICAL-01', 'CHASSIS-01'],
      grade: ['M1', 'M2', 'M3', 'Foreman'],
      section: ['Engine Assembly', 'Quality Control', 'Body Repair', 'Maintenance'],
      jabatan: ['Mekanik', 'Team Leader', 'Supervisor'],
      jabatanAdmin: ['Instruktur', 'Supervisor', 'Master Admin'],
      jobSite: ['Site A', 'Site B', 'Head Office'],
      logo: 'https://placehold.co/150x60/ffffff/a0aec0?text=Logo'
    };

    // Load from localStorage or use defaults
    const savedUsers = localStorage.getItem('app_users');
    const savedHasilUjian = localStorage.getItem('app_hasilUjian');
    const savedSoalUjian = localStorage.getItem('app_soalUjian');
    const savedMasterData = localStorage.getItem('app_masterData');

    setUsers(savedUsers ? JSON.parse(savedUsers) : defaultUsers);
    setHasilUjian(savedHasilUjian ? JSON.parse(savedHasilUjian) : defaultHasilUjian);
    setSoalUjian(savedSoalUjian ? JSON.parse(savedSoalUjian) : defaultSoalUjian);
    setMasterData(savedMasterData ? JSON.parse(savedMasterData) : defaultMasterData);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('app_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (hasilUjian.length > 0) {
      localStorage.setItem('app_hasilUjian', JSON.stringify(hasilUjian));
    }
  }, [hasilUjian]);

  useEffect(() => {
    if (soalUjian.length > 0) {
      localStorage.setItem('app_soalUjian', JSON.stringify(soalUjian));
    }
  }, [soalUjian]);

  useEffect(() => {
    if (Object.keys(masterData).length > 0) {
      localStorage.setItem('app_masterData', JSON.stringify(masterData));
    }
  }, [masterData]);

  const handleLogin = (nik, password) => {
    const user = users.find(u => u.nik === nik && u.password === password);
    if (user) {
      setLoggedInUser(user);
      toast({
        title: "Login Berhasil! 🎉",
        description: `Selamat datang, ${user.nama}!`,
      });
      return true;
    } else {
      toast({
        title: "Login Gagal",
        description: "NIK atau password salah!",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa lagi!",
    });
  };

  const appState = {
    users,
    setUsers,
    hasilUjian,
    setHasilUjian,
    soalUjian,
    setSoalUjian,
    masterData,
    setMasterData,
    loggedInUser,
    toast
  };

  return (
    <>
      <Helmet>
        <title>Sistem Uji Kompetensi - Platform Digital Terdepan</title>
        <meta name="description" content="Platform uji kompetensi digital yang modern dan user-friendly untuk mengelola ujian dan penilaian karyawan dengan efisien." />
      </Helmet>
      
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          {!loggedInUser ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <LoginPage onLogin={handleLogin} masterData={masterData} />
            </motion.div>
          ) : loggedInUser.role === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <AdminDashboard 
                currentUser={loggedInUser}
                onLogout={handleLogout}
                usersState={{ users, setUsers }}
                hasilUjianState={{ hasilUjian, setHasilUjian }}
                soalUjianState={{ soalUjian, setSoalUjian }}
                masterDataState={{ masterData, setMasterData }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="peserta"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              <PesertaDashboard 
                appState={appState} 
                onLogout={handleLogout} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
      </div>
    </>
  );
}

export default App;