import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Car, 
  Building2, 
  Search, 
  Filter,
  Calendar,
  Gauge,
  Phone,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  X,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle, Dealership } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/db/supabase';
import {
  VEHICLE_TYPE_MAP,
  TRANSMISSION_TYPE_MAP,
  DRIVE_TYPE_MAP,
  FUEL_TYPE_MAP,
  EMISSION_STANDARD_MAP
} from '@/types/vehicleEnums';

const ITEMS_PER_PAGE = 24; // 每页显示24辆车

export default function VehicleList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [vehicleDetailOpen, setVehicleDetailOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<(Vehicle & { dealership?: Dealership }) | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  
  // 车辆和车行数据
  const [vehicles, setVehicles] = useState<(Vehicle & { dealership?: Dealership })[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // 分享者信息（从URL参数获取）
  const sharerId = searchParams.get('sharer_id');
  const sharedDealershipId = searchParams.get('dealership_id'); // 分享链接指定的车行ID
  const [sharerInfo, setSharerInfo] = useState<{ name: string; phone: string } | null>(null);
  const [sharedDealership, setSharedDealership] = useState<Dealership | null>(null); // 分享链接对应的车行信息
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get('page') || '1'));
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    loadDealerships();
    if (sharerId) {
      loadSharerInfo(sharerId);
    }
    if (sharedDealershipId) {
      console.log('🔍 分享链接模式，车行ID:', sharedDealershipId);
      loadSharedDealership(sharedDealershipId);
    } else {
      console.log('📋 普通浏览模式');
    }
  }, []);

  const loadSharedDealership = async (dealershipId: string) => {
    try {
      const { data, error } = await supabase
        .from('dealerships')
        .select('*')
        .eq('id', dealershipId)
        .single();

      if (error) throw error;
      if (data) {
        setSharedDealership(data);
      }
    } catch (error) {
      console.error('加载车行信息失败:', error);
    }
  };

  const loadSharerInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setSharerInfo({
          name: data.username || '',
          phone: data.phone || '',
        });
      }
    } catch (error) {
      console.error('加载分享者信息失败:', error);
    }
  };

  useEffect(() => {
    loadVehicles();
    // 更新URL参数
    const params: Record<string, string> = {};
    if (currentPage > 1) params.page = currentPage.toString();
    if (selectedCity !== 'all') params.city = selectedCity;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  }, [currentPage, selectedCity, searchQuery]);

  const loadDealerships = async () => {
    try {
      const { data, error } = await supabase
        .from('dealerships')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDealerships(data || []);
      
      // 提取地级市列表
      const citySet = new Set<string>();
      data?.forEach(d => {
        if (d.city) citySet.add(d.city);
      });
      setCities(Array.from(citySet).sort());
    } catch (error) {
      console.error('加载车行失败:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      
      // 构建查询
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          dealership:dealerships(*)
        `, { count: 'exact' })
        .eq('status', 'in_stock');

      // 如果是通过分享链接访问，只显示指定车行的车辆
      if (sharedDealershipId) {
        query = query.eq('dealership_id', sharedDealershipId);
      } else {
        // 地区筛选（仅在非分享链接模式下生效）
        if (selectedCity !== 'all') {
          // 先获取该地区的所有车行ID
          const cityDealerships = dealerships.filter(d => d.city === selectedCity);
          const dealershipIds = cityDealerships.map(d => d.id);
          if (dealershipIds.length > 0) {
            query = query.in('dealership_id', dealershipIds);
          } else {
            // 如果没有该地区的车行，返回空结果
            setVehicles([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
        }
      }

      // 搜索筛选
      if (searchQuery) {
        query = query.or(`brand.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,plate_number.ilike.%${searchQuery}%`);
      }

      // 分页
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setVehicles(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('加载车辆失败:', error);
      toast.error('加载车辆失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理地区筛选
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理翻页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 打开车辆详情
  const openVehicleDetail = (vehicle: Vehicle & { dealership?: Dealership }) => {
    setSelectedVehicle(vehicle);
    setVehicleDetailOpen(true);
  };

  // 打开图片查看器
  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  // 图片导航
  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedVehicle?.photos) return;
    const totalImages = selectedVehicle.photos.length;
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    } else {
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // 分享链接模式：返回平台公共主页
                // 普通浏览模式：返回车行内部 Dashboard
                navigate(sharedDealershipId ? '/register' : '/');
              }}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">
                  {sharedDealership ? `${sharedDealership.name} 在售车辆` : '全部车辆'}
                </h1>
                <p className="text-xs text-muted-foreground">共 {totalCount} 辆在售</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container px-4 py-8">
        {/* 筛选栏 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索品牌、型号、车牌号..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* 地区筛选器（仅在非分享链接模式下显示） */}
          {!sharedDealershipId && (
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full md:w-64 justify-between"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left truncate">
                    {selectedCity === 'all' 
                      ? '全部地区' 
                      : cities.find((city) => city === selectedCity) || '全部地区'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="搜索地区..." />
                  <CommandList>
                    <CommandEmpty>未找到地区</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          handleCityChange('all');
                          setComboboxOpen(false);
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            selectedCity === 'all' ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        全部地区
                      </CommandItem>
                      {cities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            handleCityChange(currentValue);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedCity === city ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* 车辆列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg bg-muted" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">暂无车辆</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCity !== 'all' 
                ? '没有找到符合条件的车辆' 
                : '平台暂无在售车辆'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
                <Card 
                  key={vehicle.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => openVehicleDetail(vehicle)}
                >
                  {vehicle.photos && vehicle.photos.length > 0 && (
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={vehicle.photos[0]}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">
                        在售
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {vehicle.year}年
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {vehicle.mileage?.toLocaleString()}公里
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      {vehicle.selling_price 
                        ? `¥${vehicle.selling_price.toLocaleString()}` 
                        : '价格面议'}
                    </div>
                    {vehicle.condition_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vehicle.condition_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {vehicle.dealership?.name || '未知车行'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 优先使用分享者信息，其次使用车行设置的展示联系人，最后使用车行默认联系人
                          const displayPhone = sharerInfo?.phone || vehicle.dealership?.display_contact_phone || vehicle.dealership?.contact_phone;
                          const displayName = sharerInfo?.name || vehicle.dealership?.display_contact_name || vehicle.dealership?.contact_person;
                          
                          if (displayPhone && vehicle.dealership) {
                            toast.success(
                              <div className="space-y-1">
                                <div className="font-semibold">{vehicle.dealership.name}</div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{displayPhone}</span>
                                </div>
                                {displayName && (
                                  <div className="text-xs text-muted-foreground">
                                    联系人：{displayName}
                                  </div>
                                )}
                              </div>,
                              { duration: 5000 }
                            );
                          } else {
                            toast.error('暂无联系方式');
                          }
                        }}
                      >
                        <Phone className="h-3 w-3" />
                        联系
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 车辆详情对话框 */}
      <Dialog open={vehicleDetailOpen} onOpenChange={setVehicleDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedVehicle?.brand} {selectedVehicle?.model}
            </DialogTitle>
            <DialogDescription>
              车架号后六位：{selectedVehicle?.vin_last_six}
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6">
              {/* 图片展示 */}
              {selectedVehicle.photos && selectedVehicle.photos.length > 0 && (
                <div className="space-y-2">
                  <div 
                    className="relative h-96 bg-muted rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => openImageViewer(0)}
                  >
                    <img
                      src={selectedVehicle.photos[0]}
                      alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        点击查看大图
                      </span>
                    </div>
                  </div>
                  {selectedVehicle.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedVehicle.photos.slice(1, 5).map((photo, index) => (
                        <div 
                          key={index}
                          className="relative h-24 bg-muted rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageViewer(index + 1)}
                        >
                          <img
                            src={photo}
                            alt={`${selectedVehicle.brand} ${selectedVehicle.model} - ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 价格和基本信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">售价</div>
                  <div className="text-3xl font-bold text-primary">
                    {selectedVehicle.selling_price 
                      ? `¥${selectedVehicle.selling_price.toLocaleString()}` 
                      : '价格面议'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">年份</div>
                  <div className="text-lg font-semibold">{selectedVehicle.year}年</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">里程</div>
                  <div className="text-lg font-semibold">{selectedVehicle.mileage?.toLocaleString()}公里</div>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">车牌号</div>
                  <div className="font-medium">{selectedVehicle.plate_number || '暂无'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">车辆类型</div>
                  <div className="font-medium">{VEHICLE_TYPE_MAP[selectedVehicle.vehicle_type || ''] || '未知'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">变速箱</div>
                  <div className="font-medium">{TRANSMISSION_TYPE_MAP[selectedVehicle.transmission_type || ''] || '未知'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">驱动方式</div>
                  <div className="font-medium">{DRIVE_TYPE_MAP[selectedVehicle.drive_type || ''] || '未知'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">燃料类型</div>
                  <div className="font-medium">{FUEL_TYPE_MAP[selectedVehicle.fuel_type || ''] || '未知'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">排放标准</div>
                  <div className="font-medium">{EMISSION_STANDARD_MAP[selectedVehicle.emission_standard || ''] || '未知'}</div>
                </div>
              </div>

              {/* 车况描述 */}
              {selectedVehicle.condition_description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">车况描述</div>
                  <p className="text-sm leading-relaxed">{selectedVehicle.condition_description}</p>
                </div>
              )}

              {/* 车行信息 */}
              {selectedVehicle.dealership && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-lg">{selectedVehicle.dealership.name}</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>联系人：{sharerInfo?.name || selectedVehicle.dealership.display_contact_name || selectedVehicle.dealership.contact_person}</div>
                        <div>电话：{sharerInfo?.phone || selectedVehicle.dealership.display_contact_phone || selectedVehicle.dealership.contact_phone}</div>
                        {selectedVehicle.dealership.address && (
                          <div>地址：{selectedVehicle.dealership.address}</div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const phone = sharerInfo?.phone || selectedVehicle.dealership?.display_contact_phone || selectedVehicle.dealership?.contact_phone;
                        if (phone) {
                          window.location.href = `tel:${phone}`;
                        }
                      }}
                      className="gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      立即联系
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 图片查看器 */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-6xl p-0 bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={() => setImageViewerOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          
          {selectedVehicle?.photos && selectedVehicle.photos.length > 0 && (
            <div className="relative h-[80vh] flex items-center justify-center">
              <img
                src={selectedVehicle.photos[currentImageIndex]}
                alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {selectedVehicle.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                    {currentImageIndex + 1} / {selectedVehicle.photos.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
