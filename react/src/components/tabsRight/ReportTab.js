import * as React from 'react';
import { useEffect } from 'react';
import SmallCard from '../custom/SmallCard';
import TabItem from '../custom/TabItem';
import { useFlagsStore } from '@/state';
import VisualDialog from './contents/report/VisualDialog';
// import Divider from '@mui/material/Divider';
import CustomButton from '../custom/CustomButton';
import {
  mdiCloudOutline,
  mdiFileExcel,
  mdiFileExcelOutline,
  mdiFile,
  mdiEyeOutline,
  mdiTable,
  mdiFileImage,
} from '@mdi/js';
import { useSelector } from 'react-redux';
import { getHdf5Url, getZipUrl } from '@/helpers/file';
import * as FileSaver from 'file-saver';
import mainApiService from '@/services/mainApiService';
const ExcelJS = require('exceljs');

// import fs from 'fs';
// const dampleData = [{firstName}];

export default function ReportTab() {
  const DialogVisualFlag = useFlagsStore((store) => store.DialogVisualFlag);
  const ReportVisualFlag = useFlagsStore((store) => store.ReportVisualFlag);
  const imagePathForCountResult = useSelector(
    (state) => state.files.imagePathForCountResult,
  );
  const hdf5FilePath = useSelector((state) => state.files.hdf5FilePath);
  const zipFilePath = useSelector((state) => state.files.measureResultZipPath);
  const measureData = useSelector((state) => state.measure);
  const classSettingData = useSelector(
    (state) => state.measure.class_setting_data,
  );

  const onClick1 = () => {};
  const onClick2 = async () => {
    if (!measureData) return;
    if (!measureData.ml_measure_data.length) return;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    let image = null;

    if (imagePathForCountResult) {
      let path = imagePathForCountResult;
      if (path.indexOf('path=') >= 0) {
        path = path.substr(path.indexOf('path=') + 5);
      }
      if (path[0] == '/') {
        path = path.substr(1);
      }

      path = path.replace('mainApi/app/static', '');

      const blob = await mainApiService.get(`/static/${path}`, {
        responseType: 'blob',
      });
      const file = new File([blob], path, { type: 'image/jpg' });
      file.path = path;

      // Add the image to the worksheet
      image = workbook.addImage({
        buffer: file,
        extension: 'jpg',
      });
    }

    for (let i = 0; i < classSettingData.length; i++) {
      let sheetName = classSettingData[i].className;
      let worksheet = workbook.addWorksheet(sheetName);

      let rowCount = 0;

      let classItem = classSettingData[i].selectedItems;
      let header = ['No'];
      for (let i = 0; i < classItem.length; i++) {
        header.push(classItem[i]);
      }
      worksheet.addRow(header);
      rowCount++;

      for (let j = 0; j < measureData.ml_measure_data[i].data.length; j++) {
        let item = measureData.ml_measure_data[i].data[j];

        let data = [];
        for (let k = 0; k < item.length; k++) {
          data.push(item[k]);
        }
        worksheet.addRow(data);
        rowCount++;
      }

      if (imagePathForCountResult) {
        worksheet.addImage(image, {
          tl: { col: 1, row: rowCount + 2 },
          br: { col: header.length, row: rowCount + 7 },
          editAs: 'oneCell',
        });
      }
    }

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'measure_result.xlsx';
      link.click();
    });
  };
  const onClick4 = () => {
    //  Download Hdf5 file
    let url = getHdf5Url(hdf5FilePath);
    if (!url) return;
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'measure_result.hdf5';
        a.click();
      });
    });
  };
  const onClick5 = () => {
    //  Download Hdf5 file
    let url = getZipUrl(zipFilePath);
    if (!url) return;
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'measure_result.zip';
        a.click();
      });
    });
  };
  const handleClickVisual = () => {
    // useFlagsStore.setState({ DialogVisualFlag: true });
    useFlagsStore.setState({ ReportVisualFlag: true });
  };

  const downloadCSV = async () => {
    if (!measureData) return;
    if (!measureData.ml_measure_data.length) return;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    let image = null;

    if (imagePathForCountResult) {
      let path = imagePathForCountResult;
      if (path.indexOf('path=') >= 0) {
        path = path.substr(path.indexOf('path=') + 5);
      }
      if (path[0] == '/') {
        path = path.substr(1);
      }

      path = path.replace('mainApi/app/static', '');

      const blob = await mainApiService.get(`/static/${path}`, {
        responseType: 'blob',
      });
      const file = new File([blob], path, { type: 'image/jpg' });
      file.path = path;

      // Add the image to the worksheet
      image = workbook.addImage({
        buffer: file,
        extension: 'jpg',
      });
    }

    for (let i = 0; i < classSettingData.length; i++) {
      let sheetName = classSettingData[i].className;
      const worksheet = workbook.addWorksheet(sheetName);

      let rowCount = 0;

      let classItem = classSettingData[i].selectedItems;
      let header = ['No'];
      for (let i = 0; i < classItem.length; i++) {
        header.push(classItem[i]);
      }
      worksheet.addRow(header);
      rowCount++;

      for (let j = 0; j < measureData.ml_measure_data[i].data.length; j++) {
        let item = measureData.ml_measure_data[i].data[j];

        let data = [];
        for (let k = 0; k < item.length; k++) {
          data.push(item[k]);
        }
        worksheet.addRow(data);
        rowCount++;
      }

      if (imagePathForCountResult) {
        worksheet.addImage(image, {
          tl: { col: 1, row: rowCount + 2 },
          br: { col: header.length, row: rowCount + 7 },
          editAs: 'oneCell',
        });
      }
    }

    workbook.csv.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'measure_result.csv';
      link.click();
    });
  };

  useEffect(() => {
    return () => {
      useFlagsStore.setState({ ReportVisualFlag: false });
    };
  }, []);

  const onClick6 = () => {};
  return (
    <TabItem title="Report">
      {/* <p className='mt-4'>Save</p> */}
      <SmallCard title="Save & Export">
        <CustomButton icon={mdiCloudOutline} label="Cloud" click={onClick1} />
        <CustomButton icon={mdiFileExcel} label="Excel" click={onClick2} />
        <CustomButton
          icon={mdiFileExcelOutline}
          label="CSV"
          click={downloadCSV}
        />
        <CustomButton icon={mdiFileImage} label="Images" click={onClick5} />
        <CustomButton icon={mdiFile} label="hdf5" click={onClick4} />
      </SmallCard>
      {/* {DialogVisualFlag && <VisualDialog />} */}
      {/* <p className='mt-4'>View</p> */}
      <SmallCard title="View">
        <CustomButton
          icon={mdiEyeOutline}
          label="visual"
          click={handleClickVisual}
        />
        <CustomButton icon={mdiTable} label="tableau" click={onClick6} />
      </SmallCard>
    </TabItem>
  );
}
