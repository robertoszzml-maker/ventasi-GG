'use client';

import { useState, useEffect } from 'react';

export function LoginFormSimple() {
  const [email, setEmail] = useState('admin@template.local');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'app': 'nombre_app',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data?.authToken) {
        sessionStorage.setItem('tokenAuth', data.data.authToken);
        localStorage.setItem('session-token', data.data.sessionToken);
        window.location.href = '/';
      } else {
        setError(data.message || 'Error de login');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo del Caribe con efecto de desenfoque */}
      <div 
        className={`
          absolute inset-0 bg-cover bg-center bg-no-repeat
          transition-all ease-out
          ${mounted ? 'blur-0 scale-100' : 'blur-[20px] scale-105'}
        `}
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80")',
          transitionDuration: '2500ms',
        }}
      />
      
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Formulario de login */}
      <div 
        className={`
          relative z-10 w-full max-w-md mx-4
          transition-all ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{
          transitionDuration: '1500ms',
        }}
      >
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Bienvenido
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {process.env.NEXT_PUBLIC_APP_NAME || 'VentaSi'} CRM
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Cargando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6 drop-shadow-lg">
          Sistema de gestión integral para tu negocio
        </p>
      </div>
    </div>
  );
}
