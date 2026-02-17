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

const approvalStageLabel = labelOf<string>(approvalStageLabels);
const finishLabel = labelOf<string>(finishLabels);
const holePatternLabel = labelOf<string>(holePatternLabels);

export function OrderItemsDetails({
  itemId,
  userId,
}: {
  itemId: string;
  userId?: string;
}) {
  const { id } = useParams<{ itemId: string; id: string }>();
  const { data, mutate, isLoading } = useSWR(
    `/api/admin/orders/${id}/items/${itemId}`,
    (u) => adminApiFetch(u).then((r) => r.json()),
  );

  const [pairs, setPairs] = React.useState<AssetPair[]>([]);

  const reload = React.useCallback(async () => {
    if (!id || !itemId) return;
    const data = await fetchAssetPairs(id, itemId);
    setPairs(data);
  }, [id, itemId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  if (isLoading) {
    return <div>Загрузка.....</div>;
  }

  if (!data) {
    return <div>нет</div>;
  }

  return (
    <div className="p-3 my-2">
      <div className="text-sm">
        {data.templateFullTitle ? data.templateFullTitle : data.templateLabel}
      </div>
      <div className="text-sm">Вид фона: {data.backgroundId}</div>
      <div className="text-sm">Размер: {data.size?.label}</div>
      {data.frameId && <div className="text-sm">Вид рамки: {data.frameId}</div>}
      {data.finish && (
        <div className="text-sm">Финиш: {finishLabel(data.finish)}</div>
      )}
      {data.holePattern && (
        <div className="text-sm">
          Отверстия: {holePatternLabel(data.holePattern)}
        </div>
      )}
      {data.firstName ? (
        <div>
          <div>Данные для надписи</div>
          {data.firstName && (
            <div className="text-sm pl-[15px]">Имя: {data.firstName}</div>
          )}
          {data.middleName && (
            <div className="text-sm pl-[15px]">Отчество: {data.middleName}</div>
          )}
          {data.lastName && (
            <div className="text-sm pl-[15px]">Фамилия: {data.lastName}</div>
          )}
          {data.dateOfBirth && (
            <div className="text-sm pl-[15px]">
              Дата рождения: {data.dateOfBirth}
            </div>
          )}
          {data.dateOfDeath && (
            <div className="text-sm pl-[15px]">
              Дата смерти: {data.dateOfDeath}
            </div>
          )}
        </div>
      ) : (
        ''
      )}
      {data.firstNameSecondPerson ? (
        <div>
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
          {data.dateOfBirthSecondPerson && (
            <div className="text-sm pl-[15px]">
              Дата рождения: {data.dateOfBirthSecondPerson}
            </div>
          )}
          {data.dateOfDeathSecondPerson && (
            <div className="text-sm pl-[15px]">
              Дата смерти: {data.dateOfDeathSecondPerson}
            </div>
          )}
        </div>
      ) : (
        ''
      )}
      {data.retouchNeeded && (
        <p>
          <b> Нужна ретушь!</b>
        </p>
      )}
      {data.approveNeeded && (
        <p>
          <b>Нужно согласование!</b>
        </p>
      )}
      {data.retouchNeeded === false && data.approveNeeded === false ? (
        <>
          {pairs.map(({ original, retouch }) => (
            <div key={original.id} className="rounded-2xl shadow p-4">
              <AssetThumb
                asset={{
                  id: original.id,
                  originalName: original.originalName,
                  contentType: original.contentType,
                }}
                size={180}
                primary={original.primary}
              />
            </div>
          ))}
        </>
      ) : (
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
              <div className="font-medium">Ретушь</div>
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
              {data.userActionNeeded && !data.managerActionNeeded && (
                <span>Ожидание пользователя</span>
              )}
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
      )}
    </div>
  );
}
