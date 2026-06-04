'use client';
import { useParams } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';
import {
  labelOf,
  approvalStageLabels,
  adminApiFetch,
  finishLabels,
  holePatternLabels,
} from '@utils';
import { AssetThumb } from './asset-thumb';
import { UploadAsset } from './upload-assets';
import { AssetPair, fetchAssetPairs } from '../utils/assets-api';
import { useAppStore } from '@state';
import { Board } from './board';

const approvalStageLabel = labelOf<string>(approvalStageLabels);
const finishLabel = labelOf<string>(finishLabels);
const holePatternLabel = labelOf<string>(holePatternLabels);

export function OrderItemsDetails({
  itemId,
  userId,
}: {
  itemId: string;
  userId: string;
}) {
  const { id } = useParams<{ itemId: string; id: string }>();
  const queue = useAppStore((s) => s.queue);
  const { data, isLoading, mutate } = useSWR(
    `/api/admin/orders/${id}/items/${itemId}`,
    (u) => adminApiFetch(u).then((r) => r.json()),
  );
  const [pairs, setPairs] = React.useState<AssetPair[]>([]);

  const reload = React.useCallback(async () => {
    if (!id || !itemId) return;
    const freshPairs = await fetchAssetPairs(id, itemId);
    setPairs(freshPairs);
    await mutate();
  }, [id, itemId, mutate]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  React.useEffect(() => {
    const relevantJobs = queue.filter(
      (j) => j.orderId === id && j.itemId === itemId,
    );
    const allDone =
      relevantJobs.length > 0 && relevantJobs.every((j) => j.state === 'done');
    if (allDone) reload();
  }, [queue]);

  if (isLoading) {
    return <div>Загрузка.....</div>;
  }

  if (!data) {
    return <div>нет</div>;
  }

  const renderDates = () => {
    if (data.dateOfBirth && data.dateOfDeath) {
      const dateOfBirth = new Date(data.dateOfBirth);
      const dateOfDeath = new Date(data.dateOfDeath);
      return (
        <>
          <div className="text-sm pl-[15px]">
            Дата рождения:&nbsp;
            {dateOfBirth.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="text-sm pl-[15px]">
            Дата смерти:&nbsp;
            {dateOfDeath.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </>
      );
    } else return null;
  };

  const renderSecondDates = () => {
    if (data.dateOfBirthSecondPerson && data.dateOfDeathSecondPerson) {
      const dateOfBirthSecondPerson = new Date(data.dateOfBirthSecondPerson);
      const dateOfDeathSecondPerson = new Date(data.dateOfDeathSecondPerson);
      return (
        <>
          <div className="text-sm pl-[15px]">
            Дата рождения:&nbsp;
            {dateOfBirthSecondPerson.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="text-sm pl-[15px]">
            Дата смерти:&nbsp;
            {dateOfDeathSecondPerson.toLocaleString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </>
      );
    } else return null;
  };

  return (
    <div className="p-3 my-2 flex justify-between">
      <div className="mr-[20px]">
        <div className="text-sm">
          {data.templateFullTitle ? data.templateFullTitle : data.templateLabel}
        </div>
        <div className="text-sm">Вид фона: {data.background?.name}</div>
        <div className="text-sm">Размер: {data.size?.label}</div>
        {data.frame && (
          <div className="text-sm">Вид рамки: {data.frame?.code}</div>
        )}
        {data.finish && (
          <div className="text-sm">Финиш: {finishLabel(data.finish)}</div>
        )}
        {data.holePattern && (
          <div className="text-sm">
            Отверстия: {holePatternLabel(data.holePattern)}
          </div>
        )}
        {data.comment && (
          <div className="text-sm">Комментарий: {data.comment}</div>
        )}
        <div>
          {data.firstName ? (
            <>
              <div>Данные для надписи</div>
              {data.firstName && (
                <div className="text-sm pl-[15px]">Имя: {data.firstName}</div>
              )}
              {data.middleName && (
                <div className="text-sm pl-[15px]">
                  Отчество: {data.middleName}
                </div>
              )}
              {data.lastName && (
                <div className="text-sm pl-[15px]">
                  Фамилия: {data.lastName}
                </div>
              )}
            </>
          ) : (
            ''
          )}
          {renderDates()}
        </div>
        <div>
          {data.firstNameSecondPerson ? (
            <>
              <div>Данные для надписи второго человека</div>
              {data.firstNameSecondPerson && (
                <div className="text-sm pl-[15px]">
                  Имя: {data.firstNameSecondPerson}
                </div>
              )}
              {data.middleNameSecondPerson && (
                <div className="text-sm pl-[15px]">
                  Отчество: {data.middleNameSecondPerson}
                </div>
              )}
              {data.lastNameSecondPerson && (
                <div className="text-sm pl-[15px]">
                  Фамилия: {data.lastNameSecondPerson}
                </div>
              )}
            </>
          ) : (
            ''
          )}
          {renderSecondDates()}
        </div>

        {data.retouchNeeded && (
          <p>
            <b> Нужна ретушь!</b>
          </p>
        )}
        {data.approveNeeded && (
          <p>
            <b className={`${data.approved ? 'line-through' : ''}`}>
              Нужно согласование!
            </b>
            {data.approved && 'Согласовано'}
          </p>
        )}
        {data.userActionNeeded && !data.managerActionNeeded && (
          <span className="text-red-500">Ожидание пользователя</span>
        )}

        {!data.userActionNeeded && data.managerActionNeeded && (
          <span className="text-red-500">Ожидание ответа от менеджера</span>
        )}
        <>
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
              {data.approveNeeded && data.approvalStage && (
                <p>{approvalStageLabel(data.approvalStage)}</p>
              )}
              <div className="font-medium flex items-center gap-2">
                <span>Ретушь</span>
                {retouch?.createdAt && (
                  <span className="text-sm font-normal text-gray-500">
                    Отправлен{' '}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {retouch && (
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
                )}
              </div>
              {data.discussComment && !data.userActionNeeded && (
                <div>
                  <div>Комментарий по ретуши:</div>
                  <div>{data.discussComment}</div>
                </div>
              )}
              {data.approved ? (
                <p>
                  <b>Согласовано</b>
                </p>
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <UploadAsset
                    orderId={id}
                    itemId={itemId}
                    mode="retouch"
                    sourceAssetId={original.id}
                    onDone={reload}
                    userId={userId}
                  />
                </div>
              )}
            </div>
          ))}
        </>
      </div>
      <div className="w-[400px]">
        <Board itemId={itemId} orderId={id} userId={userId} />
      </div>
    </div>
  );
}
