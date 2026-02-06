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
  id?: string;
  templateLabel?: string;
  templateFullTitle?: string | null;
  backgroundId?: string;
  frameId?: string;
  dateOfBirth?: string;
  dateOfBirthSecondPerson?: string;
  dateOfDeath?: string;
  dateOfDeathSecondPerson?: string;
  sizeLabel?: string | null;
  firstName?: string;
  firstNameSecondPerson?: string;
  middleName?: string;
  middleNameSecondPerson?: string;
  lastName?: string;
  lastNameSecondPerson?: string;
  approveNeeded?: boolean;
  approvalStage?: string;
  approved?: boolean;
  managerActionNeeded?: boolean;
  userActionNeeded?: boolean;
  userId: string;
  size?: {
    label: string;
  };
}

const approvalStageLabel = labelOf<string>(approvalStageLabels);
export const OrderItem = ({
  orderId,
  id,
  userId,
  dateOfBirth,
  frameId,
  dateOfBirthSecondPerson,
  dateOfDeath,
  dateOfDeathSecondPerson,
  templateLabel,
  templateFullTitle,
  firstName,
  firstNameSecondPerson,
  middleName,
  middleNameSecondPerson,
  lastName,
  lastNameSecondPerson,
  comment,
  approveNeeded,
  approvalStage,
  approved,
  managerActionNeeded,
  userActionNeeded,
  backgroundId,
  size,
}: OrderItemProps) => {
  const updateApprove = useAppStore((s) => s.updateApprove);
  const updateComment = useAppStore((s) => s.updateComment);
  const [approveRetouch, setApproveRetouch] = useState(false);
  const [disapproveRetouch, setDisapproveRetouch] = useState(false);
  const [retouchComment, setRetouchComment] = useState('');

  function handleApproveClick(event: SyntheticEvent) {
    event.preventDefault();
    setApproveRetouch(true);
    setDisapproveRetouch(false);
  }

  function handleDisapproveClick(event: SyntheticEvent) {
    event.preventDefault();
    setDisapproveRetouch(true);
    setApproveRetouch(false);
  }

  function handleApproveSubmit() {
    return updateApprove({ orderId, userId, itemId: id });
  }

  function handleCommentSubmit() {
    return updateComment({ orderId, text: retouchComment, itemId: id });
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

  const renderCheckboxes = () => {
    if (!approveRetouch && !disapproveRetouch)
      return (
        <div className="flex mt-[15px]">
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
            <label htmlFor="checkbox-approve" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approveRetouch}
                onChange={handleApproveClick}
              />
              &nbsp;Согласен
            </label>
          </div>
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
            <label htmlFor="checkbox-disapprove" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-disapprove"
                checked={disapproveRetouch}
                onChange={handleDisapproveClick}
              />
              &nbsp;Есть замечания
            </label>
          </div>
        </div>
      );

    if (approveRetouch)
      return (
        <>
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit mt-[10px]">
            <label htmlFor="checkbox-approve" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approveRetouch}
                onChange={handleApproveClick}
              />
              &nbsp;Согласен
            </label>
          </div>
          <button
            onClick={handleApproveSubmit}
            className="border rounded-md cursor-pointer p-[5px] mt-[10px]"
          >
            Отправить
          </button>
        </>
      );

    if (disapproveRetouch)
      return (
        <>
          <div className="cursor-pointer mr-[15px] mb-[15px] p-[15px] border rounded-xl block w-fit mt-[10px]">
            <label htmlFor="checkbox-disapprove" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-disapprove"
                checked={disapproveRetouch}
                onChange={handleDisapproveClick}
              />
              &nbsp;Есть замечания
            </label>
          </div>
          <textarea
            className="border rounded-md px-2 py-1 bg-white w-full mt-[10px]"
            rows={3}
            value={retouchComment}
            onChange={(e) => setRetouchComment(e.target.value)}
          />
          <button
            onClick={handleCommentSubmit}
            className="border rounded-md cursor-pointer p-[5px] mt-[10px]"
          >
            Отправить
          </button>
        </>
      );
  };

  const renderForms = () => {
    if (approved) return <p>Согласовано</p>;
    if (userActionNeeded)
      return (
        <div>
          <p>Ожидает согласования</p>
          {renderCheckboxes()}
        </div>
      );
    if (managerActionNeeded) return <p>Ожиданние новой ретуши</p>;
  };

  const renderRetouch = (retouch: AssetView) => {
    if (!retouch) return;
    return (
      <>
        <div className="font-medium">Ретушь</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 mb-[15px]">
          <AssetThumb
            key={retouch.id}
            asset={{
              id: retouch.id,
              originalName: retouch.originalName,
              contentType: retouch.contentType,
            }}
            size={140}
            primary={retouch.primary}
          />
        </div>

        {approveNeeded && <div className="mb-[15px] flex">{renderForms()}</div>}
      </>
    );
  };
  return (
    <div className="space-y-2">
      <div className="font-medium">
        {templateFullTitle ? templateFullTitle : templateLabel}
      </div>
      {backgroundId ? (
        <div className="text-sm text-gray-600">Фон: {backgroundId}</div>
      ) : (
        ''
      )}
      {size?.label ? (
        <div className="text-sm text-gray-600">Размер: {size.label}</div>
      ) : (
        ''
      )}
      {frameId ? (
        <div className="text-sm text-gray-600">Рамка: {frameId}</div>
      ) : (
        ''
      )}
      {firstNameSecondPerson && <div>Первый человек</div>}
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
      {firstNameSecondPerson && <div>Второй человек</div>}
      {firstNameSecondPerson && (
        <div className="text-sm text-gray-600">{firstNameSecondPerson}</div>
      )}
      {middleNameSecondPerson && (
        <div className="text-sm text-gray-600">{middleNameSecondPerson}</div>
      )}
      {lastNameSecondPerson && (
        <div className="text-sm text-gray-600">{lastNameSecondPerson}</div>
      )}
      {dateOfBirthSecondPerson && (
        <div className="text-sm text-gray-600">
          {birthDate &&
            birthDate.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
        </div>
      )}
      {dateOfDeathSecondPerson && (
        <div className="text-sm text-gray-600">
          {deathDay &&
            deathDay.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
        </div>
      )}
      {comment && (
        <div className="text-sm text-gray-600">Комментарий:"{comment}"</div>
      )}
      {pairs.map(({ original, retouch }) => (
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
          {renderRetouch(retouch)}
        </div>
      ))}
    </div>
  );
};
