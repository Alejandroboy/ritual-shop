'use client';
import React, { useEffect, useMemo, useState } from 'react';
import type { TemplateDetails } from '@types';
import { UploadAsset } from './upload-assets';
import { useAppStore } from '@state';
import { useRouter } from 'next/navigation';
import { finishLabels, holePatternLabels, labelOf } from '@utils';
import Link from 'next/link';

type Props = { tpl: TemplateDetails };

const holePatternLabel = labelOf<string>(holePatternLabels);
const finishLabel = labelOf<string>(finishLabels);

export default function AddToOrderForm({ tpl }: Props) {
  const router = useRouter();
  const attachPendingToItem = useAppStore((s) => s.attachPendingToItem);
  const draftOrderId = useAppStore((s) => s.draftOrderId);
  const ensureOrder = useAppStore((s) => s.ensureOrder);
  const addItem = useAppStore((s) => s.addItem);
  const queue = useAppStore((s) => s.queue);
  const assetUploaded = queue.filter(
    (item) => item.state === 'uploaded' || item.state === 'done',
  );
  const assetError = queue.filter((item) => item.state === 'error');
  const assetLoading = queue.filter(
    (item) =>
      item.state === 'uploading' ||
      item.state === 'queued' ||
      item.state === 'registering',
  );

  const [itemId, setItemId] = useState<string | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [dateOfDeath, setDateOfDeath] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirthSecondPerson, setDateOfBirthSecondPerson] =
    useState<string>('');
  const [dateOfDeathSecondPerson, setDateOfDeathSecondPerson] =
    useState<string>('');
  const [firstNameSecondPerson, setFirstNameSecondPerson] =
    useState<string>('');
  const [middleNameSecondPerson, setMiddleNameSecondPerson] =
    useState<string>('');
  const [lastNameSecondPerson, setLastNameSecondPerson] = useState<string>('');
  const [approveNeeded, setApproveNeeded] = useState<boolean>(false);
  const [retouchNeeded, setRetouchNeeded] = useState<boolean>(false);
  const [readAgreement, setReadAgreement] = useState<boolean>(false);

  const [sizeId, setSizeId] = useState<number>(tpl.defaults.sizeId ?? 0);
  const price = () => {
    let price;
    if (
      tpl.requiresFinish &&
      Object.keys(tpl.finishPricesBySizeId).length !== 0
    ) {
      price = tpl.finishPricesBySizeId[sizeId]?.[finish] || 0;
    } else {
      price = tpl.allowedSizes.filter((item) => item.size.id === sizeId)[0]
        ?.price;
    }

    if (tpl.perHolePrice && holePattern) {
      const firstFour = holePattern.slice(0, 4);
      if (firstFour.includes('TWO') && price && tpl.perHolePrice) {
        price += tpl.perHolePrice * 2;
      }
      if (firstFour.includes('FOUR') && price) {
        price += tpl.perHolePrice * 4;
      }
    }

    return price;
  };
  let scuCode = tpl.allowedSizes.filter((item) => item.size.id === sizeId)[0]
    ?.skuCode;
  const [skuCode, setSkuCode] = useState<string>(scuCode ?? '');
  const [holePattern, setHolePattern] = useState<string | ''>(
    tpl.defaults.holePattern ?? '',
  );

  const [frameId, setFrameId] = useState<number | ''>(
    tpl.defaults.frameId ?? '',
  );
  const [backgroundId, setBackgroundId] = useState<number | ''>(
    tpl.defaults.backgroundId ?? '',
  );
  const [finish, setFinish] = useState<string | ''>(tpl.defaults.finish ?? '');
  const [goldType, setGoldType] = useState<string>(
    tpl.goldTypes?.length ? tpl.goldTypes[0].goldType : '',
  );
  const [comment, setComment] = useState('');

  const needFinish =
    tpl.requiresFinish ||
    tpl.variants.some((v) => v.holePattern === holePattern && v.finishRequired);

  const finishOptions = useMemo(() => {
    return tpl.allowedFinishes.map((v) => v.finish);
  }, [holePattern, tpl.allowedFinishes]);

  useEffect(() => {
    let scuCode: string | undefined;
    if (tpl.finishSkuCodesBySizeId) {
      scuCode = tpl.finishSkuCodesBySizeId?.[sizeId]?.[finish];
    } else {
      scuCode = tpl.allowedSizes.filter((item) => item.size.id === sizeId)[0]
        ?.skuCode;
    }
    setSkuCode(scuCode ?? '');
  }, [sizeId, finish]);
  useEffect(() => {
    if (availableSizes.length) {
      setSizeId(availableSizes[0].size.id);
    }
  }, [holePattern]);

  async function submit() {
    if (!readAgreement) {
      alert(
        'Прочитайте правила оформления заказа и согласитесь с обработкой персональных данных',
      );
      return;
    }
    const orderId = await ensureOrder();
    const payload = {
      dateOfBirth,
      dateOfDeath,
      firstName,
      middleName,
      lastName,
      dateOfBirthSecondPerson,
      dateOfDeathSecondPerson,
      firstNameSecondPerson,
      middleNameSecondPerson,
      lastNameSecondPerson,
      skuCode,
      templateCode: tpl.code,
      sizeId: sizeId || undefined,
      holePattern: holePattern || undefined,
      frameId: frameId || undefined,
      backgroundId: backgroundId || undefined,
      finish: finish || undefined,
      comment: comment || undefined,
      goldType: goldType || undefined,
      approveNeeded,
      retouchNeeded,
    };
    try {
      const item = await addItem(payload);
      setItemId(item.id);
      attachPendingToItem(orderId, item.id);
      alert('Позиция добавлена в заказ');
      router.push('/checkout');
    } catch (e) {
      alert('Ошибка добавления заказа');
      console.log('Ошибка добавления заказа', e);
    }
  }

  function handleApproveClick() {
    setApproveNeeded((prevState) => !prevState);
  }

  function handleRetouchClick() {
    setRetouchNeeded((prevState) => !prevState);
  }

  function handleReadClick() {
    setReadAgreement((prevState) => !prevState);
  }

  const renderCheckboxes = () => {
    if (!assetUploaded.length) {
      return (
        <div className="mb-[15px] ">
          <div className="p-[15px] border rounded-xl block w-fit">
            <label
              className="cursor-pointer flex items-center"
              htmlFor="checkbox-approve"
            >
              <input
                type="checkbox"
                className="h-6 w-6 accent-black cursor-pointer"
                id="checkbox-approve"
                checked={approveNeeded}
                onChange={handleApproveClick}
              />
              <div>&nbsp;Нужно согласование</div>
            </label>
          </div>
        </div>
      );
    }
    if (assetUploaded.length) {
      return (
        <div className="mb-[15px] flex">
          <div className="mr-[15px] cursor-pointer p-[15px] border rounded-xl block w-fit">
            <label
              className="cursor-pointer flex items-center"
              htmlFor="checkbox-approve"
            >
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approveNeeded}
                className="cursor-pointer h-6 w-6 accent-black"
                onChange={handleApproveClick}
              />
              <div>&nbsp;Нужно согласование</div>
            </label>
          </div>
          <div className="cursor-pointer p-[15px] border rounded-xl block w-fit">
            <label
              className="cursor-pointer flex items-center"
              htmlFor="checkbox-retouch"
            >
              <input
                type="checkbox"
                id="checkbox-retouch"
                checked={retouchNeeded}
                className="h-6 w-6 accent-black cursor-pointer"
                onChange={handleRetouchClick}
              />
              <div>&nbsp;Нужна ретушь</div>
            </label>
          </div>
        </div>
      );
    }
  };

  const renderRequiredCheckboxes = () => {
    return (
      <div>
        <div className="mr-[15px] p-[15px] flex items-center">
          <label className="cursor-pointer" htmlFor="checkbox-agreement">
            <input
              type="checkbox"
              className="mt-2 h-6 w-6 accent-black cursor-pointer"
              id="checkbox-agreement"
              checked={readAgreement}
              onChange={handleReadClick}
            />
          </label>
          <div className="ml-[15px]">
            Я даю&nbsp;
            <Link href="/agreement" className="underline" target="_blank">
              согласие
            </Link>
            &nbsp;на обработку персональных данных в соответствии с&nbsp;
            <Link href="/privacy" className="underline" target="_blank">
              политикой конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderButtons = () => {
    if (
      (assetUploaded.length && !assetLoading.length && !assetError.length) ||
      (!assetLoading.length && !assetError.length)
    ) {
      return (
        <div>
          {renderCheckboxes()}
          <div className="flex gap-2">
            <button
              onClick={submit}
              className={`px-4 py-2 rounded-md bg-neutral-900 text-white ${readAgreement ? '' : 'opacity-25 cursor-not-allowed'}`}
            >
              Добавить в заказ
            </button>
          </div>
          {renderRequiredCheckboxes()}
        </div>
      );
    }
    if (assetLoading.length) {
      return <div>Загрузка...</div>;
    }
    if (assetError.length) {
      return <div>Пожалуйста загрузите другое изображение</div>;
    }
  };
  const availableSizes = tpl.allowedSizes
    .filter((item) => item.availableHolePattern.includes(holePattern))
    .sort((a, b) => {
      if (a.size.widthCm < b.size.widthCm) {
        return -1;
      } else if (a.size.widthCm > b.size.widthCm) {
        return 1;
      } else {
        if (a.size.heightCm < b.size.heightCm) {
          return -1;
        } else if (a.size.heightCm > b.size.heightCm) {
          return 1;
        }
        return 0;
      }
    });

  const renderSecondPersonFields = () => {
    return (
      <>
        <div>Данные второго человека</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Дата Рождения</span>
            <input
              type="date"
              className="border rounded-md px-2 py-1 bg-white"
              value={dateOfBirthSecondPerson}
              onChange={(e) => setDateOfBirthSecondPerson(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Дата смерти</span>
            <input
              type="date"
              className="border rounded-md px-2 py-1 bg-white"
              value={dateOfDeathSecondPerson}
              onChange={(e) => setDateOfDeathSecondPerson(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Фамилия</span>
            <input
              className="border rounded-md px-2 py-1 bg-white min-w-64"
              value={lastNameSecondPerson}
              onChange={(e) => setLastNameSecondPerson(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">Имя</span>
            <input
              className="border rounded-md px-2 py-1 bg-white min-w-64"
              value={firstNameSecondPerson}
              onChange={(e) => setFirstNameSecondPerson(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-neutral-600">
              Отчество (если есть)
            </span>
            <input
              className="border rounded-md px-2 py-1 bg-white min-w-64"
              value={middleNameSecondPerson}
              onChange={(e) => setMiddleNameSecondPerson(e.target.value)}
            />
          </label>
        </div>
      </>
    );
  };

  return (
    <div className="border rounded-xl p-4 bg-white space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {tpl.goldTypes?.length ? (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Вид</div>
            {tpl.goldTypes.length > 1 ? (
              <>
                <select
                  className="border rounded-md px-2 py-1 bg-white w-full"
                  value={goldType}
                  onChange={(e) => setGoldType(e.target.value || '')}
                >
                  {tpl.goldTypes.map((f) => {
                    return (
                      <option key={f.goldType} value={f.goldType}>
                        {f.goldType}
                      </option>
                    );
                  })}
                </select>
              </>
            ) : (
              <span>{tpl.goldTypes[0].goldType}</span>
            )}
          </label>
        ) : (
          ''
        )}
        {needFinish && (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Финиш</div>
            {finishOptions.length > 1 ? (
              <>
                <select
                  className="border rounded-md px-2 py-1 bg-white w-full"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value || '')}
                >
                  {finishOptions.map((f) => {
                    return (
                      <option key={f} value={f}>
                        {finishLabel(f)}
                      </option>
                    );
                  })}
                </select>
                *Выбор финиша обязателен*
              </>
            ) : (
              <span>{finishLabel(finishOptions[0])}</span>
            )}
          </label>
        )}
        {tpl.supportsFrame && (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Рамка</div>
            <select
              className="border rounded-md px-2 py-1 bg-white w-full"
              value={frameId}
              onChange={(e) =>
                setFrameId(e.target.value ? Number(e.target.value) : '')
              }
            >
              {tpl.frames.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {tpl.requiresBackground && (
          <label className="text-sm">
            <div className="mb-1 text-neutral-600">Фон</div>
            {tpl.backgrounds.length > 1 ? (
              <select
                className="border rounded-md px-2 py-1 bg-white w-full"
                value={backgroundId}
                onChange={(e) =>
                  setBackgroundId(e.target.value ? Number(e.target.value) : '')
                }
              >
                {tpl.backgrounds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <span>{tpl.backgrounds[0].name}</span>
            )}
          </label>
        )}
        <label className="text-sm">
          <div className="mb-1 text-neutral-600">Отверстия</div>
          {tpl.holes.length > 1 ? (
            <select
              className="border rounded-md px-2 py-1 bg-white w-full"
              value={holePattern}
              onChange={(e) => setHolePattern(e.target.value || '')}
            >
              {tpl.holes.map((h) => (
                <option key={h} value={h}>
                  {holePatternLabel(h)}
                </option>
              ))}
            </select>
          ) : (
            <span>{holePatternLabel(tpl.holes[0])}</span>
          )}
        </label>
        <label className="text-sm">
          <div className="mb-1 text-neutral-600">Размер</div>
          {availableSizes.length > 1 ? (
            <select
              className="border rounded-md px-2 py-1 bg-white w-full"
              value={sizeId}
              onChange={(e) =>
                setSizeId(e.target.value ? Number(e.target.value) : 0)
              }
            >
              {availableSizes.map((s) => (
                <option key={s.size.id} value={s.size.id}>
                  {s.size.label}
                </option>
              ))}
            </select>
          ) : (
            <span>{availableSizes[0].size.label}</span>
          )}
        </label>
      </div>
      {tpl.inscribed && (
        <>
          <div>Надпись на изделии</div>
          {!tpl.singlePerson && <div>Данные первого человека</div>}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block mb-1 text-neutral-600">Дата Рождения</span>
              <input
                type="date"
                className="border rounded-md px-2 py-1 bg-white"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-neutral-600">Дата смерти</span>
              <input
                type="date"
                className="border rounded-md px-2 py-1 bg-white"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-neutral-600">Фамилия</span>
              <input
                className="border rounded-md px-2 py-1 bg-white min-w-64"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-neutral-600">Имя</span>
              <input
                className="border rounded-md px-2 py-1 bg-white min-w-64"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-neutral-600">
                Отчество (если есть)
              </span>
              <input
                className="border rounded-md px-2 py-1 bg-white min-w-64"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </label>
          </div>
          {!tpl.singlePerson && renderSecondPersonFields()}
        </>
      )}

      <label className="text-sm block">
        <div className="mb-1 text-neutral-600">Комментарий</div>
        <textarea
          className="border rounded-md px-2 py-1 bg-white w-full"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </label>

      <div className="pt-2">
        <UploadAsset orderId={draftOrderId} itemId={itemId} mode="original" />
      </div>

      <div className="flex justify-between">
        <div>
          Итоговая цена: {Number.isFinite(price()) ? price() / 100 : 0}
          &nbsp;&#8381;
        </div>
      </div>
      <div>
        Ознакомьтесь с&nbsp;
        <Link href="/rules" className="underline" target="_blank">
          правилами оформления заказа
        </Link>
      </div>
      {renderButtons()}
    </div>
  );
}
