import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Clock, Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "消息已发送",
      description: "感谢您的消息。我们将尽快与您联系。"
    });
  };
  return <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-dealership-primary to-blue-900 text-white">
          <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-010-xxxxxxxx36-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)'
        }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">联系我们</h1>
              <p className="text-lg mb-6">
                您对我们的汽车、修理厂服务有疑问或想预约吗？请联系我们，我们很乐意为您提供帮助。
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information & Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Contact Information */}
              <div className="lg:w-1/3">
                <div className="sticky top-8">
                  <h2 className="text-2xl font-bold mb-6">联系信息</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 mt-1 text-dealership-primary" />
                      <div>
                        <h3 className="font-bold">我们的地址</h3>
                        <p className="text-gray-600">汽车大道123号</p>
                        
                        
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-3 mt-1 text-dealership-primary" />
                      <div>
                        <h3 className="font-bold">电话号码</h3>
                        <p className="text-gray-600">总机: 010-xxxxxxxx</p>
                        <p className="text-gray-600">销售: 010-xxxxxxxx</p>
                        <p className="text-gray-600">修理厂: 010-xxxxxxxx</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-3 mt-1 text-dealership-primary" />
                      <div>
                        <h3 className="font-bold">邮箱地址</h3>
                        <p className="text-gray-600">信息: xxxxx@163.com</p>
                        <p className="text-gray-600">销售: xxxxx@163.com</p>
                        <p className="text-gray-600">服务: xxxxx@163.com</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 mt-1 text-dealership-primary" />
                      <div>
                        <h3 className="font-bold">营业时间</h3>
                        <div className="grid grid-cols-2 gap-x-4 text-gray-600">
                          <p>周一至周五:</p>
                          <p>08:00 - 18:00</p>
                          <p>周六:</p>
                          <p>09:00 - 17:00</p>
                          <p>周日:</p>
                          <p>休息</p>
                        </div>
                      </div>
                    </div>

                    
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:w-2/3">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">给我们发消息</h2>
                    
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
                            电话号码
                          </label>
                          <Input id="phone" />
                        </div>
                        <div className="col-span-1">
                          <label htmlFor="subject" className="block text-sm font-medium mb-1">
                            主题 *
                          </label>
                          <Select>
                            <SelectTrigger id="subject">
                              <SelectValue placeholder="选择主题" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sales">销售信息</SelectItem>
                              <SelectItem value="service">修理厂预约</SelectItem>
                              <SelectItem value="testdrive">试驾申请</SelectItem>
                              <SelectItem value="finance">融资选择</SelectItem>
                              <SelectItem value="other">其他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="message" className="block text-sm font-medium mb-1">
                            消息 *
                          </label>
                          <Textarea id="message" rows={6} placeholder="在此输入您的消息..." required />
                        </div>
                        <div className="col-span-2">
                          <Button type="submit" className="w-full bg-dealership-primary hover:bg-blue-900">
                            发送消息
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden">
              <div className="h-[400px]">
                <iframe src="https://map.baidu.com/search/%E5%8C%97%E4%BA%AC%E5%B8%82%E6%9C%9D%E9%98%B3%E5%8C%BA/@12957502.575,4825683.73,12z?querytype=s&da_src=shareurl&wd=%E5%8C%97%E4%BA%AC%E5%B8%82%E6%9C%9D%E9%98%B3%E5%8C%BA&c=131&src=0&pn=0&sug=0&l=11&b=(12944712,4817183;12970293,4834184)&from=webmap&biz_forward=%7B%22scaler%22:1,%22styles%22:%22pl%22%7D" width="100%" height="100%" style={{
                border: 0
              }} allowFullScreen loading="lazy" title="我们的位置"></iframe>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">常见问题</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                以下是一些常见问题的答案。如果您的问题不在其中，请随时联系我们。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">您的汽车有什么保修？</h3>
                  <p className="text-gray-600">
                    我们所有的汽车都提供至少6个月的官方保修。对于较新的汽车，制造商保修可能仍然适用。请询问您感兴趣的汽车的具体保修条件。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">我可以试驾吗？</h3>
                  <p className="text-gray-600">
                    是的，您总是可以试驾您感兴趣的汽车。您可以通过我们的网站、电话预约，或直接来我们的展厅。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">您提供融资选择吗？</h3>
                  <p className="text-gray-600">
                    是的，我们提供各种融资选择，包括汽车贷款和租赁安排。我们的融资顾问很乐意帮助您找到适合您情况的最佳选择。
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-2">我需要预约修理厂服务吗？</h3>
                  <p className="text-gray-600">
                    对于大多数修理厂服务，我们建议提前预约。这确保我们可以为您的汽车预留足够的时间并备有正确的零件。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-dealership-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">准备好访问我们了吗？</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              来我们的展厅参观或预约试驾和保养服务。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-dealership-primary hover:bg-gray-100">
                <a href="tel:010-xxxxxxxx">直接拨打: 010-xxxxxxxx</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-black hover:bg-white/10">
                <a href="mailto:xxxxx@163.com">邮箱: xxxxx@163.com</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Contact;