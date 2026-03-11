'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white p-4 flex items-center justify-between">
      <p className="text-sm max-w-xl">
        Мы используем cookies для корректной работы сайта. Продолжая
        использовать сайт, вы соглашаетесь с использованием файлов cookie.
      </p>

      <button
        onClick={accept}
        className="ml-4 bg-white text-black px-4 py-2 rounded cursor-pointer"
      >
        Принять
      </button>
    </div>
  );
}
