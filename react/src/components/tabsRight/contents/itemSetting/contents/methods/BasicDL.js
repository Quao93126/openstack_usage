import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { Box, Tab, TableContainer, Tabs } from '@mui/material';
import { TabContext } from '@mui/lab';
import { Image } from 'react-bootstrap';
import { imgArray } from './constant';

const BasicDL = () => {
  const [currentType, setCurrentType] = useState('Tissue');

  const [selectedMethod, setSelectedMethod] = useState('');

  const ImageBox = (props) => {
    return (
      <div
        className={
          selectedMethod !== props.methodName
            ? 'border method-img'
            : 'method-img-selected'
        }
        onClick={() => setSelectedMethod(props.methodName)}
      >
        <Image
          style={{ margin: '0 auto', width: '65px', height: '65px' }}
          src={imgArray[props.methodName]}
          alt="no image"
        />
      </div>
    );
  };

  const handleTypeChange = (e, value) => {
    setCurrentType(value);
  };

  return (
    <>
      <TabContext>
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs
            onChange={handleTypeChange}
            textColor="primary"
            indicatorColor="primary"
            value={currentType}
          >
            <Tab label="Tissue" value="Tissue" />
            <Tab label="Cell" value="Cell" />
            <Tab label="Material" value="Material" />
            <Tab label="Semicon" value="Semicon" />
          </Tabs>

          {currentType === 'Tissue' && (
            <TableContainer>
              <div className="p-3">
                <div style={{ width: '65px' }}>
                  <ImageBox methodName={'tissuenet'} />
                  <div className="label-text text-center">TissueNet</div>
                </div>
              </div>
            </TableContainer>
          )}

          {currentType === 'Cell' && (
            <TableContainer>
              <div className="p-3 img-container">
                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="nuclei" />
                  <div className="label-text text-center">Nuclei</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="cyto" />
                  <div className="label-text text-center">Cyto</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="livecell" />
                  <div className="label-text text-center">Livecell</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="cyto2" />
                  <div className="label-text text-center">Cyto2</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="CP" />
                  <div className="label-text text-center">CP</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="CPx" />
                  <div className="label-text text-center">CPx</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="TN1" />
                  <div className="label-text text-center">TN1</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="TN2" />
                  <div className="label-text text-center">TN2</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="TN3" />
                  <div className="label-text text-center">TN3</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="LC1" />
                  <div className="label-text text-center">LC1</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="LC2" />
                  <div className="label-text text-center">LC2</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="LC3" />
                  <div className="label-text text-center">LC3</div>
                </div>

                <div style={{ width: '65px' }} className="m-2">
                  <ImageBox methodName="LC4" />
                  <div className="label-text text-center">LC4</div>
                </div>
              </div>
            </TableContainer>
          )}
          {currentType === 'Material' && (
            <TableContainer>
              <div className="p-3">
                <div style={{ width: '65px' }}>
                  <ImageBox methodName="layer" />
                  <div className="label-text text-center">Layer</div>
                </div>
              </div>
            </TableContainer>
          )}

          {currentType === 'Semicon' && (
            <TableContainer>
              <div className="p-3">
                <div style={{ width: '65px' }}>
                  <ImageBox methodName="wafer" />
                  <div className="label-text text-center">Wafer</div>
                </div>
              </div>
            </TableContainer>
          )}
        </Box>
      </TabContext>
    </>
  );
};

export default BasicDL;
