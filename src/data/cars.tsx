import bmwMainImage from '@/assets/bmw-3-series-main.jpg';
import bmwInteriorImage from '@/assets/bmw-3-series-interior.jpg';
import teslaMainImage from '@/assets/tesla-model3-main.jpg';
import teslaInteriorImage from '@/assets/tesla-model3-interior.jpg';

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: '汽油' | '柴油' | '混合动力' | '电动';
  transmission: '手动' | '自动';
  color: string;
  images: string[];
  description: string;
  features: string[];
  status: '可用' | '已预订' | '已售出';
}

export const cars: Car[] = [
  {
    id: 1,
    brand: '大众',
    model: '高尔夫',
    year: 2019,
    price: 18950,
    mileage: 45000,
    fuel: '汽油',
    transmission: '手动',
    color: '黑色',
    images: [
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-010-xxxxxxxx94-0def2dda95b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    ],
    description: '这款大众高尔夫状况极佳。只有一个车主，可提供完整的保养记录。',
    features: ['空调', '定速巡航', '导航系统', '倒车雷达', '蓝牙'],
    status: '可用',
  },
  {
    id: 2,
    brand: '宝马',
    model: '3系',
    year: 2020,
    price: 32500,
    mileage: 30000,
    fuel: '柴油',
    transmission: '自动',
    color: '灰色',
    images: [
      bmwMainImage,
      bmwInteriorImage,
    ],
    description: '豪华宝马3系配备全套选装包。这辆车状况如新，里程数非常低。',
    features: ['真皮座椅', '自动空调', '专业导航', '自适应巡航控制', '电动座椅'],
    status: '可用',
  },
  {
    id: 3,
    brand: '特斯拉',
    model: 'Model 3',
    year: 2021,
    price: 43900,
    mileage: 15000,
    fuel: '电动',
    transmission: '自动',
    color: '白色',
    images: [
      teslaMainImage,
      teslaInteriorImage,
    ],
    description: '特斯拉Model 3长续航版配备Autopilot。这款电动车续航里程超过500公里。',
    features: ['自动驾驶', '15寸触屏', '优质音响', '加热方向盘和座椅', '空中软件更新'],
    status: '已预订',
  },
  {
    id: 4,
    brand: '丰田',
    model: '卡罗拉',
    year: 2018,
    price: 16500,
    mileage: 60000,
    fuel: '混合动力',
    transmission: '自动',
    color: '蓝色',
    images: [
      bmwMainImage,
      bmwInteriorImage,
    ],
    description: '经济的丰田卡罗拉混动版。这款可靠的汽车油耗低且非常舒适。',
    features: ['混合动力', '倒车摄像头', 'LED大灯', '自动空调', '车道辅助'],
    status: '可用',
  },
  {
    id: 5,
    brand: '奔驰',
    model: 'A级',
    year: 2020,
    price: 29750,
    mileage: 25000,
    fuel: '汽油',
    transmission: '自动',
    color: '银色',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    ],
    description: '时尚的奔驰A级轿车，配备豪华内饰和最新技术。',
    features: ['MBUX信息娱乐系统', '氛围照明', '无钥匙启动', '全景天窗', '前排座椅加热'],
    status: '可用',
  },
  {
    id: 6,
    brand: '奥迪',
    model: 'A4',
    year: 2019,
    price: 27500,
    mileage: 35000,
    fuel: '柴油',
    transmission: '自动',
    color: '黑色',
    images: [
      'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    ],
    description: '商务奥迪A4，运动外观和众多豪华配置。',
    features: ['MMI导航', '虚拟座舱', 'S-Line外观', 'LED照明', '泊车辅助增强版'],
    status: '已售出',
  },
];

export const brands = [...new Set(cars.map(car => car.brand))];
export const models = [...new Set(cars.map(car => car.model))];
export const fuels = [...new Set(cars.map(car => car.fuel))];
export const transmissions = [...new Set(cars.map(car => car.transmission))];
export const years = [...new Set(cars.map(car => car.year))].sort((a, b) => b - a);
export const statuses = [...new Set(cars.map(car => car.status))];