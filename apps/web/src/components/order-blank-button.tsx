'use client';

import { useState } from 'react';
import { HolePatternEnum } from '@types';
type Order = any;

type OrderBlankButtonProps = {
  order: Order;
};
interface ExtendedWindow extends Window {
  orderData: {
    number: number;
    dateAccepted: string;
    dateDelivery: string;
    approveNeeded: boolean;
    comment: string;
    material: string;
    size: string;
    background: string;
    frame: string;
    hasHoles: boolean;
    customer: { legalName?: string; address?: string };
    deceased: {
      lastName: string;
      firstName: string;
      middleName: string;
      birthDate: string;
      deathDate: string;
    };
  };
}

export function OrderBlankButton({ order }: OrderBlankButtonProps) {
  const [loading, setLoading] = useState(false);
  const sizeObject = order.items?.template.allowedSizes.filter(
    (item: { size: { id: string } }) => item.size.id === order.items.sizeId,
  );
  let sizeLabel = '';
  if (sizeObject) sizeLabel = sizeObject.length && sizeObject[0].size?.label;
  console.log('order', order);
  const orderData = {
    number: order.number,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    dateAccepted: order.createdAt,
    dateDelivery: order.dateDelivery,
    organization: order?.customer?.legalName,
    intakePoint: order?.customer?.address,
    approveNeeded: order.items?.approveNeeded,
    goldType: order?.items?.goldType,
    comment: order.items?.comment,
    label: order.items?.template?.label,
    material: order.items?.template?.material,
    size: sizeLabel,
    finish: order.items?.finish,
    background: order.items?.backgroundId,
    frame: order.items?.frameId,
    holePattern: order.items?.holePattern,
    hasHoles:
      order.items?.holePattern &&
      order.items?.holePattern !== HolePatternEnum.NONE,
    deceased: {
      lastName: order.items?.lastName,
      firstName: order.items?.firstName,
      middleName: order.items?.middleName,
      birthDate: order.items?.dateOfBirth,
      deathDate: order.items?.dateOfDeath,
    },
  };

  const handleClick = async () => {
    try {
      setLoading(true);

      const printWindow = window.open('/blank.html', '_blank');

      if (printWindow) printWindow.orderData = orderData;
    } catch (e) {
      console.error('Ошибка печати', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
    >
      {loading ? 'Генерация...' : 'Распечатать бланк заказа'}
    </button>
  );
}
