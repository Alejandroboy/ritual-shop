'use client';
import * as React from 'react';

export function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="px-4 py-2 rounded-xl shadow"
      {...props}
      onClick={() => alert('ok')}
    >
      {children}
    </button>
  );
}
