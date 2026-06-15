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
    const notDone = orders.filter((o) => o.status !== 'done');
    return sliceTop(ordersToNumbers(notDone));
  }, [orders]);

  useEffect(() => {
    console.log('feed orders', orders);
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
