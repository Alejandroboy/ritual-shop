import CreateUserForm from './create-user-form';

export const metadata = { title: 'Создать пользователя' };

export default function AdminNewUserPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold">Создать пользователя</h2>
      <p className="text-sm text-gray-500 mt-1">
        Заполните форму. Пароль будет сохранён как хэш на сервере.
      </p>
      <div className="mt-6 rounded-2xl border p-6">
        <CreateUserForm />
      </div>
    </div>
  );
}
