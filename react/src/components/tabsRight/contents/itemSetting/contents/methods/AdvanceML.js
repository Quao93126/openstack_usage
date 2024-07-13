import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { Box, Tab, TableContainer, Tabs } from '@mui/material';
import { imgArray } from './constant';

import { Image } from 'react-bootstrap';

const AdvanceML = () => {
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
          <Tab label="Others" value="others" />
        </Tabs>

        {currentType === 'Tissue' && (
          <TableContainer>
            <div className="p-3">
              <div style={{ width: '65px' }}>
                <ImageBox methodName={'tissuenet'} />
                <div className="label-text text-center">TissueNt</div>
              </div>
            </div>
          </TableContainer>
        )}

        {currentType === 'Cell' && (
          <TableContainer>
            <div className="p-3 img-container">
              <div style={{ width: '65px' }} className="m-2">
                <ImageBox methodName="cyto" />
                <div className="label-text text-center">ICT</div>
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

        {currentType === 'others' && (
          <TableContainer>
            <div className="p-3">
              <div style={{ width: '65px' }}>
                <ImageBox methodName={'mouse'} />
                <div className="label-text text-center">
                  Mouse Dynamic Tracking
                </div>
              </div>
            </div>
          </TableContainer>
        )}
      </Box>
    </>
  );
};

export default AdvanceML;
