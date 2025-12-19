import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Car, cars, brands, models, fuels, transmissions, years } from '@/data/cars';

const CarListings = () => {
  const [filteredCars, setFilteredCars] = useState<Car[]>(cars);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    fuel: '',
    transmission: '',
    priceRange: [0, 100000],
    mileageRange: [0, 200000]
  });

  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm]);

  const applyFilters = () => {
    let result = [...cars];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(car => 
        car.brand.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term) ||
        car.description.toLowerCase().includes(term)
      );
    }

    if (filters.brand) {
      result = result.filter(car => car.brand === filters.brand);
    }
    
    if (filters.model) {
      result = result.filter(car => car.model === filters.model);
    }
    
    if (filters.year) {
      result = result.filter(car => car.year === parseInt(filters.year));
    }
    
    if (filters.fuel) {
      result = result.filter(car => car.fuel === filters.fuel);
    }
    
    if (filters.transmission) {
      result = result.filter(car => car.transmission === filters.transmission);
    }

    result = result.filter(car => 
      car.price >= filters.priceRange[0] && 
      car.price <= filters.priceRange[1]
    );
    
    result = result.filter(car => 
      car.mileage >= filters.mileageRange[0] && 
      car.mileage <= filters.mileageRange[1]
    );

    setFilteredCars(result);
  };

  const handleFilterChange = (filter: string, value: string | number | number[]) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      model: '',
      year: '',
      fuel: '',
      transmission: '',
      priceRange: [0, 100000],
      mileageRange: [0, 200000]
    });
    setSearchTerm('');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case '可用':
        return 'bg-green-500';
      case '已预订':
        return 'bg-yellow-500';
      case '已售出':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-CN', { 
      style: 'currency', 
      currency: 'CNY',
      maximumFractionDigits: 0 
    }).format(price);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="relative py-20 bg-gradient-to-r from-dealership-primary to-blue-900 text-white">
          <div 
            className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" 
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)'
            }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">待售汽车</h1>
              <p className="text-lg mb-6">
                浏览我们精心挑选的汽车，找到您的新车。
              </p>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="按品牌、型号或关键词搜索..."
                  className="pr-10 bg-white text-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="hidden md:block w-64 shrink-0">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">筛选器</h2>
                    <Button variant="ghost" className="h-8 px-2" onClick={clearFilters}>
                      重置
                    </Button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="brand">品牌</Label>
                      <Select
                        value={filters.brand}
                        onValueChange={(value) => handleFilterChange('brand', value)}
                      >
                        <SelectTrigger id="brand" className="w-full">
                          <SelectValue placeholder="所有品牌" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有品牌</SelectItem>
                          {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="model">型号</Label>
                      <Select
                        value={filters.model}
                        onValueChange={(value) => handleFilterChange('model', value)}
                      >
                        <SelectTrigger id="model" className="w-full">
                          <SelectValue placeholder="所有型号" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有型号</SelectItem>
                          {models.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="year">生产年份</Label>
                      <Select
                        value={filters.year.toString()}
                        onValueChange={(value) => handleFilterChange('year', value)}
                      >
                        <SelectTrigger id="year" className="w-full">
                          <SelectValue placeholder="所有年份" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有年份</SelectItem>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="fuel">燃料</Label>
                      <Select
                        value={filters.fuel}
                        onValueChange={(value) => handleFilterChange('fuel', value)}
                      >
                        <SelectTrigger id="fuel" className="w-full">
                          <SelectValue placeholder="所有燃料类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有燃料类型</SelectItem>
                          {fuels.map(fuel => (
                            <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="transmission">变速箱</Label>
                      <Select
                        value={filters.transmission}
                        onValueChange={(value) => handleFilterChange('transmission', value)}
                      >
                        <SelectTrigger id="transmission" className="w-full">
                          <SelectValue placeholder="所有变速箱" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有变速箱</SelectItem>
                          {transmissions.map(transmission => (
                            <SelectItem key={transmission} value={transmission}>{transmission}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>价格</Label>
                        <span className="text-sm text-gray-500">
                          ¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0, 100000]}
                        max={100000}
                        step={1000}
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange('priceRange', value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>里程数</Label>
                        <span className="text-sm text-gray-500">
                          {filters.mileageRange[0]} - {filters.mileageRange[1]} 公里
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0, 200000]}
                        max={200000}
                        step={5000}
                        value={filters.mileageRange}
                        onValueChange={(value) => handleFilterChange('mileageRange', value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:hidden mb-4">
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="w-full flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    筛选器
                  </div>
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showFilters && (
                  <div className="bg-white p-6 rounded-lg shadow mt-2">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold">筛选器</h2>
                      <Button variant="ghost" className="h-8 px-2" onClick={clearFilters}>
                        重置
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="brand-mobile">品牌</Label>
                        <Select
                          value={filters.brand}
                          onValueChange={(value) => handleFilterChange('brand', value)}
                        >
                          <SelectTrigger id="brand-mobile" className="w-full">
                            <SelectValue placeholder="所有品牌" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有品牌</SelectItem>
                            {brands.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="model-mobile">型号</Label>
                        <Select
                          value={filters.model}
                          onValueChange={(value) => handleFilterChange('model', value)}
                        >
                          <SelectTrigger id="model-mobile" className="w-full">
                            <SelectValue placeholder="所有型号" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有型号</SelectItem>
                            {models.map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="year-mobile">生产年份</Label>
                        <Select
                          value={filters.year.toString()}
                          onValueChange={(value) => handleFilterChange('year', value)}
                        >
                          <SelectTrigger id="year-mobile" className="w-full">
                            <SelectValue placeholder="所有年份" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有年份</SelectItem>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="fuel-mobile">燃料</Label>
                        <Select
                          value={filters.fuel}
                          onValueChange={(value) => handleFilterChange('fuel', value)}
                        >
                          <SelectTrigger id="fuel-mobile" className="w-full">
                            <SelectValue placeholder="所有燃料类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有燃料类型</SelectItem>
                            {fuels.map(fuel => (
                              <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="transmission-mobile">变速箱</Label>
                        <Select
                          value={filters.transmission}
                          onValueChange={(value) => handleFilterChange('transmission', value)}
                        >
                          <SelectTrigger id="transmission-mobile" className="w-full">
                            <SelectValue placeholder="所有变速箱" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">所有变速箱</SelectItem>
                            {transmissions.map(transmission => (
                              <SelectItem key={transmission} value={transmission}>{transmission}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>价格</Label>
                          <span className="text-sm text-gray-500">
                            ¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[0, 100000]}
                          max={100000}
                          step={1000}
                          value={filters.priceRange}
                          onValueChange={(value) => handleFilterChange('priceRange', value)}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>里程数</Label>
                          <span className="text-sm text-gray-500">
                            {filters.mileageRange[0]} - {filters.mileageRange[1]} 公里
                          </span>
                        </div>
                        <Slider
                          defaultValue={[0, 200000]}
                          max={200000}
                          step={5000}
                          value={filters.mileageRange}
                          onValueChange={(value) => handleFilterChange('mileageRange', value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">结果 ({filteredCars.length})</h2>
                    <Select defaultValue="price-asc">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="排序方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">价格低到高</SelectItem>
                        <SelectItem value="price-desc">价格高到低</SelectItem>
                        <SelectItem value="year-desc">最新优先</SelectItem>
                        <SelectItem value="year-asc">最旧优先</SelectItem>
                        <SelectItem value="mileage-asc">里程数低到高</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {filteredCars.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow text-center">
                    <h3 className="text-lg font-medium mb-2">未找到汽车</h3>
                    <p className="text-gray-500 mb-4">没有符合您搜索条件的汽车。</p>
                    <Button onClick={clearFilters}>清除筛选器</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCars.map((car) => (
                      <Link to={`/autos/${car.id}`} key={car.id}>
                        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={car.images[0]} 
                              alt={`${car.brand} ${car.model}`} 
                              className="w-full h-full object-cover"
                            />
                            <Badge 
                              className={`absolute top-2 right-2 ${getStatusBadgeColor(car.status)}`}
                            >
                              {car.status}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-lg font-bold mb-1">{car.brand} {car.model}</h3>
                            <p className="text-xl font-bold text-dealership-primary mb-2">
                              {formatPrice(car.price)}
                            </p>
                            <div className="flex flex-wrap gap-y-2 text-sm text-gray-600">
                              <div className="w-1/2">生产年份: {car.year}</div>
                              <div className="w-1/2">燃料: {car.fuel}</div>
                              <div className="w-1/2">变速箱: {car.transmission}</div>
                              <div className="w-1/2">里程数: {car.mileage} 公里</div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CarListings;
