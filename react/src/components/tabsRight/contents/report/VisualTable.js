import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { readRemoteFile } from 'react-papaparse';
import store from '@/reducers';
import DataTable from '@/components/mui/DataTable';
import { useSelector } from 'react-redux';
import { MeasureHeader } from '@/constants/filters';

const VisualTable = () => {
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);

  const [csvData, setCSVData] = useState([]);

  const selectedImageItemPath = useSelector(
    (state) => state.files.selectedThumbnailPathForVisual,
  );

  const selectedCsvData = useSelector((state) => state.files.selectedCsvData);

  useEffect(() => {
    setCSVData(selectedCsvData);
  }, [selectedCsvData]);

  //get the csv path
  const getCsvPath = (path) => {
    const csvPath = path.split('timg')[0] + 'ome_300.csv';

    readRemoteFile(csvPath, {
      complete: (results) => {
        setCSVData(results.data);
        store.dispatch({
          type: 'set_selected_csv_data',
          content: results.data,
        });
      },
      error: (err) => {
        store.dispatch({
          type: 'set_selected_csv_data',
          content: null,
        });
      },
    });
  };

  //When the csvData is loaded
  useEffect(() => {
    if (csvData == [] || csvData == null) {
      return;
    }
    const headerData = csvData[0];
    if (headerData === undefined) return;
    let headers = [];

    //"no" item  in the excel file  // in other words, the first column
    headers.push({
      field: 'col0',
      headerName: 'No',
    });

    headerData.map((item, index) => {
      if (item.includes(':')) {
        const index = Number(item.split(':')[0]) + 1;
        const temp = {
          field: 'col' + index,
          headerName: MeasureHeader[index],
        };
        headers.push(temp);
      }
    });
    setTableColumns(headers);

    let temp = csvData;
    const length = temp.length;
    let body = temp.slice(1);
    body.pop();
    const finalResult = [];

    body.map((rowData, index) => {
      const tempRow = {};
      rowData.map((item, index) => {
        tempRow['col' + index] = item;
      });
      tempRow['id'] = index;
      finalResult.push(tempRow);
    });

    setTableData(finalResult);
  }, [csvData]);

  const clearTable = () => {
    setTableData([]);
    setTableColumns([]);
  };

  // //when the props are changed, it means the image is changed
  // useEffect(() => {
  //   clearTable();
  //   console.log(selectedImageItemPath)
  //   if (selectedImageItemPath !== undefined && selectedImageItemPath !== null) {
  //     const csvPath = getCsvPath(selectedImageItemPath);
  //   } else {
  //     clearTable();
  //     store.dispatch({
  //       type: 'set_selected_csv_data',
  //       content: null,
  //     });
  //   }
  // }, [selectedImageItemPath]);

  return (
    <DataTable rows={tableData} columns={tableColumns} type={'VisualDisplay'} />
  );
};

export default VisualTable;
