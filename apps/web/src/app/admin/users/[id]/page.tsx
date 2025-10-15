'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch } from '@utils';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  console.log('id', id);
  const { data } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );
  console.log('data', data);

  if (data && data.user) {
    const createdAt = new Date(data.user.createdAt);
    const updatedAt = new Date(data.user.updatedAt);
    return (
      <div>
        <div className="flex w-96">
          <div className="w-1/2">Создан</div>
          <div className="w-1/2">{createdAt.toLocaleString('ru-RU')}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">Email</div>
          <div className="w-1/2">{data.user.email}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">ID</div>
          <div className="w-1/2">{data.user.id}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">Имя</div>
          <div className="w-1/2">{data.user.name}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">Телефон</div>
          <div className="w-1/2">{data.user.phone}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">Статус</div>
          <div className="w-1/2">{data.user.role}</div>
        </div>
        <div className="flex w-96">
          <div className="w-1/2">Изменен</div>
          <div className="w-1/2">{updatedAt.toLocaleString('ru-RU')}</div>
        </div>
      </div>
    );
  }
  return <div>...загрузка</div>;
}
