import axiosInstance from './axiosInstance';

export const signUp = async userData => {
  const { data } = await axiosInstance.post('/users/signup', userData);
  return data;
};

export const signIn = async userData => {
  const { data } = await axiosInstance.post('/users/signin', userData);
  return data;
};

export const signOut = async () => {
  const { data } = await axiosInstance.post('/users/signout');
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get('/users/current');
  return data;
};