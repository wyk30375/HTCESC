// 车辆相关枚举类型的中文映射

import type { VehicleType, TransmissionType, DriveType, FuelType, EmissionStandard } from './types';

// 车辆类型映射
export const VEHICLE_TYPE_MAP: Record<VehicleType, string> = {
  sedan: '轿车',
  suv: 'SUV',
  mpv: 'MPV',
  coupe: '跑车',
  hatchback: '两厢车',
  pickup: '皮卡',
  van: '面包车',
  sports: '运动型'
};

// 变速箱类型映射
export const TRANSMISSION_TYPE_MAP: Record<TransmissionType, string> = {
  manual: '手动',
  automatic: '自动',
  cvt: 'CVT无级变速',
  dct: '双离合',
  amt: 'AMT机械自动'
};

// 驱动方式映射
export const DRIVE_TYPE_MAP: Record<DriveType, string> = {
  fwd: '前驱',
  rwd: '后驱',
  awd: '全时四驱',
  '4wd': '分时四驱'
};

// 燃料类型映射
export const FUEL_TYPE_MAP: Record<FuelType, string> = {
  gasoline: '汽油',
  diesel: '柴油',
  electric: '纯电动',
  hybrid: '混合动力',
  phev: '插电混动'
};

// 排放标准映射
export const EMISSION_STANDARD_MAP: Record<EmissionStandard, string> = {
  national_3: '国三',
  national_4: '国四',
  national_5: '国五',
  national_6a: '国六A',
  national_6b: '国六B'
};

// 车辆类型选项
export const VEHICLE_TYPE_OPTIONS = Object.entries(VEHICLE_TYPE_MAP).map(([value, label]) => ({
  value: value as VehicleType,
  label
}));

// 变速箱类型选项
export const TRANSMISSION_TYPE_OPTIONS = Object.entries(TRANSMISSION_TYPE_MAP).map(([value, label]) => ({
  value: value as TransmissionType,
  label
}));

// 驱动方式选项
export const DRIVE_TYPE_OPTIONS = Object.entries(DRIVE_TYPE_MAP).map(([value, label]) => ({
  value: value as DriveType,
  label
}));

// 燃料类型选项
export const FUEL_TYPE_OPTIONS = Object.entries(FUEL_TYPE_MAP).map(([value, label]) => ({
  value: value as FuelType,
  label
}));

// 排放标准选项
export const EMISSION_STANDARD_OPTIONS = Object.entries(EMISSION_STANDARD_MAP).map(([value, label]) => ({
  value: value as EmissionStandard,
  label
}));

// 座位数选项
export const SEATS_OPTIONS = [
  { value: 2, label: '2座' },
  { value: 4, label: '4座' },
  { value: 5, label: '5座' },
  { value: 6, label: '6座' },
  { value: 7, label: '7座' },
  { value: 8, label: '8座' },
  { value: 9, label: '9座' }
];

// 常见车身颜色选项
export const EXTERIOR_COLOR_OPTIONS = [
  { value: '白色', label: '白色' },
  { value: '黑色', label: '黑色' },
  { value: '银色', label: '银色' },
  { value: '灰色', label: '灰色' },
  { value: '红色', label: '红色' },
  { value: '蓝色', label: '蓝色' },
  { value: '金色', label: '金色' },
  { value: '棕色', label: '棕色' },
  { value: '绿色', label: '绿色' },
  { value: '黄色', label: '黄色' },
  { value: '橙色', label: '橙色' },
  { value: '紫色', label: '紫色' },
  { value: '其他', label: '其他' }
];

// 常见内饰颜色选项
export const INTERIOR_COLOR_OPTIONS = [
  { value: '黑色', label: '黑色' },
  { value: '米色', label: '米色' },
  { value: '棕色', label: '棕色' },
  { value: '灰色', label: '灰色' },
  { value: '红色', label: '红色' },
  { value: '白色', label: '白色' },
  { value: '其他', label: '其他' }
];
