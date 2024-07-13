const DEFAULT_CHANNEL_DATA = [
  {
    id: 0,
    label: 'white',
    symbol: 'S',
    rgb: [255, 255, 255],
    disabled: false,
    visible: false,
    cssColor: 'gray',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
  {
    id: 1,
    symbol: 'B',
    label: 'blue',
    rgb: [0, 0, 255],
    disabled: false,
    visible: false,
    cssColor: 'rgb(0,0,255)',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
  {
    id: 2,
    symbol: 'G',
    label: 'green',
    rgb: [0, 255, 0],
    disabled: false,
    visible: false,
    cssColor: 'rgb(0,255,0)',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
  {
    id: 3,
    symbol: 'R',
    label: 'red',
    rgb: [255, 0, 0],
    disabled: false,
    visible: false,
    cssColor: 'rgb(255,0,0)',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
  {
    id: 4,
    symbol: 'C',
    label: 'cyan',
    rgb: [0, 255, 255],
    disabled: false,
    visible: false,
    cssColor: 'rgb(0,255,255)',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
  {
    id: 5,
    symbol: 'Y',
    label: 'yellow',
    rgb: [255, 255, 0],
    disabled: false,
    visible: false,
    cssColor: 'rgb(255,255,0)',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
  {
    id: 6,
    symbol: 'M',
    label: 'magenta',
    rgb: [255, 0, 255],
    disabled: false,
    visible: false,
    cssColor: 'rgb(255,0,255)',
    // image_adjust: {
    //   brightness: 0,
    //   contrast: 0,
    //   gamma: 50,
    // }
  },
];

const DEFAULT_PARAMS = {
  anaylsis_method: '',
  learning_method: '',
  object_method: '',
  method_info: '',
  showMLPopup: false,
  showMeasureItemPopup: false,
  showICTMethodDialog: false,
  showDynamicMouseMethodDialog: false,
  showMfiberMethodDialog: false,
  showMridgeMethodDialog: false,
  showTissueHPMethodDialog: false,
  showLabelFreeDialog: false,
  showLabelFreeSelectDialog: false,
  showSortAreaDialog: false,
  showCellPoseDialog: false,
  showAllocationCallDialog: false,
  showCellPaintingV3Dialog: false,
  showCellPaintingV3SelectDialog: false,
  showConfluencyMethodDialog: false,
  showMLPopUPDialog: false,
  // view Data
  vessel_data: {
    id: 1,
    type: 'Slide',
    count: 1,
    title: 'Single',
    area_percentage: 30,
  },
  objective_data: { id: -1, rate: 'N/A' },
  channel_data: [], //DEFAULT_CHANNEL_DATA,
  image_adjust_data: {
    brightness: [0, 0, 0, 0, 0, 0, 0],
    contrast: [0, 0, 0, 0, 0, 0, 0],
    gamma: [50, 50, 50, 50, 50, 50, 50],
  },
  zposition: { z: 0, c: 0, t: 0 },
  timeline: null,
  class_setting_data: [],
  ml_measure_params: {},
  csvData: [],
  ml_measure_data: [],
  measure_filters: [],
  labelFreeSegmentResultDirPath: '',
};

const initState = {
  ...DEFAULT_PARAMS,
};

const measure = (state = initState, action) => {
  switch (action.type) {
    case 'SET_MEASURE_DATA':
      return {
        ...state,
        ...action.payload,
      };
    case 'UPDATE_MEASURE_VESSEL_DATA':
      return {
        ...state,
        vessel_data: {
          ...state.vessel_data,
          ...action.payload,
        },
      };
    case 'UPDATE_MEASURE_OBJECTIVE_DATA':
      return {
        ...state,
        objective_data: action.payload,
        // vessel_data: {
        //     ...state.objective_data,
        //     ...action.payload,
        // }
      };
    case 'UPDATE_MEASURE_CHANNEL_DATA':
      return {
        ...state,
        channel_data: action.payload,
      };
    case 'UPDATE_MEASURE_IMAGE_ADJUST_DATA':
      return {
        ...state,
        image_adjust_data: {
          ...state.image_adjust_data,
          ...action.payload,
        },
      };
    case 'UPDATE_MEASURE_ZPOSITION':
      return {
        ...state,
        zposition: {
          ...state.zposition,
          ...action.payload,
        },
      };
    case 'ADD_MEASURE_CLASS_SETTING':
      let _added_class_setting_data = [
        ...state.class_setting_data,
        action.payload,
      ];
      return {
        ...state,
        class_setting_data: _added_class_setting_data,
      };
    case 'SET_MEASURE_CLASS_SETTING':
      return {
        ...state,
        class_setting_data: action.payload,
      };
    case 'SET_MEASURE_CSV_DATA':
      return {
        ...state,
        csvData: action.payload,
      };
    case 'SET_ML_MEASURE_DATA':
      return {
        ...state,
        ml_measure_data: action.payload,
      };
    case 'DELETE_MEASURE_CLASS_SETTING':
      let _deleted_class_setting_data = state.class_setting_data.filter(
        (it) => it.className !== action.payload.className,
      );
      return {
        ...state,
        class_setting_data: _deleted_class_setting_data,
      };
    case 'UPDATE_ML_POPUP_STATUS':
      return {
        ...state,
        showMLPopup: action.payload,
      };
    case 'UPDATE_MEASURE_ITEM_POPUP_STATUS':
      return {
        ...state,
        showMeasureItemPopup: action.payload,
      };
    case 'UPDATE_ICT_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showICTMethodDialog: action.payload,
      };
    case 'UPDATE_DYNAMIC_MOUSE_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showDynamicMouseMethodDialog: action.payload,
      };
    case 'UPDATE_MFIBER_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showMfiberMethodDialog: action.payload,
      };
    case 'UPDATE_MRIDGE_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showMridgeMethodDialog: action.payload,
      };
    case 'UPDATE_TISSUE_HP_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showTissueHPMethodDialog: action.payload,
      };

    case 'UPDATE_LABEL_FREE_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showLabelFreeDialog: action.payload,
      };

    case 'UPDATE_LABEL_FREE_METHOD_SELECT_DIALOG_STATUS':
      return {
        ...state,
        showLabelFreeSelectDialog: action.payload,
      };

    case 'SET_LABEL_FREE_SEGMENT_RESULT_DIR_PATH':
      return {
        ...state,
        labelFreeSegmentResultDirPath: action.payload,
      };

    case 'UPDATE_SORT_AREA_DIALOG_STATUS':
      return {
        ...state,
        showSortAreaDialog: action.payload,
      };
    case 'UPDATE_CELL_POSE_DIALOG_STATUS':
      return {
        ...state,
        showCellPoseDialog: action.payload,
      };
    case 'UPDATE_ML_MEASURE_PARAMS':
      return {
        ...state,
        ml_measure_params: action.payload,
      };
    case 'UPDATE_MEASURE_FILTERS':
      return {
        ...state,
        measure_filters: action.payload,
      };
    case 'UPDATE_ALLOCATION_CALL_DIALOG_POPUP_STATUS':
      return {
        ...state,
        showAllocationCallDialog: action.payload,
      };

    case 'UPDATE_CELL_PAINTING_V3_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showCellPaintingV3Dialog: action.payload,
      };
    case 'UPDATE_CELL_PAINTING_V3_SELECT_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showCellPaintingV3SelectDialog: action.payload,
      };

    case 'UPDATE_CONFLUENCY_METHOD_DIALOG_STATUS':
      return {
        ...state,
        showConfluencyMethodDialog: action.payload,
      };

    case 'UPDATE_ML_POPUP_DIALOG_STATUS':
      return {
        ...state,
        showMLPopUPDialog: action.payload,
      };

    default:
      return state;
  }
};

export default measure;
