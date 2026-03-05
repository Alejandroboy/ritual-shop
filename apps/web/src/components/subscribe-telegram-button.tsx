'use client';

export function SubscribeTelegramButton({
  telegramChatId,
  userId,
}: {
  userId?: string;
  telegramChatId?: string;
}) {
  async function prepare() {
    const res = await fetch(`/api/telegram/subscribe-link?userId=${userId}`, {
      method: 'GET',
    });
    const { url } = await res.json();
    window.open(url, '_blank');
  }

  if (telegramChatId) {
    return;
  }

  return (
    <button
      className="rounded-xl px-4 py-2 bg-black text-white"
      onClick={prepare}
    >
      Подписаться на уведомления Telegram
    </button>
  );
}
