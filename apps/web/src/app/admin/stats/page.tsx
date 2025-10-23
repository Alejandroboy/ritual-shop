'use client';
import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { adminApiFetch } from '@utils';

const api = (u: string) =>
  fetch(u, { credentials: 'include', cache: 'no-store' }).then((r) => r.json());

export default function AdminStats() {
  const { data } = useSWR('/api/admin/stats?grain=day', (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  if (!data) return <div>Загрузка…</div>;

  const statusPairs = Object.entries(data.ordersByStatus) as [string, number][];
  const statusData = statusPairs.map(([k, v]) => ({ status: k, count: v }));
  const breachesPairs = Object.entries(data.sla.breachesByStatus) as [
    string,
    number,
  ][];
  const breachesData = breachesPairs.map(([k, v]) => ({ status: k, count: v }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="border rounded-2xl p-4">
        <h3 className="font-semibold mb-2">Новые заказы</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.newOrdersSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-2xl p-4">
        <h3 className="font-semibold mb-2">Очередь по статусам</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border rounded-2xl p-4 md:col-span-2">
        <h3 className="font-semibold mb-2">SLA: просрочки</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={breachesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 text-sm text-gray-600">
          Топ просрочек:
          {data.sla.topBreaches.map(
            (b: {
              id: string;
              number: string;
              status: string;
              ageHours: string;
              thresholdHours: string;
            }) => (
              <div key={b.id}>
                #{b.number ?? b.id.slice(0, 6)} — {b.status}: {b.ageHours}ч /
                SLA {b.thresholdHours}ч
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
