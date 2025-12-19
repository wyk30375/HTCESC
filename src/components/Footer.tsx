import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-dealership-primary text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">汽车经销商</h3>
            <p className="mb-4 text-gray-300">
              您值得信赖的新车和二手车以及专业修理厂服务的合作伙伴。
            </p>
            
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-dealership-accent transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/autos" className="hover:text-dealership-accent transition-colors">
                  待售汽车
                </Link>
              </li>
              <li>
                <Link to="/garage-diensten" className="hover:text-dealership-accent transition-colors">
                  修理厂服务
                </Link>
              </li>
              <li>
                <Link to="/over-ons" className="hover:text-dealership-accent transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-dealership-accent transition-colors">
                  联系我们
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">联系信息</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-dealership-accent" />
                <span>XX大道123号X</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-dealership-accent" />
                <span>010-xxxxxxxx</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-dealership-accent" />
                <span>xxxxx@163.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-bold mb-4">营业时间</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-0.5 text-dealership-accent" />
                <div>
                  <p className="font-medium">周一至周五</p>
                  <p>08:00 - 18:00</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-0.5 text-dealership-accent" />
                <div>
                  <p className="font-medium">周六</p>
                  <p>09:00 - 17:00</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 mt-0.5 text-dealership-accent" />
                <div>
                  <p className="font-medium">周日</p>
                  <p>休息</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} 汽车经销商。保留所有权利。</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="hover:text-dealership-accent mr-4">隐私政策</a>
              <a href="#" className="hover:text-dealership-accent">一般条款</a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;