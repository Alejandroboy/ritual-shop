import { Button } from '../components/button';
import type { Product } from '@repo/types';

export default function Home() {
  const p: Product = { id: '1', title: 'Пример', price: 1000 };
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Ritual Shop</h1>
      <p>
        Товар: {p.title} — {p.price} ₽
      </p>
      <Button>Купить</Button>
    </main>
  );
}
