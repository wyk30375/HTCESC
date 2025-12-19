
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CarFront, Calendar, Users, Settings, FileText, HelpCircle, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast({
      title: "Uitgelogd",
      description: "U bent succesvol uitgelogd.",
    });
    navigate('/admin/login');
  };
  
  const navItems = [
    {
      title: "Dashboard",
      icon: <Settings className="mr-2 h-4 w-4" />,
      path: "/admin/dashboard",
    },
    {
      title: "Auto's Beheren",
      icon: <CarFront className="mr-2 h-4 w-4" />,
      path: "/admin/cars",
    },
    {
      title: "Auto Toevoegen",
      icon: <CarFront className="mr-2 h-4 w-4" />,
      path: "/admin/add-car",
    },
    {
      title: "Afspraken",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      path: "/admin/appointments",
    },
    {
      title: "Klanten",
      icon: <Users className="mr-2 h-4 w-4" />,
      path: "/admin/customers",
    },
    {
      title: "Aanvragen",
      icon: <FileText className="mr-2 h-4 w-4" />,
      path: "/admin/inquiries",
    },
    {
      title: "Hulp",
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
      path: "/admin/help",
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white rounded-lg shadow p-4">
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "bg-dealership-primary text-white"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
};

export default AdminNav;
