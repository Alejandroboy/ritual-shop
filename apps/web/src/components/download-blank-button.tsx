'use client';

type DownloadBlankButtonProps = {
  orderId: string;
};

export function DownloadBlankButton({ orderId }: DownloadBlankButtonProps) {
  const handleClick = () => {
    window.open(`/api/orders/${orderId}/blank.pdf`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded-xl border border-black hover:bg-black hover:text-white transition"
    >
      Скачать бланк (PDF)
    </button>
  );
}
