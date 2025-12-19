
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, User, Calendar, Clock, Car, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';

// Mock data for appointments
const mockAppointments = [
  {
    id: "1",
    customerName: "Jan Jansen",
    email: "xxxxx@163.com",
    phone: "06-12345678",
    date: "2025-04-05",
    time: "10:00",
    service: "APK en onderhoudsbeurt",
    carDetails: "BMW 3 Serie, 2018, Diesel",
    notes: "Klant heeft aangegeven dat er een ratelend geluid is bij het starten.",
    status: "Gepland"
  },
  {
    id: "2",
    customerName: "Emma de Vries",
    email: "xxxxx@163.com",
    phone: "06-87654321",
    date: "2025-04-05",
    time: "14:30",
    service: "Bandenwissel zomer/winter",
    carDetails: "Volkswagen Golf, 2020, Benzine",
    notes: "Klant brengt eigen zomerbanden mee.",
    status: "Bevestigd"
  },
  {
    id: "3",
    customerName: "Peter Bakker",
    email: "xxxxx@163.com",
    phone: "06-55443322",
    date: "2025-04-06",
    time: "09:15",
    service: "Grote onderhoudsbeurt",
    carDetails: "Audi A4, 2019, Diesel",
    notes: "Kilometerteller staat op 87.000 km.",
    status: "Wachtend"
  },
  {
    id: "4",
    customerName: "Sophie Visser",
    email: "xxxxx@163.com",
    phone: "06-11223344",
    date: "2025-04-07",
    time: "11:00",
    service: "Airco-service",
    carDetails: "Renault Clio, 2017, Benzine",
    notes: "Klant klaagt over verminderde werking van de airco.",
    status: "Gepland"
  },
  {
    id: "5",
    customerName: "Thomas Meijer",
    email: "xxxxx@163.com",
    phone: "06-99887766",
    date: "2025-04-07",
    time: "16:00",
    service: "Remmenservice",
    carDetails: "Volvo V60, 2021, Hybride",
    notes: "Remmen maken geluid bij het remmen.",
    status: "Wachtend"
  }
];

const ManageAppointments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAppointment, setSelectedAppointment] = useState<typeof mockAppointments[0] | null>(null);
  const [notes, setNotes] = useState("");

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
    // In a real app, fetch appointments data here
  }, [navigate, toast]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Gepland":
        return <Badge className="bg-blue-500">Gepland</Badge>;
      case "Bevestigd":
        return <Badge className="bg-green-500">Bevestigd</Badge>;
      case "Wachtend":
        return <Badge className="bg-yellow-500">Wachtend</Badge>;
      case "Voltooid":
        return <Badge className="bg-gray-500">Voltooid</Badge>;
      case "Geannuleerd":
        return <Badge variant="destructive">Geannuleerd</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleConfirm = (appointmentId: string) => {
    toast({
      title: "Afspraak bevestigd",
      description: "De afspraak is succesvol bevestigd.",
    });
  };

  const handleCancel = (appointmentId: string) => {
    toast({
      title: "Afspraak geannuleerd",
      description: "De afspraak is geannuleerd.",
      variant: "destructive",
    });
  };

  const handleComplete = (appointmentId: string) => {
    if (!notes.trim()) {
      toast({
        title: "Notities vereist",
        description: "Voeg notities toe over de uitgevoerde werkzaamheden.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Afspraak voltooid",
      description: "De afspraak is gemarkeerd als voltooid.",
    });
    
    setNotes("");
    setSelectedAppointment(null);
  };

  const handleContact = (appointment: typeof mockAppointments[0], method: 'email' | 'phone') => {
    if (method === 'email') {
      toast({
        title: "E-mail voorbereid",
        description: `E-mail naar ${appointment.email} wordt voorbereid.`,
      });
    } else {
      toast({
        title: "Telefooncontact",
        description: `U kunt ${appointment.customerName} bellen op ${appointment.phone}.`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Afspraken Beheren</h1>
            <p>Bekijk en beheer alle geplande afspraken</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>Afspraken</CardTitle>
                  <CardDescription>
                    Overzicht van alle geplande afspraken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Klant</TableHead>
                        <TableHead className="hidden md:table-cell">Service</TableHead>
                        <TableHead>Datum & Tijd</TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{appointment.customerName}</div>
                            <div className="text-xs text-gray-500 hidden md:block">{appointment.phone}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="max-w-xs truncate">{appointment.service}</div>
                          </TableCell>
                          <TableCell>
                            <div>{formatDate(appointment.date)}</div>
                            <div className="text-xs text-gray-500">{appointment.time} uur</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedAppointment(appointment)}
                                >
                                  Details
                                </Button>
                              </DialogTrigger>
                              {selectedAppointment && (
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Afspraakdetails</DialogTitle>
                                    <DialogDescription>
                                      {selectedAppointment.service} - {formatDate(selectedAppointment.date)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <User className="h-6 w-6 rounded-full bg-gray-100 p-1 mr-2" />
                                        <div>
                                          <div className="font-medium">{selectedAppointment.customerName}</div>
                                          <div className="text-sm text-gray-500">
                                            {selectedAppointment.email} | {selectedAppointment.phone}
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        {getStatusBadge(selectedAppointment.status)}
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4">
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Datum & Tijd</h3>
                                        <div className="flex items-start">
                                          <Calendar className="mr-2 h-4 w-4 mt-0.5 text-gray-500" />
                                          <div>
                                            <p>{formatDate(selectedAppointment.date)}</p>
                                            <p className="flex items-center">
                                              <Clock className="mr-1 h-3 w-3 text-gray-500" />
                                              <span>{selectedAppointment.time} uur</span>
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Voertuiggegevens</h3>
                                        <div className="flex items-start">
                                          <Car className="mr-2 h-4 w-4 mt-0.5 text-gray-500" />
                                          <p>{selectedAppointment.carDetails}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                                      <p>{selectedAppointment.service}</p>
                                    </div>
                                    
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notities</h3>
                                      <p className="text-gray-700">{selectedAppointment.notes}</p>
                                    </div>
                                    
                                    {selectedAppointment.status !== 'Voltooid' && selectedAppointment.status !== 'Geannuleerd' && (
                                      <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Monteurnotities toevoegen</h3>
                                        <Textarea
                                          placeholder="Voeg notities toe over de werkzaamheden..."
                                          rows={3}
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleContact(selectedAppointment, 'email')}
                                      >
                                        <Mail className="mr-2 h-4 w-4" />
                                        E-mail
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleContact(selectedAppointment, 'phone')}
                                      >
                                        <Phone className="mr-2 h-4 w-4" />
                                        Bellen
                                      </Button>
                                    </div>
                                    <div className="flex gap-2">
                                      {selectedAppointment.status !== 'Geannuleerd' && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => handleCancel(selectedAppointment.id)}
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Annuleren
                                        </Button>
                                      )}
                                      {selectedAppointment.status === 'Wachtend' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                                          onClick={() => handleConfirm(selectedAppointment.id)}
                                        >
                                          Bevestigen
                                        </Button>
                                      )}
                                      {selectedAppointment.status !== 'Voltooid' && selectedAppointment.status !== 'Geannuleerd' && (
                                        <Button
                                          variant="default"
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => handleComplete(selectedAppointment.id)}
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Voltooid
                                        </Button>
                                      )}
                                      <DialogClose asChild>
                                        <Button variant="outline" size="sm">Sluiten</Button>
                                      </DialogClose>
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

export default ManageAppointments;
