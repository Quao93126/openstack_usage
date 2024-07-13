import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import { useFlagsStore } from '@/state';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRef } from 'react';
import { processDeconv2D } from '@/api/filter';
import store from '@/reducers';
import { ListSubheader, Slider } from '@mui/material';

const Dec2dDialog = (prop) => {
  const dialogFlag = useFlagsStore((store) => store.Dialog2Dflag);
  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const [ROISelectFlag, setROISelectFlag] = useState(false);

  useEffect(() => {
    if (
      imagePathForOrigin &&
      imagePathForOrigin !== null &&
      Array.isArray(imagePathForOrigin) === false
    ) {
      const serverUrl = imagePathForOrigin.split('image/download/?path=')[0];
      const filepath = imagePathForOrigin.split('image/download/?path=')[1];
      const url =
        serverUrl + 'static/' + filepath.split('.ome.tiff')[0] + '.timg';
      //setDisplayImageForCanvas(url);
    }
  }, [imagePathForOrigin]);

  const getOmeTiffUrl = (url) => {
    let tempUrl = url;
    const ext = url.split('.').pop();
    if (ext !== 'tiff' && ext !== 'tif') {
      const newExtension = 'ome.tiff';
      tempUrl = url.replace(/\.[^/.]+$/, `.${newExtension}`);
    }

    const serverUrl = imagePathForOrigin.split('image/download')[0];
    const path = tempUrl.split('static')[1];

    const newUrl = serverUrl + `image/download/?path=${path}`;

    return newUrl;
  };

  const [displayImageForCanvas, setDisplayImageForCanvas] = useState('');

  const close = () => {
    useFlagsStore.setState({ Dialog2Dflag: false });
  };

  const canvasElement = useRef(null);

  // Variables for modal dialog for ROI selection
  // Modal Dialog
  const [open, setOpen] = useState(false);

  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(100);
  const [endY, setEndY] = useState(100);

  const [effectiveness, setEffectiveness] = useState(5);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const handleReset = () => {
    if (
      displayImageForCanvas &&
      displayImageForCanvas !== null &&
      displayImageForCanvas !== ''
    ) {
      displayImage(displayImageForCanvas);
    }
  };

  const handleWholeROISet = () => {
    setStartX(0);
    setStartY(0);
    setEndX(100);
    setEndY(100);

    drawImageWithColor('red');
  };

  useEffect(() => {
    handleROISet('blue');
  }, [startX, startY, endX, endY]);

  const displayImage = (path) => {
    // Get the canvas and image elements
    const canvas = document.getElementById('canvas');
    const img = document.createElement('img');

    if (!canvas) return;
    const context = canvas.getContext('2d');

    img.src = displayImageForCanvas;

    let st_x = 0;
    let st_y = 0;
    let en_x = 0;
    let en_y = 0;

    // Set the canvas width and height to match the image
    img.onload = function () {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;

      // Draw the image on the canvas

      context.drawImage(img, 0, 0, img.width * 2, img.height * 2);
      let drawing = false;

      function startDrawing(e) {
        drawing = true;
        context.beginPath();
      }

      canvas.addEventListener('mousedown', startDrawing);

      function endDrawing(e) {
        drawing = false;
      }

      canvas.addEventListener('mouseup', endDrawing);

      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect(),
          scaleX = canvas.width / rect.width,
          scaleY = canvas.height / rect.height;

        return {
          x: (evt.clientX - rect.left) * scaleX,
          y: (evt.clientY - rect.top) * scaleY,
        };
      }

      function draw(e) {
        if (!drawing) return;

        let { x, y } = getMousePos(canvas, e);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, img.width * 2, img.height * 2);
        context.strokeStyle = 'blue';
        context.strokeRect(start.x, start.y, x - start.x, y - start.y);
      }

      canvas.addEventListener('mousemove', draw);

      function startDrawing(e) {
        drawing = true;
        context.beginPath();
        draw(e);
      }

      context.lineWidth = 1;

      let start = {};

      function startRect(e) {
        start = getMousePos(canvas, e);
      }

      window.addEventListener('mousedown', startRect);

      function endRect(e) {
        let { x, y } = getMousePos(canvas, e);

        // Clear the canvas and redraw the image
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, img.width * 2, img.height * 2);

        st_x = Math.floor((start.x * 100) / canvas.width);
        st_y = Math.floor((start.y * 100) / canvas.height);
        en_x = Math.ceil((x * 100) / canvas.width);
        en_y = Math.ceil((y * 100) / canvas.height);

        if (x - start.x > 0 && y - start.y > 0) {
          // startX = st_x;
          // startY = st_y;
          // endX = en_x;
          // endY = en_y;

          setStartX(st_x);
          setStartY(st_y);
          setEndX(en_x);
          setEndY(en_y);

          context.strokeStyle = 'blue';
          context.strokeRect(start.x, start.y, x - start.x, y - start.y);
        }
      }
      window.addEventListener('mouseup', endRect);
    };
  };

  const handleROISet = () => {
    drawImageWithColor('red');
  };

  useEffect(() => {
    if (
      displayImageForCanvas &&
      displayImageForCanvas !== null &&
      displayImageForCanvas !== ''
    )
      displayImage(displayImageForCanvas);
  }, [displayImageForCanvas]);

  const drawImageWithColor = (color) => {
    if (
      displayImageForCanvas &&
      displayImageForCanvas !== null &&
      displayImageForCanvas !== ''
    ) {
      // Get the canvas and image elements
      const canvas = document.getElementById('canvas');
      const img = document.createElement('img');

      if (!canvas) return;
      const context = canvas.getContext('2d');
      img.src = displayImageForCanvas;

      context.lineWidth = 1;

      // Set the canvas width and height to match the image
      img.onload = function () {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;

        // Draw the image on the canvas
        context.drawImage(img, 0, 0, img.width * 2, img.height * 2);

        context.strokeStyle = color;

        const st_x = (startX * canvas.width) / 100;
        const st_y = (startY * canvas.height) / 100;
        const en_x = ((endX - startX) * canvas.width) / 100;
        const en_y = ((endY - startY) * canvas.height) / 100;

        context.strokeRect(
          (startX * canvas.width) / 100,
          (startY * canvas.height) / 100,
          ((endX - startX) * canvas.width) / 100,
          ((endY - startY) * canvas.height) / 100,
        );
      };
    }
  };

  const handleDeconv = async () => {
    const filepath = imagePathForOrigin.split('image/download/?path=')[1];
    const dictRoiPts = {
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
    };
    const isroi = true;
    const efftive_value = prop.effectiveness || 5;

    const params = {
      dictRoiPts: dictRoiPts,
      filename: filepath,
      isroi: isroi,
      effectiveness: efftive_value,
    };

    const output = await processDeconv2D(params);
    const imagePathForAvivator = getOmeTiffUrl(output);

    store.dispatch({
      type: 'set_image_path_for_avivator',
      content: imagePathForAvivator,
    });

    store.dispatch({
      type: 'set_image_path_for_result',
      content: imagePathForAvivator,
    });

    close();
  };

  function PaperComponent(props) {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
  }

  const onButtonROISelected = () => {
    setROISelectFlag(!ROISelectFlag);
  };

  return (
    <>
      <Dialog
        open={dialogFlag}
        onClose={close}
        maxWidth={'500'}
        PaperComponent={PaperComponent}
        hideBackdrop={true}
        onBackdropClick="false"
        disableScrollLock
        aria-labelledby="draggable-dialog-title"
      >
        <div className="d-flex border-bottom">
          <DialogTitle>2D Deconvolution</DialogTitle>
          <button className="dialog-close-btn" color="primary" onClick={close}>
            &times;
          </button>
        </div>
        {/* <div
          className="d-flex mx-auto my-2"
          style={{
            width: 470,
            display: '`flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Col>
            <div
              style={{
                width: 430,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '3px',
              }}
            >
              <h3 style={{ fontFamily: 'monospace' }}>Selected ROI</h3>
            </div>

            <div
              style={{
                width: 430,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <canvas
                id="canvas"
                style={{
                  width: 430,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '3px',
                }}
              ></canvas>
              <hr />
            </div>
            <div
              style={{
                width: 430,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '3px',
              }}
            >
              <Button
                className=""
                variant="contained"
                color="success"
                size="small"
                onClick={handleROISet}
              >
                Set
              </Button>
              <Button
                className=""
                variant="contained"
                color="primary"
                size="small"
                onClick={handleWholeROISet}
              >
                Set All
              </Button>
              <Button
                className=""
                variant="contained"
                color="warning"
                size="small"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div> */}

        <div
          style={{
            width: 430,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '3px',
          }}
        >
          <Col className="pa-0 ml-10">
            <Row>
              <Button onClick={onButtonROISelected}>ROI</Button>
            </Row>
            <ListSubheader>Effectiveness</ListSubheader>
            <Row style={{ margin: 2, padding: 2 }}>
              <Slider
                type=" slider"
                id="slider"
                value={effectiveness}
                min={0}
                max={100}
                onChange={(e, newValue) => {
                  setEffectiveness(newValue);
                }}
              />
            </Row>

            <hr />
            {/* <Row>
              <Button
                className=""
                variant="contained"
                color="primary"
                size="small"
              >
                Set
              </Button>
            </Row> */}
          </Col>
        </div>
        {/* </Col>
        </div> */}

        <div className="border-top mt-2">
          <DialogActions>
            <Button
              className=""
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleDeconv}
            >
              Action
            </Button>
            <Button
              className=""
              variant="contained"
              color="error"
              size="medium"
              onClick={close}
            >
              Cancel
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </>
  );
};
export default Dec2dDialog;
