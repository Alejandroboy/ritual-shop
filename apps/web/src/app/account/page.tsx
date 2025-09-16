export default function AccountPage() {
  // позже тут будет реальная авторизация и список заказов текущего пользователя
  // пока просто ссылка в админку и заглушка
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Личный кабинет</h1>
      <p className="text-neutral-700">
        Здесь появятся ваши заказы и их статусы.
      </p>
      <a
        className="inline-block px-4 py-2 rounded-md border"
        href="http://localhost:3001/admin"
        target="_blank"
      >
        Открыть админ-панель
      </a>
    </div>
  );
}
