import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';
import { fuels, transmissions, brands, cars as initialCarsData } from '@/data/cars';
import { Search, Check } from 'lucide-react';

interface RDWCarData {
  kenteken?: string;
  merk?: string;
  handelsbenaming?: string;
  datum_eerste_toelating?: string;
  brandstof_omschrijving?: string;
  aantal_cilinders?: string;
  cilinderinhoud?: string;
  massa_ledig_voertuig?: string;
  eerste_kleur?: string;
  type?: string;
  aantal_zitplaatsen?: string;
}

const AddCar = () => {
  const [loading, setLoading] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');
  const [searchResults, setSearchResults] = useState<RDWCarData | null>(null);
  const [customBrand, setCustomBrand] = useState('');
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel: 'Benzine',
    transmission: 'Handgeschakeld',
    color: '',
    description: '',
    features: '',
    status: 'Beschikbaar'
  });
  
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
    
    // Initialize cars in localStorage if not already present
    const savedCars = localStorage.getItem('cars');
    if (!savedCars) {
      localStorage.setItem('cars', JSON.stringify(initialCarsData));
    }
  }, [navigate, toast]);

  const searchLicensePlate = async () => {
    if (!licensePlate || licensePlate.length < 4) {
      toast({
        title: "Ongeldige invoer",
        description: "Voer een geldig kenteken in",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const formattedPlate = licensePlate.replace(/-/g, '').toUpperCase();
      const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${formattedPlate}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const carInfo = data[0];
        setSearchResults(carInfo);
        
        // Convert Dutch date format (YYYYMMDD) to year
        const yearString = carInfo.datum_eerste_toelating || '';
        const year = yearString ? parseInt(yearString.substring(0, 4)) : new Date().getFullYear();
        
        toast({
          title: "Auto gevonden!",
          description: `${carInfo.merk || ''} ${carInfo.handelsbenaming || ''}`,
        });
      } else {
        toast({
          title: "Geen resultaten",
          description: "Geen voertuig gevonden met dit kenteken",
          variant: "destructive",
        });
        setSearchResults(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Fout bij zoeken",
        description: "Er is een fout opgetreden bij het ophalen van voertuiggegevens",
        variant: "destructive",
      });
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to map RDW fuel types to our app's fuel types
  const mapRDWFuelType = (rdwFuel?: string): string => {
    if (!rdwFuel) return 'Benzine';
    
    const fuelLower = rdwFuel.toLowerCase();
    if (fuelLower.includes('benzine')) return 'Benzine';
    if (fuelLower.includes('diesel')) return 'Diesel';
    if (fuelLower.includes('elektr')) return 'Elektrisch';
    if (fuelLower.includes('hybr')) return 'Hybride';
    
    return 'Benzine'; // Default
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Get final brand based on selection
    const finalBrand = showCustomBrand && customBrand ? customBrand : formData.brand;
    
    try {
      // Get existing cars from localStorage
      const savedCarsJSON = localStorage.getItem('cars');
      const savedCars = savedCarsJSON ? JSON.parse(savedCarsJSON) : [];
      
      // Convert features string to array
      const featuresArray = formData.features
        .split('\n')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);
      
      // Create new car object
      const newCar = {
        id: savedCars.length > 0 ? Math.max(...savedCars.map((car: any) => car.id)) + 1 : 1,
        brand: finalBrand,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        mileage: formData.mileage,
        fuel: formData.fuel as 'Benzine' | 'Diesel' | 'Hybride' | 'Elektrisch',
        transmission: formData.transmission as 'Handgeschakeld' | 'Automatisch',
        color: formData.color,
        description: formData.description,
        features: featuresArray,
        status: formData.status as 'Beschikbaar' | 'Gereserveerd' | 'Verkocht',
        images: ['https://op-sourcecode.cdn.bcebos.com/source_code/projects/agentos/public/18023/20250821143652/placeholder.svg']
      };
      
      // Add new car to the array
      savedCars.push(newCar);
      
      // Save updated cars array to localStorage
      localStorage.setItem('cars', JSON.stringify(savedCars));
      
      toast({
        title: "Auto toegevoegd",
        description: `${finalBrand} ${formData.model} is succesvol toegevoegd.`,
      });
      
      navigate('/admin/cars');
    } catch (error) {
      console.error("Error saving car:", error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de auto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleBrandChange = (value: string) => {
    if (value === "other") {
      setShowCustomBrand(true);
      setFormData({
        ...formData,
        brand: ''
      });
    } else {
      setShowCustomBrand(false);
      setFormData({
        ...formData,
        brand: value
      });
    }
  };

  const applyAPIData = () => {
    if (!searchResults) return;
    
    // Convert Dutch date format (YYYYMMDD) to year
    const yearString = searchResults.datum_eerste_toelating || '';
    const year = yearString ? parseInt(yearString.substring(0, 4)) : new Date().getFullYear();

    // Handle brand - check if it's in our list or needs custom entry
    const foundBrand = searchResults.merk || '';
    const isBrandInList = brands.includes(foundBrand);
    
    if (!isBrandInList && foundBrand) {
      setShowCustomBrand(true);
      setCustomBrand(foundBrand);
    } else {
      setShowCustomBrand(false);
    }
    
    // Map the RDW fuel type to our app's fuel types
    const mappedFuel = mapRDWFuelType(searchResults.brandstof_omschrijving);
    
    setFormData({
      ...formData,
      brand: isBrandInList ? foundBrand : 'other',
      model: searchResults.handelsbenaming || '',
      year: year,
      fuel: mappedFuel,
      color: searchResults.eerste_kleur || '',
      description: `${searchResults.merk || ''} ${searchResults.handelsbenaming || ''}, ${searchResults.aantal_cilinders || ''} cilinders, ${searchResults.cilinderinhoud || ''} cc, ${searchResults.aantal_zitplaatsen || ''} zitplaatsen.`
    });
    
    toast({
      title: "Gegevens toegepast",
      description: "De API-gegevens zijn toegepast op het formulier",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Auto Toevoegen</h1>
            <p>Voeg een nieuwe auto toe aan de inventaris</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6">Kenteken Zoeken</h2>
                
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Kenteken (bijv. AB-12-CD)"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                  />
                  <Button 
                    onClick={searchLicensePlate} 
                    disabled={loading}
                    className="bg-dealership-primary hover:bg-blue-900"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Zoeken
                  </Button>
                </div>
                
                {searchResults && (
                  <div className="p-4 border rounded-md bg-gray-50 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium mb-2">Gevonden voertuiggegevens:</h3>
                        <p><strong>Merk:</strong> {searchResults.merk}</p>
                        <p><strong>Model:</strong> {searchResults.handelsbenaming}</p>
                        <p><strong>Eerste toelating:</strong> {searchResults.datum_eerste_toelating ? 
                          `${searchResults.datum_eerste_toelating?.substring(6, 8)}-${searchResults.datum_eerste_toelating?.substring(4, 6)}-${searchResults.datum_eerste_toelating?.substring(0, 4)}` 
                          : 'Onbekend'}</p>
                        <p><strong>Brandstof:</strong> {searchResults.brandstof_omschrijving}</p>
                        <p><strong>Kleur:</strong> {searchResults.eerste_kleur}</p>
                      </div>
                      <Button 
                        onClick={applyAPIData} 
                        className="bg-dealership-primary hover:bg-blue-900"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Toepassen
                      </Button>
                    </div>
                  </div>
                )}
                
                <Separator className="mb-6" />
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="brand">Merk</Label>
                      <Select 
                        value={formData.brand || "other"} 
                        onValueChange={handleBrandChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer merk" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Anders</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {showCustomBrand && (
                        <div className="mt-2">
                          <Label htmlFor="customBrand">Eigen merk</Label>
                          <Input
                            id="customBrand"
                            placeholder="Voer merknaam in"
                            value={customBrand}
                            onChange={(e) => setCustomBrand(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Bouwjaar</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => handleChange('year', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">价格 (¥)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange('price', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mileage">Kilometerstand</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="color">Kleur</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fuel">Brandstoftype</Label>
                      <Select 
                        value={formData.fuel} 
                        onValueChange={(value) => handleChange('fuel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer brandstof" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuels.map(fuel => (
                            <SelectItem key={fuel} value={fuel}>
                              {fuel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="transmission">Transmissie</Label>
                      <Select 
                        value={formData.transmission} 
                        onValueChange={(value) => handleChange('transmission', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer transmissie" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissions.map(transmission => (
                            <SelectItem key={transmission} value={transmission}>
                              {transmission}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beschikbaar">Beschikbaar</SelectItem>
                          <SelectItem value="Gereserveerd">Gereserveerd</SelectItem>
                          <SelectItem value="Verkocht">Verkocht</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Label htmlFor="features">Kenmerken (een per regel)</Label>
                    <Textarea
                      id="features"
                      rows={4}
                      placeholder="Airconditioning&#10;Cruise Control&#10;Navigatiesysteem&#10;etc."
                      value={formData.features}
                      onChange={(e) => handleChange('features', e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Label>Foto's</Label>
                    <div className="mt-2 p-6 border-2 border-dashed rounded-md text-center">
                      <p className="text-gray-500">Sleep foto's hierheen of klik om te uploaden</p>
                      <Button variant="outline" className="mt-2">Selecteer Bestanden</Button>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => navigate('/admin/cars')}>Annuleren</Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-dealership-primary hover:bg-blue-900"
                    >
                      {loading ? "Bezig met opslaan..." : "Opslaan"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddCar;
