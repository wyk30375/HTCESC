
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarFront, Calendar, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      toast({
        title: "Toegang geweigerd",
        description: "U moet ingelogd zijn om toegang te krijgen tot deze pagina.",
        variant: "destructive",
      });
      navigate('/admin/login');
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast({
      title: "Uitgelogd",
      description: "U bent succesvol uitgelogd.",
    });
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <Button variant="secondary" onClick={handleLogout} className="text-dealership-primary bg-white hover:bg-gray-100">
                Uitloggen
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="overview">Overzicht</TabsTrigger>
                  <TabsTrigger value="cars">Auto's</TabsTrigger>
                  <TabsTrigger value="appointments">Afspraken</TabsTrigger>
                  <TabsTrigger value="inquiries">Aanvragen</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                          Totaal Auto's
                        </CardTitle>
                        <CarFront className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">25</div>
                        <p className="text-xs text-muted-foreground">
                          +2 sinds vorige maand
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                          Geplande Afspraken
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                          3 vandaag
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                          Nieuwe Aanvragen
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">
                          +5 sinds vorige week
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Toegevoegde Auto's</CardTitle>
                      <CardDescription>
                        De laatst toegevoegde auto's aan de inventaris.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">BMW 3 Serie</p>
                            <p className="text-sm text-muted-foreground">
                              ¥32.950 - 2021 - 45.000 km
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Link to="/admin/cars">Bekijken</Link>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">Volkswagen Golf</p>
                            <p className="text-sm text-muted-foreground">
                              ¥24.750 - 2020 - 38.500 km
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Link to="/admin/cars">Bekijken</Link>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audi A4</p>
                            <p className="text-sm text-muted-foreground">
                              ¥36.500 - 2021 - 32.000 km
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Link to="/admin/cars">Bekijken</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="cars" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Auto's Beheren</CardTitle>
                        <Button 
                          onClick={() => navigate('/admin/add-car')}
                          className="bg-dealership-primary hover:bg-blue-900"
                        >
                          Auto Toevoegen
                        </Button>
                      </div>
                      <CardDescription>
                        Bekijk en beheer de auto's in de inventaris.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <p className="mb-4">Klik op de onderstaande knop om naar het volledige auto-overzicht te gaan</p>
                        <Button onClick={() => navigate('/admin/cars')} className="bg-dealership-primary hover:bg-blue-900">
                          Ga naar Auto's Beheren
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appointments" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Afspraken Beheren</CardTitle>
                      <CardDescription>
                        Bekijk en beheer de geplande afspraken.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <p className="mb-4">Klik op de onderstaande knop om naar het volledige afsprakenoverzicht te gaan</p>
                        <Button onClick={() => navigate('/admin/appointments')} className="bg-dealership-primary hover:bg-blue-900">
                          Ga naar Afspraken
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="inquiries" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aanvragen Beheren</CardTitle>
                      <CardDescription>
                        Bekijk en beheer de inkomende aanvragen.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-10">
                        <p className="mb-4">Klik op de onderstaande knop om naar het volledige aanvragenoverzicht te gaan</p>
                        <Button onClick={() => navigate('/admin/inquiries')} className="bg-dealership-primary hover:bg-blue-900">
                          Ga naar Aanvragen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
