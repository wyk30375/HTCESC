import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Menu, X, Phone, Mail, User } from 'lucide-react';
import { cn } from "@/lib/utils";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="py-2 border-b border-gray-100 hidden sm:flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-dealership-primary" />
              <a href="tel:010-xxxxxxxx" className="hover:text-dealership-primary transition-colors">
                010-xxxxxxxx
              </a>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2 text-dealership-primary" />
              <a href="mailto:xxxxx@163.com" className="hover:text-dealership-primary transition-colors">
                xxxxx@163.com
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            
          </div>
        </div>
        
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-dealership-primary">
            汽车<span className="text-dealership-accent">修理厂</span>
          </Link>
          
          <nav className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className={cn("px-4 py-2 text-gray-700 hover:text-dealership-primary transition-colors")}>
                    首页
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/autos" className={cn("px-4 py-2 text-gray-700 hover:text-dealership-primary transition-colors")}>
                    汽车
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/garage-diensten" className={cn("px-4 py-2 text-gray-700 hover:text-dealership-primary transition-colors")}>
                    服务
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/over-ons" className={cn("px-4 py-2 text-gray-700 hover:text-dealership-primary transition-colors")}>
                    关于我们
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/contact" className={cn("px-4 py-2 text-gray-700 hover:text-dealership-primary transition-colors")}>
                    联系我们
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          
          <div className="hidden md:block">
            <Button asChild className="bg-dealership-primary hover:bg-blue-900 mr-2">
              <Link to="/contact">
                联系我们
              </Link>
            </Button>
            <Button variant="outline" asChild className="border-dealership-primary text-dealership-primary hover:text-dealership-accent">
              <Link to="/over-ons">了解更多</Link>
            </Button>
          </div>
          
          <button className="md:hidden" onClick={toggleMenu} aria-label="切换菜单">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="py-2 text-gray-700 hover:text-dealership-primary" onClick={toggleMenu}>
                首页
              </Link>
              <Link to="/autos" className="py-2 text-gray-700 hover:text-dealership-primary" onClick={toggleMenu}>
                汽车
              </Link>
              <Link to="/garage-diensten" className="py-2 text-gray-700 hover:text-dealership-primary" onClick={toggleMenu}>
                服务
              </Link>
              <Link to="/over-ons" className="py-2 text-gray-700 hover:text-dealership-primary" onClick={toggleMenu}>
                关于我们
              </Link>
              <Link to="/contact" className="py-2 text-gray-700 hover:text-dealership-primary" onClick={toggleMenu}>
                联系我们
              </Link>
              <Link to="/admin/login" className="py-2 text-gray-700 hover:text-dealership-primary" onClick={toggleMenu}>
                {isLoggedIn ? '管理员控制台' : '管理员登录'}
              </Link>
              <div className="pt-4 space-y-2">
                <Button asChild className="w-full bg-dealership-primary hover:bg-blue-900">
                  <Link to="/contact" onClick={toggleMenu}>
                    联系我们
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-dealership-primary text-dealership-primary hover:text-dealership-accent">
                  <Link to="/over-ons" onClick={toggleMenu}>
                    了解更多关于我们
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>}
    </header>;
};
export default Header;