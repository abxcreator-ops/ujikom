import React, { useState } from 'react';
export default function LoginPage({
  onLogin,
  masterData
}) {
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = event => {
    event.preventDefault();
    onLogin(nik, password);
  };
  return <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <img src={masterData.logo || 'https://placehold.co/150x60/ffffff/a0aec0?text=Logo'} className="mx-auto h-16 w-auto mb-4 object-contain" alt="Logo Aplikasi" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Aplikasi Uji Kompetensi Mekanik</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Silakan login ke akun Anda
                    </p>
                </div>
                
                <form id="loginForm" className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="nik" className="sr-only">NIK</label>
                        <input id="nik" name="nik" type="text" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="NIK" value={nik} onChange={e => setNik(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <div>
                        <button type="submit" className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>;
}