import { FC, SyntheticEvent, useEffect, useState, ChangeEvent } from 'react';
import { ProfileUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { updateUserApi, getUserApi } from '../../utils/burger-api';
import { checkUserAuth } from '../../services/slices/authSlice';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  interface FormValueState {
    name: string;
    email: string;
    password: string;
  }

  const [formValue, setFormValue] = useState<FormValueState>({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserApi();
        if (userData.success) {
          setFormValue({
            name: userData.user.name,
            email: userData.user.email,
            password: ''
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const userDataToUpdate = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password || undefined
    };

    try {
      const updatedUser = await updateUserApi(userDataToUpdate);
      if (updatedUser.success) {
        setIsFormChanged(false);
        dispatch(checkUserAuth());
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля пользователя:', error);
    }
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
    setIsFormChanged(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValue((prevState) => ({
      ...prevState,
      [name]: value
    }));
    setIsFormChanged(true);
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
