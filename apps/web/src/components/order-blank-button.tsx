'use client';

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { HolePatternEnum } from '@types';
import { getAssetUrl } from '@utils';
import { OrderBlankPdf } from './order-blank-pdf';

export function OrderBlankButton({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      const assetId = order.items?.assets?.[0]?.id;
      let assetUrl: string | null = null;
      if (assetId) {
        try {
          const res = await getAssetUrl(assetId);
          assetUrl = res.url;
        } catch (e) {
          console.warn('Не удалось получить URL фото', e);
        }
      }

      const sizeObject = order.items?.template?.allowedSizes?.find(
        (item: { size: { id: string } }) => item.size.id === order.items.sizeId,
      );
      const sizeLabel = sizeObject?.size?.label ?? '';

      const data = {
        number: order.number,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        dateAccepted: order.createdAt,
        dateDelivery: order.dateDelivery,
        organization: order?.customer?.legalName,
        intakePoint: order?.customer?.address,
        deliveryInfo: order?.delivery,
        approveNeeded: order.items?.approveNeeded,
        goldType: order?.items?.goldType,
        comment: order.items?.comment,
        label: order.items?.template?.label,
        material: order.items?.template?.material,
        size: sizeLabel,
        finish: order.items?.finish,
        background: order.items?.background?.name,
        frame: order.items?.frame?.name ?? order.items?.frameId,
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
          secondLastName: order.items?.lastNameSecondPerson,
          secondFirstName: order.items?.firstNameSecondPerson,
          secondMiddleName: order.items?.middleNameSecondPerson,
          secondBirthDate: order.items?.dateOfBirthSecondPerson,
          secondDeathDate: order.items?.dateOfDeathSecondPerson,
        },
        assetUrl,
      };
      console.log('data', data);

      const blob = await pdf(<OrderBlankPdf data={data} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `order-${order.number || 'blank'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e) {
      console.error('Ошибка генерации PDF', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium cursor-pointer"
    >
      {loading ? 'Генерация...' : 'Скачать бланк заказа'}
    </button>
  );
}
