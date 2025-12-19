import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ceoZhang from '@/assets/ceo-zhang.jpg';
import salesManagerWang from '@/assets/sales-manager-wang.jpg';
import technicianLi from '@/assets/technician-li.jpg';
import customerServiceChen from '@/assets/customer-service-chen.jpg';
const AboutUs = () => {
  return <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-dealership-primary to-blue-900 text-white">
          <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)'
        }} />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">关于我们</h1>
              <p className="text-lg mb-6">
                我们是一家领先的汽车经销商和修理厂，对汽车和客户满意度充满热情。了解我们的故事。
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" alt="展厅" className="rounded-lg shadow-lg" />
              </div>
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6">我们的故事</h2>
                <p className="text-gray-600 mb-4">
                  汽车经销商成立于2005年，有着明确的愿景：提供优质汽车和卓越服务。经过15年多的发展，我们已成为汽车行业的可信品牌。
                </p>
                <p className="text-gray-600 mb-4">
                  从一个小展厅开始，现在已发展成为一个完整的服务中心，拥有丰富的新车和二手车收藏、专业的维修车间和一支敬业的员工团队。
                </p>
                <p className="text-gray-600 mb-6">
                  我们的理念很简单：我们希望如何被对待，就如何对待每一位客户。诚实、透明和质量是我们所做一切的基础。
                </p>
                <div className="flex space-x-4">
                  <Button asChild className="bg-dealership-primary hover:bg-blue-900">
                    <Link to="/autos">查看我们的汽车</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-dealership-primary text-dealership-primary hover:bg-dealership-primary hover:text-white">
                    <Link to="/contact">联系我们</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">我们的价值观</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                这些核心价值观构成了我们企业文化的基础，决定着我们每天的工作方式。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                    <CheckCircle className="h-8 w-8 text-dealership-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">质量</h3>
                  <p className="text-gray-600">
                    我们在所做的一切中追求最高质量，从销售的汽车到提供的服务。
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dealership-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">诚信</h3>
                  <p className="text-gray-600">
                    在与客户、供应商和员工的所有互动中保持诚实和透明。
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-dealership-primary bg-opacity-10 p-4 rounded-full inline-flex mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dealership-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">客户满意度</h3>
                  <p className="text-gray-600">
                    客户的需求是我们所做一切的核心。我们致力于建立基于信任的长期关系。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">我们的团队</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                认识汽车经销商背后的人员，他们是对汽车充满热情的敬业专业人士。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img src={ceoZhang} alt="总经理" className="w-full h-72 object-cover object-center" />
                </div>
                <h3 className="text-xl font-bold mb-1">张建国</h3>
                <p className="text-dealership-primary font-medium mb-2">总经理</p>
                <p className="text-gray-600">
                  张建国在汽车行业拥有超过20年的经验，以远见和热情领导着我们的公司。
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img src={salesManagerWang} alt="销售主管" className="w-full h-72 object-cover object-center" />
                </div>
                <h3 className="text-xl font-bold mb-1">王丽娜</h3>
                <p className="text-dealership-primary font-medium mb-2">销售主管</p>
                <p className="text-gray-600">
                  王丽娜确保每位客户都能找到满足所有需求的完美汽车。
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img src={technicianLi} alt="首席技师" className="w-full h-72 object-cover object-center" />
                </div>
                <h3 className="text-xl font-bold mb-1">李强</h3>
                <p className="text-dealership-primary font-medium mb-2">首席技师</p>
                <p className="text-gray-600">
                  凭借其技术专长，李强确保每辆汽车都处于完美状态。
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img src={customerServiceChen} alt="客户服务经理" className="w-full h-72 object-cover object-center" />
                </div>
                <h3 className="text-xl font-bold mb-1">陈雪</h3>
                <p className="text-dealership-primary font-medium mb-2">客户服务经理</p>
                <p className="text-gray-600">
                  陈雪确保每位客户都能获得最好的服务和支持。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications & Awards */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">认证与荣誉</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                我们为获得的认可感到自豪，并继续努力追求行业最高标准。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 text-dealership-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">官方认证会员</h3>
                  <p className="text-center text-gray-600">
                    作为官方认证的汽车企业，我们符合严格的质量要求并提供官方保证。
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 text-dealership-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">2022年度汽车企业</h3>
                  <p className="text-center text-gray-600">
                    我们为获得年度汽车企业奖感到自豪，这突出了我们对质量和服务的承诺。
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-4 text-dealership-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">可持续发展证书</h3>
                  <p className="text-center text-gray-600">
                    我们因在企业中实施环保做法的努力而获得认证。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">客户评价</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                客户的体验是我们服务质量的最佳衡量标准。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>)}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "我在寻找一辆可靠的家用车，汽车经销商的团队给了我完美的帮助。他们花时间倾听我的需求并提供诚实的建议。对我的购买非常满意！"
                  </p>
                  <div className="font-bold">马伟</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>)}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "在汽车经销商修理厂的服务保养总是一流的！价格透明，技师专业，沟通良好。他们会为您着想，不会推荐不必要的维修。"
                  </p>
                  <div className="font-bold">孙妮</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>)}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "作为企业家，我为公司在汽车经销商处购买了多辆汽车。个性化的服务和融资选择的灵活性让我不断回来购买新车。"
                  </p>
                  <div className="font-bold">刘明</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Location & Hours */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">位置与营业时间</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                欢迎来到我们的展厅或修理厂参观。我们很乐意为您服务！
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <Card className="h-full">
                  <CardContent className="p-6 h-full">
                    <div className="flex flex-col h-full">
                      <h3 className="text-xl font-bold mb-4">找到我们</h3>
                      <div className="flex items-start mb-4">
                        <MapPin className="h-5 w-5 mr-2 mt-0.5 text-dealership-primary" />
                        <div>
                          <p className="font-medium">地址：</p>
                          <p>XX大道123号</p>
                          
                          
                        </div>
                      </div>
                      <div className="flex items-start mb-6">
                        <Calendar className="h-5 w-5 mr-2 mt-0.5 text-dealership-primary" />
                        <div>
                          <p className="font-medium">营业时间：</p>
                          <div className="grid grid-cols-2 gap-x-4">
                            <p>周一至周五：</p>
                            <p>08:00 - 18:00</p>
                            <p>周六：</p>
                            <p>09:00 - 17:00</p>
                            <p>周日：</p>
                            <p>休息</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button asChild className="w-full bg-dealership-primary hover:bg-blue-900">
                          <Link to="/contact">联系我们</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:w-1/2">
                <Card className="h-full overflow-hidden">
                  <div className="h-full">
                    <iframe src="https://map.baidu.com/?newmap=1&ie=utf-8&s=s%26wd%3D%E5%8C%97%E4%BA%AC%E5%B8%82%E6%9C%9D%E9%98%B3%E5%8C%BA" width="100%" height="100%" className="min-h-[300px]" style={{
                    border: 0
                  }} allowFullScreen loading="lazy" title="我们的位置"></iframe>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-dealership-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">准备好与我们见面了吗？</h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              欢迎参观我们的展厅或预约试驾和保养服务。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-dealership-primary hover:bg-gray-100">
                <Link to="/contact">联系我们</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-black text-black hover:bg-black/10">
                <Link to="/autos">查看我们的汽车</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default AboutUs;