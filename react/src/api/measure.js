import { apiForm } from './base';
import store from '@/reducers';
import mainApiService from '@/services/mainApiService';

const state = store.getState();

export const processBasicMeasure = async (filepath) => {
  const params = { path: filepath };
  return await mainApiService.post('image/measure/processBasicMeasure', params);
};

export const uploadMeasureData = async (data) => {
  let keyList = [];
  const formData = new FormData();

  for (const key in data) {
    keyList.push(key);
    // console.log(`${key} - ${JSON.stringify(data[key])}`);
    formData.append([key], JSON.stringify(data[key]));
    formData.append('keyList', key);
  }
  let response = await apiForm.post(
    'image/measure/update_measure_data',
    formData,
  );
  return response;
};

export const createMeasureData = async (data, path) => {
  let keyList = [];
  const formData = new FormData();

  for (const key in data) {
    keyList.push(key);
    // console.log(`${key} - ${JSON.stringify(data[key])}`);
    formData.append([key], JSON.stringify(data[key]));
    formData.append('keyList', key);
  }
  formData.append('originPath', path);
  let response = await apiForm.post(
    'image/measure/create_measure_data',
    formData,
  );
  return response;
};
