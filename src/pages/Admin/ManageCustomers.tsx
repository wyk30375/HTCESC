
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Mail, Phone, User, Car, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';

// Define customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  lastVisit: string;
  cars: number;
  notes: string;
  status?: string;
  appointments: {
    date: string;
    service: string;
    status: string;
  }[];
}

// Mock data for customers
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Jan Jansen",
    email: "xxxxx@163.com",
    phone: "06-12345678",
    city: "XX",
    lastVisit: "2025-03-15",
    cars: 2,
    notes: "Vaste klant sinds 2018. Heeft twee auto's: BMW 3 Serie en Volkswagen Golf.",
    appointments: [
      { date: "2025-03-15", service: "APK en onderhoudsbeurt", status: "Voltooid" },
      { date: "2024-11-22", service: "Bandenwissel", status: "Gepland" }
    ]
  },
  {
    id: "2",
    name: "Emma de Vries",
    email: "xxxxx@163.com",
    phone: "06-87654321",
    city: "XX",
    lastVisit: "2025-02-28",
    cars: 1,
    notes: "Nieuwe klant, eerste bezoek in februari 2025.",
    appointments: [
      { date: "2025-02-28", service: "Grote beurt", status: "Voltooid" }
    ]
  },
  {
    id: "3",
    name: "Peter Bakker",
    email: "xxxxx@163.com",
    phone: "06-55443322",
    city: "XX",
    lastVisit: "2025-03-20",
    cars: 3,
    notes: "Rijdt veel kilometers voor werk, komt regelmatig voor onderhoud.",
    appointments: [
      { date: "2025-03-20", service: "Remmen vervangen", status: "Voltooid" },
      { date: "2025-01-10", service: "Olie vervangen", status: "Voltooid" },
      { date: "2025-04-15", service: "APK", status: "Gepland" }
    ]
  },
  {
    id: "4",
    name: "Sophie Visser",
    email: "xxxxx@163.com",
    phone: "06-11223344",
    city: "XX",
    lastVisit: "2025-01-10",
    cars: 1,
    notes: "Koopt graag accessoires voor haar auto.",
    appointments: [
      { date: "2025-01-10", service: "Kleine beurt", status: "Voltooid" }
    ]
  },
  {
    id: "5",
    name: "Thomas Meijer",
    email: "xxxxx@163.com",
    phone: "06-99887766",
    city: "XX",
    lastVisit: "2025-03-25",
    cars: 2,
    notes: "Heeft interesse getoond in een nieuwe auto.",
    appointments: [
      { date: "2025-03-25", service: "Diagnose motorprobleem", status: "Voltooid" },
      { date: "2025-04-05", service: "Airco-service", status: "Gepland" }
    ]
  }
];

const ManageCustomers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

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

    // Load customers from localStorage if available
    const savedCustomers = localStorage.getItem('customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      // Initialize localStorage with mock data if not already present
      localStorage.setItem('customers', JSON.stringify(mockCustomers));
      setCustomers(mockCustomers);
    }
  }, [navigate, toast]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const handleApprove = (customerId: string) => {
    const updatedCustomers = customers.map(customer => {
      if (customer.id === customerId) {
        return { ...customer, status: 'Geaccepteerd' };
      }
      return customer;
    });
    
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    
    toast({
      title: "Klant geaccepteerd",
      description: "De klant is succesvol geaccepteerd.",
    });
    
    // Close dialog
    setSelectedCustomer(null);
  };

  const handleReject = (customerId: string) => {
    const updatedCustomers = customers.map(customer => {
      if (customer.id === customerId) {
        return { ...customer, status: 'Geweigerd' };
      }
      return customer;
    });
    
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    
    toast({
      title: "Klant geweigerd",
      description: "De klant is geweigerd.",
    });
    
    // Close dialog
    setSelectedCustomer(null);
  };

  const handleContact = (customerId: string, method: 'email' | 'phone') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (method === 'email') {
      toast({
        title: "E-mail voorbereid",
        description: `E-mail naar ${customer.email} wordt voorbereid.`,
      });
    } else {
      toast({
        title: "Telefoon",
        description: `U kunt ${customer.name} bellen op ${customer.phone}.`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Klanten Beheren</h1>
            <p>Bekijk en beheer klantgegevens</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Klanten</CardTitle>
                  <CardDescription>
                    Overzicht van alle klanten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Naam</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="hidden md:table-cell">Locatie</TableHead>
                        <TableHead>Auto's</TableHead>
                        <TableHead className="hidden md:table-cell">Laatste bezoek</TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-6 w-6 rounded-full bg-gray-100 p-1 mr-2" />
                              <div className="font-medium">{customer.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-sm">
                              <div className="flex items-center">
                                <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                {customer.email}
                              </div>
                              <div className="flex items-center mt-1">
                                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                {customer.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{customer.city}</TableCell>
                          <TableCell>{customer.cars}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(customer.lastVisit)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  Details
                                </Button>
                              </DialogTrigger>
                              {selectedCustomer && (
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Klantgegevens</DialogTitle>
                                    <DialogDescription>
                                      Gedetailleerde informatie over {selectedCustomer.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                    <div>
                                      <h3 className="text-lg font-medium mb-2">Contactgegevens</h3>
                                      <div className="space-y-2">
                                        <div className="flex items-center">
                                          <User className="mr-2 h-4 w-4 text-gray-500" />
                                          <span>{selectedCustomer.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                          <span>{selectedCustomer.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                          <span>{selectedCustomer.phone}</span>
                                        </div>
                                        <div className="flex items-start mt-4">
                                          <span className="font-medium mr-2">Notities:</span>
                                          <span className="text-gray-700">{selectedCustomer.notes}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-6">
                                        <h3 className="text-lg font-medium mb-2">Voertuigen</h3>
                                        <div className="flex items-center">
                                          <Car className="mr-2 h-4 w-4 text-gray-500" />
                                          <span>{selectedCustomer.cars} auto's geregistreerd</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-lg font-medium mb-2">Afspraken</h3>
                                      {selectedCustomer.appointments.map((appointment, index) => (
                                        <div key={index} className="mb-3 p-3 border rounded-md">
                                          <div className="flex items-center mb-1">
                                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                            <span className="font-medium">{formatDate(appointment.date)}</span>
                                          </div>
                                          <div className="ml-6">
                                            <p>{appointment.service}</p>
                                            <p className={`text-sm ${appointment.status === 'Voltooid' ? 'text-green-600' : 'text-blue-600'}`}>
                                              Status: {appointment.status}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center">
                                    <div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mr-2"
                                        onClick={() => handleContact(selectedCustomer.id, 'email')}
                                      >
                                        <Mail className="mr-2 h-4 w-4" />
                                        E-mail
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleContact(selectedCustomer.id, 'phone')}
                                      >
                                        <Phone className="mr-2 h-4 w-4" />
                                        Bellen
                                      </Button>
                                    </div>
                                    <div>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        className="mr-2"
                                        onClick={() => handleReject(selectedCustomer.id)}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Weigeren
                                      </Button>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApprove(selectedCustomer.id)}
                                      >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Accepteren
                                      </Button>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              )}
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageCustomers;
