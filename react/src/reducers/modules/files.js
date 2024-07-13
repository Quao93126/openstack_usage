import { DEFAULT_CHANNEL_PATTERNS } from '@/components/tabsLeft/contents/file/PositionDialog/tabs/constants';

const DEFAULT_PARAMS = {
  isFilesAvailable: false,
  isContentAvailable: false,
  filesName: null,
  filesPath: null,
  filesChosen: null,
  isFilesChosenAvailable: false,
  content: null,
  isImageLoading: false,
  experimentName: null,
  selectedImage: null,
  imagePathForAvivator: null,
  imagePathForTree: [],
  imagePathForResult: null,
  imagePathForCountResult: null,
  imagePathForOrigin: null,
  csvPathForResult: null,
  selectedFilesForDropZone: '',
  hdf5FilePath: null,
  selectedVisualItem: null,
  selectedThumbnailPathForVisual: null,
  selectedCsvData: null,
  measureResultZipPath: null,
  is3DView: false,
  channelPattern: DEFAULT_CHANNEL_PATTERNS,
  tilingMergedImageFlag: false,
  reportTabHoleSelectedFlag: false,
  reportSelectdedChannel: 'Overlay',
  isVideoFile: false,
  videoCurrentTime: 0,
  videoTimeDuration: 1,
};

const initState = {
  ...DEFAULT_PARAMS,
};

//action redux
const files = (state = initState, action) => {
  switch (action.type) {
    case 'Select_Image':
      state.selectedImage = action.payload;
      break;
    case 'Cancel_Image':
      state.selectedImage = null;
      break;
    case 'content_addContent':
      state.content = action.content;
      state.isContentAvailable = true;
      state.isImageLoading = true;
      break;
    case 'files_addFiles':
      state.filesName = action.content.filesName;
      state.filesPath = action.content.filesPath;
      state.isFilesAvailable = true;
      break;
    case 'files_removeAllFiles':
      state.files = null;
      state.isFilesAvailable = false;
      break;
    case 'image_loading_state_change':
      state.isImageLoading = action.content;
      break;
    case 'register_experiment_name':
      state.experimentName = action.content;
      break;
    case 'set_image_path_for_avivator':
      state.imagePathForAvivator = action.content;
      break;
    case 'set_image_path_for_result':
      state.imagePathForResult = action.content;
      break;
    case 'set_image_path_for_count_result':
      state.imagePathForCountResult = action.content;
      break;
    case 'set_csv_path_for_result':
      state.csvPathForResult = action.content;
      break;
    case 'set_image_path_for_origin':
      state.imagePathForOrigin = action.content;
      break;
    case 'set_measure_result_zip_path':
      state.measureResultZipPath = action.content;
      break;
    case 'set_image_path_for_tree':
      state.imagePathForTree = action.content;
      break;
    case 'set_selected_files_for_dropzone':
      state.selectedFilesForDropZone = action.content;
      break;
    case 'set_hdf5_file_path':
      state.hdf5FilePath = action.content;
      break;
    case 'set_measurementitem_for_visual':
      state.selectedVisualItem = action.content;
      break;
    case 'set_selected_image_for_visual':
      state.selectedThumbnailPathForVisual = action.content;
      break;
    case 'set_selected_csv_data':
      state.selectedCsvData = action.content;
      break;
    case 'set_report_tab_hole_selected_flag':
      state.reportTabHoleSelectedFlag = action.content;
      break;
    case 'set_selected_channel_in_report':
      state.reportSelectdedChannel = action.content;
      break;
    case 'set_3D_view_state':
      state.is3DView = action.content;
      break;
    case 'set_channel_patterns':
      state.channelPattern = action.content;
      break;
    case 'set_tiling_merged_image':
      state.tilingMergedImageFlag = action.payload;
    case 'set_videofile_check':
      state.isVideoFile = action.content;
    case 'set_video_time_duration':
      state.videoTimeDuration = action.payload;
    case 'set_video_current_time':
      state.videoCurrentTime = action.payload;
    default:
      break;
  }
  return { ...state };
};

export default files;
