'use client';
import { AssetThumb } from './asset-thumb';
import { approvalStageLabels, labelOf } from '@utils';
import React from 'react';
import { AssetPair, AssetView, fetchAssetPairs } from '../utils/assets-api';

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
  retouchNeeded?: boolean;
  approvalStage?: string;
  approved?: boolean;
  managerActionNeeded?: boolean;
  userActionNeeded?: boolean;
  userId: string;
  size?: {
    label: string;
  };
  frame?: {
    code: string;
  };
  background?: {
    name: string;
  };
}

const approvalStageLabel = labelOf<string>(approvalStageLabels);
export const OrderItem = ({
  orderId,
  id,
  dateOfBirth,
  frame,
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
  background,
  size,
}: OrderItemProps) => {
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
  const birthDateSecondPerson = dateOfBirth ? new Date(dateOfBirth) : undefined;
  const deathDaySecondPerson = dateOfDeath ? new Date(dateOfDeath) : undefined;

  const renderRetouch = (retouch: AssetView) => {
    if (!retouch) return;
    return (
      <>
        <div className="font-medium flex items-center gap-2">
          <span>Ретушь</span>
          {retouch?.createdAt && (
            <span className="text-sm font-normal text-gray-500">
              Отправлен&nbsp;
              {new Date(retouch.createdAt).toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              })}
            </span>
          )}
        </div>
        <div className="mt-2 mb-[15px]">
          <AssetThumb
            key={retouch.id}
            asset={{
              id: retouch.id,
              originalName: retouch.originalName,
              contentType: retouch.contentType,
              thumbUrl: retouch.thumbUrl,
              viewUrl: retouch.viewUrl,
            }}
            size="100%"
            primary={retouch.primary}
            hideDownload
          />
        </div>
      </>
    );
  };
  return (
    <div className="space-y-2">
      <div className="font-medium">
        {templateFullTitle ? templateFullTitle : templateLabel}
      </div>
      {background ? (
        <div className="text-sm text-gray-600">Фон: {background?.name}</div>
      ) : (
        ''
      )}
      {size?.label ? (
        <div className="text-sm text-gray-600">Размер: {size.label}</div>
      ) : (
        ''
      )}
      {frame ? (
        <div className="text-sm text-gray-600">Рамка: {frame?.code}</div>
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
          {birthDateSecondPerson &&
            birthDateSecondPerson.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
        </div>
      )}
      {dateOfDeathSecondPerson && (
        <div className="text-sm text-gray-600">
          {deathDaySecondPerson &&
            deathDaySecondPerson.toLocaleString('ru-RU', {
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
              thumbUrl: original.thumbUrl,
              viewUrl: original.viewUrl,
            }}
            size={180}
            primary={original.primary}
            hideDownload
          />
          {renderRetouch(retouch)}
        </div>
      ))}
      {approveNeeded && approvalStage && (
        <>
          <p data-qa="as">{approvalStageLabel(approvalStage)}</p>
        </>
      )}
    </div>
  );
};
