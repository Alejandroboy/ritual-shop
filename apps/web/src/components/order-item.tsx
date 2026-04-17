'use client';
import { AssetThumb } from './asset-thumb';
import { approvalStageLabels, labelOf } from '@utils';
import React, { useState } from 'react';
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
  retouchNeeded?: boolean;
  approvalStage?: string;
  approved?: boolean;
  managerActionNeeded?: boolean;
  userActionNeeded?: boolean;
  userId: string;
  size?: {
    label: string;
  };
  background?: {
    name: string;
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
  background,
  size,
  retouchNeeded,
}: OrderItemProps) => {
  const updateApprove = useAppStore((s) => s.updateApprove);
  const updateComment = useAppStore((s) => s.updateComment);
  const [approveRetouch, setApproveRetouch] = useState(false);
  const [disapproveRetouch, setDisapproveRetouch] = useState(false);
  const [approve, setApprove] = useState(false);
  const [retouchComment, setRetouchComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleApproveClick() {
    setApprove((prev) => !prev);
    setApproveRetouch(false);
    setDisapproveRetouch(false);
  }

  function handleApproveRetouchClick() {
    setApproveRetouch((prev) => !prev);
    setDisapproveRetouch(false);
  }

  function handleDisapproveClick() {
    setDisapproveRetouch((prev) => !prev);
    setApproveRetouch(false);
  }

  async function handleApproveSubmit() {
    try {
      setSubmitting(true);
      await updateApprove({ orderId, userId, itemId: id });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCommentSubmit() {
    try {
      setSubmitting(true);
      await updateComment({ orderId, text: retouchComment, itemId: id });
    } finally {
      setSubmitting(false);
    }
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
  const birthDateSecondPerson = dateOfBirth ? new Date(dateOfBirth) : undefined;
  const deathDaySecondPerson = dateOfDeath ? new Date(dateOfDeath) : undefined;

  const renderCheckboxes = () => {
    if (!approveRetouch && !disapproveRetouch)
      return (
        <div className="flex mt-[15px]">
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
            <label
              htmlFor="checkbox-approve-retouch"
              className="cursor-pointer"
            >
              <input
                type="checkbox"
                id="checkbox-approve-retouch"
                checked={approveRetouch}
                onChange={handleApproveRetouchClick}
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
            <label
              htmlFor="checkbox-approve-retouch"
              className="cursor-pointer"
            >
              <input
                type="checkbox"
                id="checkbox-approve-retouch"
                checked={approveRetouch}
                onChange={handleApproveRetouchClick}
              />
              &nbsp;Согласен
            </label>
          </div>
          <button
            onClick={handleApproveSubmit}
            className={`border rounded-md p-[5px] mt-[10px] ${submitting ? 'cursor-wait' : 'cursor-pointer'}`}
            disabled={submitting}
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
    if (approved) return null;
    if (userActionNeeded)
      return (
        <div>
          <p>Ожидает согласования</p>
          {renderCheckboxes()}
        </div>
      );
    if (managerActionNeeded) return <p>Ожиданние новой ретуши</p>;
  };

  const renderApprovalForms = () => {
    if (userActionNeeded && !approve)
      return (
        <div>
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
            <label htmlFor="checkbox-approve" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approve}
                onChange={handleApproveClick}
              />
              &nbsp;Согласен
            </label>
          </div>
        </div>
      );

    if (userActionNeeded && approve) {
      return (
        <div>
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
            <label htmlFor="checkbox-approve" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approve}
                onChange={handleApproveClick}
              />
              &nbsp;Согласен
            </label>
          </div>
          <button
            onClick={handleApproveSubmit}
            className={`border rounded-md p-[5px] mt-[10px] ${submitting ? 'cursor-wait' : 'cursor-pointer'}`}
            disabled={submitting}
          >
            Отправить
          </button>
        </div>
      );
    }

    return null;
  };

  const renderRetouch = (retouch: AssetView) => {
    if (!retouch) return;
    return (
      <>
        <div className="font-medium">Ретушь</div>
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
          {retouchNeeded ? renderForms() : renderApprovalForms()}
          <p data-qa="as">{approvalStageLabel(approvalStage)}</p>
        </>
      )}
    </div>
  );
};
