import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Wrench, AlertTriangle, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const GarageServices = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "预约申请已发送",
      description: "我们将尽快与您联系确认您的预约。",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-dealership-primary to-blue-900 text-white">
          <div 
            className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" 
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-010-xxxxxxxx09-859f744b84c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)'
            }}
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">专业修理厂服务</h1>
              <p className="text-lg mb-8">
                我们为所有汽车品牌提供全方位的维护服务，由我们经验丰富的合格技师执行。
              </p>
              <Button asChild size="lg" className="bg-dealership-accent hover:bg-red-700">
                <a href="#booking">预约服务</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">我们的服务</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                我们提供广泛的修理厂服务，让您的汽车保持最佳状态，从定期保养到复杂的维修。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-dealership-primary hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 bg-dealership-primary bg-opacity-10 p-4 rounded-full">
                      <Wrench className="h-8 w-8 text-dealership-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">保养与维修</h3>
                    <p className="text-gray-600 mb-4">
                      从换油到复杂的发动机维修，我们确保您的汽车保持可靠性能。
                    </p>
                    <ul className="text-left w-full space-y-2 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>定期保养服务</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>发动机和变速箱维修</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>空调服务和维修</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>排气和制动系统</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full bg-dealership-primary text-white hover:bg-dealership-primary/90">
                      <a href="#booking">预约服务</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-dealership-accent hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 bg-dealership-accent bg-opacity-10 p-4 rounded-full">
                      <AlertTriangle className="h-8 w-8 text-dealership-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">诊断与检查</h3>
                    <p className="text-gray-600 mb-4">
                      先进的诊断设备能够快速准确地发现和解决问题。
                    </p>
                    <ul className="text-left w-full space-y-2 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>电脑诊断故障诊断</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>年检</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>购前检查</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>安全和排放检查</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full bg-dealership-accent text-white hover:bg-red-700">
                      <a href="#booking">预约服务</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-dealership-primary hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 bg-dealership-primary bg-opacity-10 p-4 rounded-full">
                      <Calendar className="h-8 w-8 text-dealership-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">特殊服务</h3>
                    <p className="text-gray-600 mb-4">
                      额外服务让您的汽车保持最佳状态并延长使用寿命。
                    </p>
                    <ul className="text-left w-full space-y-2 mb-6">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>轮胎服务和存储</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>空调保养</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>挡风玻璃维修和更换</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span>车轮定位和平衡</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full bg-dealership-primary text-white hover:bg-dealership-primary/90">
                      <a href="#booking">预约服务</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Pricing */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">服务与价格</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                我们最常见服务的透明价格。请联系我们获取个性化报价。
              </p>
            </div>

            <Tabs defaultValue="maintenance" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="maintenance">保养</TabsTrigger>
                <TabsTrigger value="repair">维修</TabsTrigger>
                <TabsTrigger value="inspection">检查</TabsTrigger>
              </TabsList>
              <TabsContent value="maintenance" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="divide-y">
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">小保养服务</h4>
                        <p className="text-sm text-gray-600">更换机油、滤清器，补充液体</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥149,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">大保养服务</h4>
                        <p className="text-sm text-gray-600">全面检查，更换磨损部件</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥299,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">正时皮带更换</h4>
                        <p className="text-sm text-gray-600">包括水泵和张紧轮</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥499,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">空调服务</h4>
                        <p className="text-sm text-gray-600">清洁、检查和添加制冷剂</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥89,-</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      * 所列价格为指导价，可能因汽车品牌和型号而异。
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="repair" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="divide-y">
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">更换刹车片（前）</h4>
                        <p className="text-sm text-gray-600">更换刹车片和/或刹车盘</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥199,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">排气系统维修</h4>
                        <p className="text-sm text-gray-600">维修或更换排气部件</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥149,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">更换离合器</h4>
                        <p className="text-sm text-gray-600">包括压盘和压力轴承</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥699,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">更换电池</h4>
                        <p className="text-sm text-gray-600">供应和安装新电池</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥129,-</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      * 所列价格为指导价，可能因汽车品牌和型号而异。
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="inspection" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="divide-y">
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">年检</h4>
                        <p className="text-sm text-gray-600">您汽车的法定强制检查</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥49,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">全面车辆检查</h4>
                        <p className="text-sm text-gray-600">超过50个检查点的完整检查</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥89,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">购前检查</h4>
                        <p className="text-sm text-gray-600">购买二手车前的检查</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥99,-</div>
                    </div>
                    <div className="py-4 flex justify-between">
                      <div>
                        <h4 className="font-medium">发动机故障诊断</h4>
                        <p className="text-sm text-gray-600">读取故障代码和诊断问题</p>
                      </div>
                      <div className="text-dealership-accent font-bold">从 ¥59,-</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm text-gray-600">
                      * 所列价格为指导价，可能因汽车品牌和型号而异。
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">为什么选择我们的修理厂？</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                我们以质量、可靠性和客户满意度而脱颖而出。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dealership-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">保证质量</h3>
                <p className="text-gray-600">
                  我们只使用高质量的零件，并遵循每个品牌和型号的制造商规格。
                </p>
              </div>

              <div className="text-center">
                <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dealership-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">经验丰富的技师</h3>
                <p className="text-gray-600">
                  我们的团队由具有多年各种汽车品牌经验的认证技师组成。
                </p>
              </div>

              <div className="text-center">
                <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dealership-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">快速服务</h3>
                <p className="text-gray-600">
                  高效的工作流程确保您的汽车尽快重新上路。
                </p>
              </div>

              <div className="text-center">
                <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dealership-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">透明价格</h3>
                <p className="text-gray-600">
                  事前明确报价，事后无意外。我们追求公平和竞争性的价格。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section id="booking" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">预约服务</h2>
                <p className="text-lg text-gray-600">
                  填写下面的表格预约您的汽车保养或维修。我们将尽快与您联系。
                </p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-1">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          姓名 *
                        </label>
                        <Input id="name" required />
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                          邮箱 *
                        </label>
                        <Input id="email" type="email" required />
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                          电话号码 *
                        </label>
                        <Input id="phone" required />
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="license-plate" className="block text-sm font-medium mb-1">
                          车牌号 *
                        </label>
                        <Input id="license-plate" placeholder="AB-123-C" required />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="car-info" className="block text-sm font-medium mb-1">
                          汽车信息
                        </label>
                        <Input id="car-info" placeholder="品牌、型号、年份" />
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="service-type" className="block text-sm font-medium mb-1">
                          服务类型 *
                        </label>
                        <Select>
                          <SelectTrigger id="service-type">
                            <SelectValue placeholder="选择服务" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintenance">保养服务</SelectItem>
                            <SelectItem value="repair">维修</SelectItem>
                            <SelectItem value="inspection">年检</SelectItem>
                            <SelectItem value="tires">换胎</SelectItem>
                            <SelectItem value="other">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <label htmlFor="preferred-date" className="block text-sm font-medium mb-1">
                          首选日期
                        </label>
                        <Input id="preferred-date" type="date" />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="message" className="block text-sm font-medium mb-1">
                          描述/问题
                        </label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder="描述问题或所需服务"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button type="submit" className="w-full bg-dealership-accent hover:bg-red-700">
                          申请预约
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-dealership-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">准备好接受专业服务了吗？</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              今天就联系我们，了解更多关于我们修理厂服务的信息或预约。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-dealership-primary hover:bg-gray-100">
                <Link to="/contact">联系我们</Link>
              </Button>
              <Button asChild size="lg" className="bg-dealership-accent text-white hover:bg-red-700">
                <a href="tel:010-xxxxxxxx">直接拨打: 010-xxxxxxxx</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GarageServices;