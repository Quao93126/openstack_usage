import { api } from './base';
import store from '../reducers';
import axios from 'axios';

export const login = (params) => {
  const formData = new FormData();
  formData.append('username', params.email); // email is username
  formData.append('password', params.password);
  formData.append('otp', params.otp);
  return api.post('auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const register_user = (params) => {
  return api.post('auth/register', params);
};

// USER SUPPORT CHAT
export const submit_message = async (msg) => {
  var state = store.getState();
  let user = state.auth.user;
  if (user === null || user.email === undefined || user.email === null) {
    return { data: '', status: '' };
  } else {
    const data = {
      text: `Name: ${user.fullName} \nEmail: ${user.email} \nContent: ${msg}`,
    };
    let res = await axios.post(
      process.env.REACT_APP_CHAT_SLACK_WEBHOOK,
      JSON.stringify(data),
      {
        withCredentials: false,
        transformRequest: [
          (data, headers) => {
            delete headers.post['Content-Type'];
            return data;
          },
        ],
      },
    );
    return res;
  }
};

export const confirm_password = (password, isAdvance = false) => {
  const formData = new FormData();
  formData.append('password', password);
  formData.append('is_advance', isAdvance);
  return api.post('auth/confirm_password', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const checkPurchase = (email) => {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('app_name', 'IAS');
  formData.append('cat_tab', 'IAS001M21');

  return axios({
    method: 'post',
    url: process.env.REACT_APP_ADMIN_API_URL + 'api/purchase/checkout',
    data: formData,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
      'Content-Type': 'multipart/form-data',
    },
  });
};
