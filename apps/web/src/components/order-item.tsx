'use client';
import { AssetThumb } from './asset-thumb';
import { approvalStageLabels, labelOf } from '@utils';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { ApprovalStage, OrderItemAsset, OrderItemDetails } from '@types';
import { AssetPair, AssetView, fetchAssetPairs } from '../utils/assets-api';
import { useAppStore } from '@state';

interface OrderItemProps {
  orderId: string;
  comment?: string | null;
  id: string;
  templateLabel: string;
  backgroundId?: string;
  frameId?: string;
  dateOfBirth: string;
  dateOfDeath: string;
  sizeLabel?: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  approveNeeded: boolean;
  approvalStage: string;
  approved: boolean;
}

const approvalStageLabel = labelOf<string>(approvalStageLabels);
export const OrderItem = ({
  orderId,
  id,
  dateOfBirth,
  dateOfDeath,
  templateLabel,
  sizeLabel,
  firstName,
  middleName,
  lastName,
  comment,
  approveNeeded,
  approvalStage,
  approved,
}: OrderItemProps) => {
  const updateApprove = useAppStore((s) => s.updateApprove);
  const [approvedRetouch, setApprovedRetouch] = useState(false);

  useEffect(() => {
    if (approvedRetouch) {
      updateApprove(orderId, id);
    }
  }, [approvedRetouch]);

  function handleApproveClick(event: SyntheticEvent) {
    event.preventDefault();
    setApprovedRetouch((prevState) => !prevState);
  }
  const [pairs, setPairs] = React.useState<AssetPair[]>([]);

  const reload = React.useCallback(async () => {
    if (!orderId || !id) return;
    const data = await fetchAssetPairs(orderId, id);
    setPairs(data);
  }, [orderId, id]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const birthDate = dateOfBirth ? new Date(dateOfBirth) : undefined;
  const deathDay = dateOfDeath ? new Date(dateOfDeath) : undefined;

  const renderRetouches = (retouches: AssetView[]) => {
    if (!retouches || retouches.length < 1) return;
    return (
      <>
        <div className="font-medium">Ретушь</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {retouches.map((r) => (
            <AssetThumb
              key={r.id}
              asset={{
                id: r.id,
                originalName: r.originalName,
                contentType: r.contentType,
              }}
              size={140}
              primary={r.primary}
            />
          ))}
        </div>

        <div className="mb-[15px]">
          {approved ? (
            <p>Согласовано</p>
          ) : (
            <label className="cursor-pointer" htmlFor="checkbox-approve">
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approved}
                onChange={handleApproveClick}
              />
              &nbsp;Согласен
            </label>
          )}
        </div>
      </>
    );
  };
  return (
    <div key={id} className="space-y-2">
      <div className="font-medium">{templateLabel}</div>
      <div className="text-sm text-gray-600">{sizeLabel}</div>
      {firstName && <div className="text-sm text-gray-600">{firstName}</div>}
      {middleName && <div className="text-sm text-gray-600">{middleName}</div>}
      {lastName && <div className="text-sm text-gray-600">{lastName}</div>}
      {dateOfBirth && (
        <div className="text-sm text-gray-600">
          {birthDate &&
            birthDate.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
        </div>
      )}
      {dateOfDeath && (
        <div className="text-sm text-gray-600">
          {deathDay &&
            deathDay.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
        </div>
      )}
      {comment && <div className="text-sm text-gray-600">{comment}</div>}

      {pairs.map(({ original, retouches }) => (
        <div key={original.id} className="rounded-2xl shadow p-4">
          <div className="mb-2">Оригинал</div>
          <AssetThumb
            asset={{
              id: original.id,
              originalName: original.originalName,
              contentType: original.contentType,
            }}
            size={180}
            primary={original.primary}
          />
          {approveNeeded && approvalStage && (
            <p>{approvalStageLabel(approvalStage)}</p>
          )}
          {renderRetouches(retouches)}
        </div>
      ))}
    </div>
  );
};
