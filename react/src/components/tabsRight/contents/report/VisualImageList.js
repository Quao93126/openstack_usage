import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getImageList, getVesselType } from './utils';
import store from '@/reducers';
import { Typography } from 'antd';
import { getVideoSource } from '@/api/experiment';

const VisualImageList = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [displayImgList, setDisplayImgList] = useState([]);

  const currentmodelName = useSelector(
    (state) => state.experiment.current_model,
  );

  const holeSelectedFlag = useSelector(
    (state) => state.files.reportTabHoleSelectedFlag,
  );

  const selectedVesselHolesForVisual = useSelector(
    (state) => state.vessel.selectedHolesForVisual,
  );

  const imagePathForOrigin = useSelector(
    (state) => state.files.imagePathForOrigin,
  );

  const content = useSelector((state) => state.files.content);
  const mergedImageFlag = useSelector(
    (state) => state.files.tilingMergedImageFlag,
  );

  const isVideoFile = useSelector((state) => state.files.isVideoFile);
  const imagePathForAvivator = useSelector(
    (state) => state.files.imagePathForAvivator,
  );
  const [videoSource, setVideoSource] = useState('');

  const setVideoSourceForMouseTracking = async () => {
    let res = await getVideoSource(imagePathForAvivator);

    let resultImagePath =
      process.env.REACT_APP_BASE_API_URL + 'static/' + res.data.filepath;
    setVideoSource(resultImagePath);
  };

  useEffect(() => {
    if (isVideoFile) {
      setVideoSourceForMouseTracking();
    }
  }, [isVideoFile]);

  const setImageList = () => {
    if (content === null || content === undefined) {
      if (imagePathForOrigin !== undefined && imagePathForOrigin !== null) {
        const urlList = imagePathForOrigin.split('image/download/?path=');
        const url = urlList[0] + 'static/' + urlList[1];
        const tempList = url.split('/');

        let fileInfo = {
          filename: tempList[tempList.length - 1],
          thumbnail: url.replace('.ome.tiff', '.timg'),
        };
        setDisplayImgList([fileInfo]);
      } else {
        setDisplayImgList([]);
      }
      return;
    }

    //This is the case when loaded the tiling merged image
    if (mergedImageFlag) {
      if (imagePathForOrigin !== undefined && imagePathForOrigin !== null) {
        const urlList = imagePathForOrigin.split('image/download/?path=');
        const url = urlList[0] + 'static/' + urlList[1];
        const tempList = url.split('/');

        let fileInfo = {
          filename: tempList[tempList.length - 1],
          thumbnail: url.replace('.ome.tiff', '.timg'),
        };
        setDisplayImgList([fileInfo]);
      } else {
        setDisplayImgList([]);
      }
      return;
    }
    if (getVesselType(content) === 1) {
      setDisplayImgList(content);
      return;
    }

    let imageLists = [];

    selectedVesselHolesForVisual.map((item) => {
      const tempList = getImageList(content, item.row, item.col);
      tempList.map((t) => imageLists.push(t));
    });

    setDisplayImgList(imageLists);
    if (imageLists[0] !== undefined) {
      selectImg(new Event('click'), imageLists[0].thumbnail);
    }
  };

  // useEffect(() => {
  //   if (displayImgList != [] && displayImgList != null) {
  //     let imageList = displayImgList;
  //     if (holeSelectedFlag == false) {
  //       setImageList();
  //     } else {
  //       let thumb = imageList[0].thumbnail;
  //       let filenameList = thumb.split('/');
  //       let len = filenameList.length;
  //       let filename = filenameList[len - 2];
  //       let url = thumb.split(filename)[0];

  //       if ( selectedIndex == 0) {
  //         imageList[0].thumbnail = url + 'reportTabHoleSelectedThumbnail.timg';
  //         setDisplayImgList(imageList);
  //         setSelectedIndex(0);

  //         if (imageList[0] !== undefined) {
  //           selectImg(new Event('click'), imageList[0].thumbnail);
  //         }
  //       }
  //     }
  //   }
  // }, [holeSelectedFlag]);

  useEffect(() => {
    setImageList();
  }, [selectedVesselHolesForVisual, imagePathForOrigin]);

  const selectImg = (_event, item) => {
    setSelectedIndex(item);
    store.dispatch({ type: 'set_selected_image_for_visual', content: item });
  };

  return (
    <div className="mx-2 my-1 visual-main-panel-screen-sidebar">
      {isVideoFile === false &&
        displayImgList.map((item, index) => (
          <div className="visual-mainpanel-imgbox">
            <Typography
              style={{ textAlign: 'center', justifyContent: 'center' }}
            >
              {item.filename}
            </Typography>
            <img
              className={selectedIndex === item.thumbnail ? 'selected' : ''}
              key={index}
              alt={item.thumbnail}
              src={item.thumbnail}
              onClick={(event) => selectImg(event, item.thumbnail)}
            />
            <hr />
          </div>
        ))}
      {isVideoFile && (
        <video
          controls
          id="videoPlayer"
          style={{ width: '100%' }}
          src={videoSource}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VisualImageList;
