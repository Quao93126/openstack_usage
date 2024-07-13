export const PositionTabs = {
  images: 'images',
  tiling: 'tiling',
  metadata: 'metadata',
  naming: 'naming',
  groups: 'groups',
};

export const tilingMenus = [
  'Edit',
  'Alignment',
  'Bonding',
  'Shading',
  'Display',
  'Result',
  //'Option',
];

export const tilingAlignButtons = [
  'Cascade',
  'Height Decreasing',
  'Height Increasing',
  'By XYZ',
  'By Columns',
  'By Rows',
];

export const PositionTabLabels = {
  [PositionTabs.images]: 'Images',
  [PositionTabs.tiling]: 'Tiling',
  [PositionTabs.metadata]: 'Metadata',
  [PositionTabs.naming]: 'Name & Files',
};

export const TilingTabs = {
  alignment: 'aligment',
};

export const TilingTabLabels = {
  [TilingTabs.alignment]: 'Alignment',
};

export const Alignments = {
  raster: 'raster',
  snake: 'snake',
};

export const AlignmentLabels = {
  [Alignments.raster]: 'Raster',
  [Alignments.snake]: 'Snake',
};

export const Directions = {
  horizontal: 'horizontal',
  vertical: 'vertical',
};

export const SortOrder = {
  ascending: 'Ascending Order',
  descending: 'Descending Order',
};

export const DirectionLabels = {
  [Directions.horizontal]: 'Horizontal',
  [Directions.vertical]: 'Vertical',
};

export const METADATA_COLUMNS = [
  { field: 'id', headerName: 'ID', width: 40 },
  {
    field: 'Name',
    headerName: 'Name',
    width: 5,
  },
  {
    field: 'DimensionOrder',
    headerName: 'DimensionOrder',
    width: 100,
  },
  {
    field: 'SizeX',
    headerName: 'SizeX',
    width: 80,
  },
  {
    field: 'SizeY',
    headerName: 'SizeY',
    width: 80,
  },
  {
    field: 'SizeZ',
    headerName: 'SizeZ',
    width: 80,
  },
  {
    field: 'SizeC',
    headerName: 'SizeC',
    width: 80,
  },
  {
    field: 'SizeT',
    headerName: 'SizeT',
    width: 80,
  },
  {
    field: 'Type',
    headerName: 'Type',
    width: 80,
  },
];

export const DEFAULT_NAME_PATTERNS = [
  {
    label: 'Series',
    text: '',
    start: 0,
    end: 0,
    color: '#4caf50',
    field: 'series',
  },
  {
    label: 'Row',
    text: '',
    start: 0,
    end: 0,
    color: '#1976d2',
    field: 'row',
  },
  {
    label: 'Column',
    text: '',
    start: 0,
    end: 0,
    color: '#ff5722',
    field: 'col',
  },
  {
    label: 'Field',
    text: '',
    start: 0,
    end: 0,
    color: '#fb8c00',
    field: 'field',
  },
  {
    label: 'Channel',
    text: '',
    start: 0,
    end: 0,
    color: '#9c27b0',
    field: 'channel',
  },
  {
    label: 'Z-Index',
    text: '',
    start: 0,
    end: 0,
    color: '#607d8b',
    field: 'z',
  },
  {
    label: 'Time',
    text: '',
    start: 0,
    end: 0,
    color: '#ff5252',
    field: 'time',
  },
  {
    label: 'Objective',
    text: '',
    start: 0,
    end: 0,
    color: '#1872fb',
    field: 'objective',
  },
];

export const DEFAULT_CHANNEL_PATTERNS = [
  {
    label: 'S',
    text: 'CH3',
    //text: '',
    color: '#888888',
    field: 'S',
  },
  {
    label: 'B',
    text: 'CH4',
    //text: '',
    color: '#0000FF',
    field: 'B',
  },
  {
    label: 'G',
    text: 'CH2',
    //text: '',
    color: '#00FF00',
    field: 'G',
  },
  {
    label: 'R',
    text: 'CH1',
    //text: '',
    color: '#FF0000',
    field: 'R',
  },
  {
    label: 'C',
    text: '',
    color: '#00FFFF',
    field: 'C',
  },

  {
    label: 'Y',
    text: '',
    color: '#FFFF00',
    field: 'Y',
  },

  {
    label: 'M',
    text: '',
    color: '#FF00FF',
    field: 'M',
  },
  {
    label: 'Overlay',
    text: 'Overlay',
    //text: '',
    color: '#FFFFFF',
    field: 'Overlay',
  },
];

export const NAME_PATTERN_ORDER = [
  'id',
  'filename',
  'series',
  'time',
  'z',
  'row',
  'col',
  'field',
  'channel',
  'objective',
];

export const CHANNELS_INDEX = {
  S: 0,
  B: 1,
  G: 2,
  R: 3,
  C: 4,
  Y: 5,
  M: 6,
  Overlay: 7,
};

export const NAME_TABLE_COLUMNS = [
  { headerName: 'No', field: 'id', width: 40 },
  { headerName: 'File Name', field: 'filename', width: 250 },
  { headerName: 'Series', field: 'series', width: 60 },
  { headerName: 'Row', field: 'row', width: 60 },
  { headerName: 'Col', field: 'col', width: 60 },
  { headerName: 'Field', field: 'field', width: 60 },
  { headerName: 'C', field: 'channel', width: 60 },
  { headerName: 'Z', field: 'z', width: 60 },
  { headerName: 'T', field: 'time', width: 60 },
  { headerName: 'Objective', field: 'objective', width: 60 },
];

export const NAME_TILING_OPTIONS = [
  { id: 0, name: 'Edit' },
  { id: 1, name: 'Alignment' },
  { id: 2, name: 'Bonding' },
  { id: 3, name: 'Shading' },
  { id: 4, name: 'Display' },
  { id: 5, name: 'Option' },
  { id: 6, name: 'Result' },
];

export const NAME_BONDING_OPTIONS = ['None', 'Snap To Edge', 'Pattern Match'];
