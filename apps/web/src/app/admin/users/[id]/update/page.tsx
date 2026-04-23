'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { adminApiFetch } from '@utils';
import { Loader } from '../../../../../components/loader';
import UpdateUserForm from '../../../../../components/update-user-form';

export default function UserUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useSWR(`/api/admin/users/${id}`, (u) =>
    adminApiFetch(u).then((r) => r.json()),
  );

  if (!data) {
    return <Loader />;
  }
  return (
    <UpdateUserForm
      id={id}
      delivery={data.user.delivery}
      name={data.user.name}
      legalName={data.user.legalName}
      address={data.user.address}
      phone={data.user.phone}
      email={data.user.email}
      password={data.user.password}
      inn={data.user.inn}
      role={data.user.role}
    />
  );
}
