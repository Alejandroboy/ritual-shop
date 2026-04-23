'use client';

import useSWR from 'swr';
import { adminApiFetch } from '@utils';
import React, { useState } from 'react';
import { useAppStore } from '@state';

export function Board({
  itemId,
  userId,
  orderId,
}: {
  itemId: string;
  orderId: string;
  userId: string;
}) {
  const [showForm, setShowForm] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [disapproveRetouch, setDisapproveRetouch] = useState(false);
  const [approve, setApprove] = useState(false);
  const addComment = useAppStore((s) => s.addComment);
  const updateApprove = useAppStore((s) => s.updateApprove);
  const me = useAppStore((s) => s.me);

  const { data, mutate } = useSWR(
    `/api/admin/orders/${orderId}/items/${itemId}`,
    (u) => adminApiFetch(u).then((r) => r.json()),
  );

  function handleApproveClick() {
    setApprove((prev) => !prev);
    setDisapproveRetouch(false);
  }

  async function handleApproveSubmit() {
    try {
      setSubmitting(true);
      await updateApprove({ orderId, userId, itemId });
      setApprove(false);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  }

  if (!me) {
    return null;
  }
  if (!data) {
    return null;
  }

  function handleDisapproveClick() {
    setDisapproveRetouch((prev) => !prev);
  }

  async function handleCommentSubmit() {
    try {
      setSubmitting(true);
      await addComment({
        orderId,
        text: comment,
        itemId,
        userName: me?.name,
        userRole: me?.role,
      });
      setComment('');
      setShowForm(false);
      await mutate();
    } finally {
      setSubmitting(false);
    }
  }

  const renderCommentForm = () => {
    return (
      <>
        <textarea
          className="border rounded-md px-2 py-1 bg-white w-full mt-[10px]"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          disabled={comment.length === 0}
          onClick={handleCommentSubmit}
          className={`border rounded-md  p-[5px] mt-[10px] ${comment.length === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          Отправить
        </button>
      </>
    );
  };

  const renderNotesForm = () => {
    return (
      <>
        <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
          <label htmlFor="checkbox-disapprove" className="cursor-pointer">
            <input
              type="checkbox"
              id="checkbox-disapprove"
              checked={disapproveRetouch}
              onChange={handleDisapproveClick}
            />
            &nbsp;Оставить комментарий
          </label>
        </div>
      </>
    );
  };

  const renderUserForm = () => {
    if (data.approved) {
      return null;
    }
    return (
      <>
        <div className="flex justify-between mt-[10px]">
          <div className="cursor-pointer mr-[15px] p-[15px] border rounded-xl block w-fit">
            <label htmlFor="checkbox-approve" className="cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-approve"
                checked={approve}
                onChange={handleApproveClick}
              />
              &nbsp;Согласовано
            </label>
          </div>
          {renderNotesForm()}
        </div>
        {disapproveRetouch && renderCommentForm()}
        {approve && (
          <button
            onClick={handleApproveSubmit}
            className={`border rounded-md p-[5px] mt-[10px] ${submitting ? 'cursor-wait' : 'cursor-pointer'}`}
            disabled={submitting}
          >
            Отправить
          </button>
        )}
      </>
    );
  };

  if (
    !data.discussComments.length &&
    !showForm &&
    (me?.role === 'ADMIN' || me?.role === 'ADMIN_GOD' || me?.role === 'MANAGER')
  ) {
    return (
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="px-3 py-1 border rounded-md cursor-pointer"
      >
        Оставить сообщение для пользователя
      </button>
    );
  }

  if (showForm) {
    return renderCommentForm();
  }

  if (data.discussComments.length) {
    return (
      <>
        <div className="flex flex-col">
          {(
            data.discussComments as {
              id: string;
              text: string;
              date: string;
              userName?: string;
            }[]
          )
            .toReversed()
            .map((item) => {
              const commentDate = new Date(item.date);
              return (
                <div
                  key={item.id}
                  className={`w-[300px] border rounded-3xl p-3 mb-[10px] 
                  ${item.userName === me?.name ? 'bg-blue-200' : 'bg-green-200'}
                  ${item.userName === me?.name ? 'self-end' : 'self-start'}
                  `}
                >
                  <div className="font-bold">
                    {commentDate.toLocaleString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      minute: 'numeric',
                      hour: 'numeric',
                    })}
                  </div>
                  <div>{item.text}</div>
                  <div className="text-gray-600">{item.userName}</div>
                </div>
              );
            })}
        </div>
        <>{data.userActionNeeded && 'Ожидание ответа от пользователя'}</>
        <>{data.managerActionNeeded && 'Ожидание ответа от менеджера'}</>
        {me?.role === 'CUSTOMER' ? renderUserForm() : renderCommentForm()}
      </>
    );
  }
}
