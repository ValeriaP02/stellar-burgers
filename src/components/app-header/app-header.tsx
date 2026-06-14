import { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../services/store';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const user = useSelector((s: RootState) => s.auth.user);

  return <AppHeaderUI userName={user?.name ?? ''} />;
};
