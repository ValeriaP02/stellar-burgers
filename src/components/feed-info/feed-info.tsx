import React, { FC, useEffect, useMemo } from 'react';
import { useSelector } from '../../services/store';

import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import {
  selectFeedOrders,
  selectFeedTotals
} from '../../services/slices/feedSlice';

const sliceTop = (arr: number[]) => arr.slice(0, 20);

const ordersToNumbers = (orders: TOrder[]) => orders.map((o) => o.number);

export const FeedInfo: FC = () => {
  const orders = useSelector(selectFeedOrders);
  const { total, totalToday } = useSelector(selectFeedTotals);

  const readyOrders = useMemo(() => {
    const ready = orders.filter((o) => o.status === 'done');
    return sliceTop(ordersToNumbers(ready));
  }, [orders]);

  const pendingOrders = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending');
    return sliceTop(ordersToNumbers(pending));
  }, [orders]);

  useEffect(() => {
    if (!orders.length) return;
    console.log(
      'feed status samples:',
      orders.slice(0, 10).map((o) => o.status)
    );
  }, [orders]);

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={{ total, totalToday } as any}
    />
  );
};

export default FeedInfo;
