import * as React from 'react';

import { Row, Col } from 'react-bootstrap';
import Button from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import { useFlagsStore } from '@/state';
import SimpleDialog from '@/components/custom/SimpleDialog';
import { Divider } from 'semantic-ui-react';
import { useState } from 'react';
import { Typography } from '@mui/material';

const SuperDialog = () => {
  const Superflag = useFlagsStore((store) => store.Superflag);

  const [effectivenessValue, setEffectivenessValue] = useState(20);
  const [infoMessage, setInfoMessage] = useState('');

  const close = () => {
    useFlagsStore.setState({ Superflag: false });
    // console.log('flag Status--->' + Superflag);
  };

  const selectFluorescence = () => {
    setInfoMessage('Fluorescence option was selected.');
  };

  const setBrightField = () => {
    setInfoMessage('BrightField option was selected.');
  };

  const selectROI = () => {
    // console.log('selectROI');
    setInfoMessage('ROI was selected');
  };

  const handleCancel = () => {
    close();
  };

  const handleAction = () => {
    setInfoMessage('The Super resolution is processing now..');
    close();
  };

  return (
    <>
      <SimpleDialog
        title="Super Resolution"
        singleButton={false}
        okTitle="Action"
        closeTitle="Cancel"
        // // select="action"
        // close="visibleDialog = false"
        click={close}
      >
        <div fluid={true} className="d-flex justify-space-between mx-3">
          <Row noGutters className="d-flex justify-center align-center pa-0">
            <Col xs={8} className="pa-0">
              <Stack spacing={2} padding={2}>
                <Button
                  fullWidth
                  className="mr-2 text-capitalize"
                  variant="contained"
                  color="info"
                  onClick={setBrightField}
                >
                  Bright Field
                </Button>
                <Button
                  fullWidth
                  className="mr-2 mt-2 text-capitalize"
                  variant="contained"
                  color="info"
                  onClick={selectFluorescence}
                >
                  fluorescence
                </Button>
              </Stack>
            </Col>
            <Col xs={4} className="d-flex justify-center align-center pa-1">
              <Stack spacing={2} />
              <Button variant="contained" color="info" onClick={selectROI}>
                ROI
              </Button>
            </Col>
          </Row>
          <Row noGutters className="pa-0">
            <div
              style={{
                alignItems: 'center',
                alignContent: 'center',
                textAlign: 'center',
              }}
            >
              <ListSubheader>Effectiveness</ListSubheader>
              <Slider
                size="small"
                value={effectivenessValue}
                onChange={(e) => setEffectivenessValue(Number(e.target.value))}
              />
              <h6>{effectivenessValue}</h6>
            </div>
          </Row>
        </div>
        <Divider />
        <hr />
        <Typography>{infoMessage}</Typography>

        <Row>
          <Col xs={7}></Col>
          <Col xs={2}>
            <Button color="primary" onClick={handleAction}>
              Action
            </Button>
          </Col>
          <Col xs={2}>
            <Button color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Col>
        </Row>
      </SimpleDialog>
    </>
  );
};
export default SuperDialog;
