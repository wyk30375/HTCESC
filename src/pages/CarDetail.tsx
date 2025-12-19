import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Check, Star, Calendar, BarChart, Fuel, Gauge, Settings, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cars } from '@/data/cars';

const CarDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [mainImage, setMainImage] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Find the car with the matching ID
  const car = cars.find((c) => c.id === Number(id));

  if (!car) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">未找到汽车</h2>
            <p className="mb-6">您查找的汽车不存在或不再可用。</p>
            <Button asChild className="bg-dealership-primary hover:bg-blue-900">
              <Link to="/autos">查看所有汽车</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get similar cars (same brand or same type)
  const similarCars = cars
    .filter((c) => c.id !== car.id && (c.brand === car.brand || c.fuel === car.fuel))
    .slice(0, 3);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "申请已发送",
      description: "我们将尽快与您联系。",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Car Header */}
        <section className="bg-dealership-primary text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{car.brand} {car.model}</h1>
                <p className="text-lg opacity-90">生产年份 {car.year} • {car.mileage} 公里</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-bold">¥{car.price.toLocaleString()}</div>
                <Badge
                  className={`mt-2 ${
                    car.status === '可用'
                      ? 'bg-green-500'
                      : car.status === '已预订'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                >
                  {car.status}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Car Details */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Images and Info */}
              <div className="lg:w-2/3">
                {/* Image Gallery */}
                <div className="mb-8">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 h-96">
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={car.images[mainImage]}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-contain cursor-zoom-in"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/800x400/f3f4f6/9ca3af?text=' + encodeURIComponent(`${car.brand} ${car.model}`);
                          }}
                        />
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl h-auto flex items-center justify-center">
                        <div className="relative">
                          <img
                            src={car.images[mainImage]}
                            alt={`${car.brand} ${car.model} 完整尺寸`}
                            className="max-w-full max-h-[80vh] object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {car.images.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden h-24 ${
                          mainImage === index ? 'border-dealership-primary' : 'border-transparent'
                        }`}
                        onClick={() => setMainImage(index)}
                      >
                        <img
                          src={image}
                          alt={`${car.brand} ${car.model} 缩略图 ${index + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=' + encodeURIComponent(`${car.brand} ${car.model}`);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs with Details */}
                <Tabs defaultValue="specs" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="specs">规格</TabsTrigger>
                    <TabsTrigger value="features">特性</TabsTrigger>
                    <TabsTrigger value="description">描述</TabsTrigger>
                  </TabsList>
                  <TabsContent value="specs" className="border rounded-lg p-6 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-dealership-primary mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">生产年份</div>
                          <div className="font-medium">{car.year}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Gauge className="h-5 w-5 text-dealership-primary mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">里程数</div>
                          <div className="font-medium">{car.mileage} 公里</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Fuel className="h-5 w-5 text-dealership-primary mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">燃料</div>
                          <div className="font-medium">{car.fuel}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Settings className="h-5 w-5 text-dealership-primary mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">变速箱</div>
                          <div className="font-medium">{car.transmission}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BarChart className="h-5 w-5 text-dealership-primary mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">功率</div>
                          <div className="font-medium">110 kW (150 马力)</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-dealership-primary mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">颜色</div>
                          <div className="font-medium">{car.color}</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="features" className="border rounded-lg p-6 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="h-5 w-5 text-green-600 mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="description" className="border rounded-lg p-6 mt-2">
                    <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column: Contact Form */}
              <div className="lg:w-1/3">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">对这辆车感兴趣？</h3>
                    <p className="text-gray-600 mb-6">
                      填写表单，我们将尽快与您联系以获取更多信息或安排试驾。
                    </p>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            姓名 *
                          </label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">
                            邮箱 *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium mb-1">
                            电话号码
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium mb-1">
                            消息
                          </label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="我对这辆车感兴趣，想了解更多信息..."
                            rows={4}
                          />
                        </div>
                        <Button type="submit" className="w-full bg-dealership-accent hover:bg-red-700">
                          发送申请
                        </Button>
                      </div>
                    </form>
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-2">或直接联系:</h4>
                      <a
                        href="tel:010-xxxxxxxx"
                        className="flex items-center text-dealership-primary hover:text-dealership-accent font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        010-xxxxxxxx
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8">类似汽车</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarCars.map((car) => (
                  <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                      <div className="absolute top-0 right-0 bg-dealership-accent text-white px-3 py-1 text-sm font-medium">
                        {car.status}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
                        <span className="text-dealership-accent font-bold">¥{car.price.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                        <div>生产年份: {car.year}</div>
                        <div>燃料: {car.fuel}</div>
                        <div>里程数: {car.mileage} 公里</div>
                        <div>变速箱: {car.transmission}</div>
                      </div>
                      <Button asChild className="w-full bg-dealership-primary hover:bg-blue-900">
                        <Link to={`/autos/${car.id}`}>查看详情</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CarDetail;