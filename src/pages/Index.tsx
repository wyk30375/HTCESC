import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Car, Settings, PhoneCall, Clock, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cars } from '@/data/cars';

const Index = () => {
  // Get featured cars (first 3)
  const featuredCars = cars.filter(car => car.status === '可用').slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center bg-gradient-to-r from-dealership-primary to-blue-900 text-white">
          <div 
            className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" 
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-010-xxxxxxxx90-5cbf956ae2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)'
            }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">找到您的理想汽车</h1>
              <p className="text-lg md:text-xl mb-8">
                在汽车经销商处，您可以找到丰富的优质汽车收藏和专业的维修保养服务。
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-dealership-accent hover:bg-red-700">
                  <Link to="/autos">查看我们的汽车</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
                  <Link to="/garage-diensten">修理厂服务</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Tabs */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">我们的服务</h2>
            <Tabs defaultValue="sales" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sales" className="text-sm md:text-base">汽车销售</TabsTrigger>
                <TabsTrigger value="service" className="text-sm md:text-base">修理厂服务</TabsTrigger>
                <TabsTrigger value="finance" className="text-sm md:text-base">融资</TabsTrigger>
              </TabsList>
              <TabsContent value="sales" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <Car className="h-12 w-12 text-dealership-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">优质汽车</h3>
                      <p className="text-gray-600">
                        我们的产品系列包括精心挑选的顶级新车和二手车。
                      </p>
                    </div>
                    <div className="md:w-1/3">
                      <Search className="h-12 w-12 text-dealership-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">定制搜索</h3>
                      <p className="text-gray-600">
                        通过我们的高级搜索功能找到您的理想汽车，根据您的具体需求进行筛选。
                      </p>
                    </div>
                    <div className="md:w-1/3">
                      <PhoneCall className="h-12 w-12 text-dealership-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">个人建议</h3>
                      <p className="text-gray-600">
                        我们的专家随时准备帮助您为您的需求做出正确的选择。
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Button asChild className="bg-dealership-primary hover:bg-blue-900">
                      <Link to="/autos">查看所有汽车</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="service" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <Settings className="h-12 w-12 text-dealership-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">保养与维修</h3>
                      <p className="text-gray-600">
                        由合格技师为所有汽车品牌提供专业保养和维修。
                      </p>
                    </div>
                    <div className="md:w-1/3">
                      <Clock className="h-12 w-12 text-dealership-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">快速服务</h3>
                      <p className="text-gray-600">
                        高效的服务让您尽快重新上路，提供明确的时间指示。
                      </p>
                    </div>
                    <div className="md:w-1/3">
                      <MapPin className="h-12 w-12 text-dealership-primary mb-4" />
                      <h3 className="text-xl font-bold mb-2">中心位置</h3>
                      <p className="text-gray-600">
                        我们的修理厂位于中心位置，通过各种交通工具都很容易到达。
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Button asChild className="bg-dealership-primary hover:bg-blue-900">
                      <Link to="/garage-diensten">了解更多我们的修理厂</Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="finance" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <h3 className="text-xl font-bold mb-2">灵活的融资选择</h3>
                      <p className="text-gray-600 mb-4">
                        我们提供适合您情况和预算的各种融资选择，包括：
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>具有竞争力利率的汽车贷款</li>
                        <li>面向个人和商业客户的租赁安排</li>
                        <li>您当前汽车的以旧换新选项</li>
                        <li>保险和保修套餐</li>
                      </ul>
                    </div>
                    <div className="md:w-1/2">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">计算您的月费用</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          联系我们获取您融资选择的个性化计算。
                        </p>
                        <Button asChild className="w-full bg-dealership-primary hover:bg-blue-900">
                          <Link to="/contact">申请融资建议</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Featured Cars */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">特色汽车</h2>
              <Link to="/autos" className="text-dealership-primary hover:text-dealership-accent font-medium">
                查看全部 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => (
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
                      <div>生产年份：{car.year}</div>
                      <div>燃料：{car.fuel}</div>
                      <div>里程：{car.mileage} 公里</div>
                      <div>变速箱：{car.transmission}</div>
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

        {/* Call to Action */}
        <section className="py-16 bg-dealership-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">准备好找到您的梦想之车了吗？</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              参观我们的展厅或联系我们预约试驾或维护您现有的汽车。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-dealership-primary hover:bg-gray-100">
                <Link to="/contact">联系我们</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-black bg-white hover:bg-gray-100 hover:text-black focus:text-black active:text-black">
                <Link to="/over-ons">了解更多关于我们</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">客户评价</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "对我购买的新车非常满意。服务非常好，整个过程从头到尾都很顺利。"
                  </p>
                  <div className="font-medium">张志强</div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "我定期在这里保养我的汽车。技师非常专业，价格公道。绝对推荐！"
                  </p>
                  <div className="font-medium">李晓敏</div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "购买我的第一辆车时有很棒的体验。工作人员非常乐于助人，耐心回答我所有的问题。"
                  </p>
                  <div className="font-medium">王小明</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;