import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Car, cars as initialCarsData, fuels, transmissions, brands } from '@/data/cars';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminNav from '@/components/Admin/AdminNav';
import ImageEditor from '@/components/Admin/ImageEditor';
import { Search, Plus, Edit, Trash2, Image, CarFront, Check, X } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface CarFormData {
  id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: '汽油' | '柴油' | '混合动力' | '电动';
  transmission: '手动' | '自动';
  color: string;
  description: string;
  features: string;
  status: '可用' | '已预订' | '已售出';
  images: string[];
  customBrand?: string;
}

const ManageCars = () => {
  const [carsList, setCarsList] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editCar, setEditCar] = useState<CarFormData | null>(null);
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const openImageEditor = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setIsImageEditorOpen(true);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      toast({
        title: "访问被拒绝",
        description: "您必须登录才能访问此页面。",
        variant: "destructive",
      });
      navigate('/admin/login');
    }

    const savedCarsJSON = localStorage.getItem('cars');
    if (savedCarsJSON) {
      try {
        const savedCars = JSON.parse(savedCarsJSON);
        setCarsList(savedCars);
      } catch (error) {
        console.error("Error loading cars:", error);
        localStorage.setItem('cars', JSON.stringify(initialCarsData));
        setCarsList(initialCarsData);
      }
    } else {
      localStorage.setItem('cars', JSON.stringify(initialCarsData));
      setCarsList(initialCarsData);
    }
  }, [navigate, toast]);

  const filteredCars = carsList.filter(car => {
    const term = searchTerm.toLowerCase();
    return (
      car.brand.toLowerCase().includes(term) ||
      car.model.toLowerCase().includes(term) ||
      car.year.toString().includes(term)
    );
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openEditDialog = (car: Car) => {
    const initialBrandInList = brands.includes(car.brand);
    
    setEditCar({
      ...car,
      features: Array.isArray(car.features) ? car.features.join('\n') : '',
      customBrand: initialBrandInList ? '' : car.brand
    });
    
    setShowCustomBrand(!initialBrandInList);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (car: Car) => {
    setEditCar({
      ...car,
      features: Array.isArray(car.features) ? car.features.join('\n') : ''
    });
    setIsDeleteDialogOpen(true);
  };

  const handleChange = (field: string, value: any) => {
    if (editCar) {
      setEditCar({
        ...editCar,
        [field]: value
      });
    }
  };

  const handleBrandChange = (value: string) => {
    if (value === "other") {
      setShowCustomBrand(true);
      if (editCar) {
        setEditCar({
          ...editCar,
          brand: ''
        });
      }
    } else {
      setShowCustomBrand(false);
      if (editCar) {
        setEditCar({
          ...editCar,
          brand: value,
          customBrand: ''
        });
      }
    }
  };

  const handleSave = () => {
    if (!editCar) return;
    
    setIsProcessing(true);
    
    try {
      const finalBrand = showCustomBrand && editCar.customBrand ? editCar.customBrand : editCar.brand;
      const processedFeatures = typeof editCar.features === 'string' 
        ? editCar.features.split('\n').filter(line => line.trim() !== '')
        : editCar.features;
      
      const updatedCar: Car = {
        ...editCar,
        brand: finalBrand,
        features: processedFeatures,
        id: editCar.id || Math.floor(Math.random() * 1000)
      };
      
      const updatedCarsList = [...carsList];
      const index = updatedCarsList.findIndex(c => c.id === updatedCar.id);
      
      if (index !== -1) {
        updatedCarsList[index] = updatedCar;
      } else {
        updatedCarsList.push(updatedCar);
      }
      
      setCarsList(updatedCarsList);
      localStorage.setItem('cars', JSON.stringify(updatedCarsList));
      
      toast({
        title: "汽车已保存",
        description: `${updatedCar.brand} ${updatedCar.model} 已成功保存。`,
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error saving car:", error);
      toast({
        title: "保存时出错",
        description: "保存汽车时发生错误。",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    if (!editCar?.id) return;
    
    setIsProcessing(true);
    
    try {
      const updatedCarsList = carsList.filter(car => car.id !== editCar.id);
      
      setCarsList(updatedCarsList);
      localStorage.setItem('cars', JSON.stringify(updatedCarsList));
      
      toast({
        title: "汽车已删除",
        description: `${editCar.brand} ${editCar.model} 已成功删除。`,
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting car:", error);
      toast({
        title: "删除时出错",
        description: "删除汽车时发生错误。",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEditedImage = (editedImage: string) => {
    if (!editCar) return;
    
    const updatedImages = [...editCar.images];
    updatedImages[currentImageIndex] = editedImage;
    
    setEditCar({
      ...editCar,
      images: updatedImages
    });
    
    setIsImageEditorOpen(false);
    
    toast({
      title: "Afbeelding opgeslagen",
      description: "De bewerkte afbeelding is opgeslagen.",
    });
  };

  const handleAddNewImage = () => {
    if (!editCar) return;
    
    const newImage = "https://placehold.co/600x400";
    
    setEditCar({
      ...editCar,
      images: [...editCar.images, newImage]
    });
    
    openImageEditor(newImage, editCar.images.length);
  };

  const handleRemoveImage = (index: number) => {
    if (!editCar) return;
    
    const updatedImages = [...editCar.images];
    updatedImages.splice(index, 1);
    
    setEditCar({
      ...editCar,
      images: updatedImages
    });
    
    toast({
      title: "Afbeelding verwijderd",
      description: "De afbeelding is verwijderd.",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '可用':
        return <Badge className="bg-green-500">可用</Badge>;
      case '已预订':
        return <Badge className="bg-yellow-500">已预订</Badge>;
      case '已售出':
        return <Badge className="bg-red-500">已售出</Badge>;
      default:
        return <Badge>未知</Badge>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <section className="bg-dealership-primary text-white py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold">Auto's Beheren</h1>
            <p>Bekijk, bewerk en verwijder auto's in de database</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <AdminNav />
            
            <div className="flex-1">
              <Card>
                <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <CardTitle>Auto's Overzicht</CardTitle>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Zoeken..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    <Button 
                      className="bg-dealership-primary hover:bg-blue-900"
                      onClick={() => navigate('/admin/add-car')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Auto Toevoegen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Merk & Model</TableHead>
                          <TableHead>Bouwjaar</TableHead>
                          <TableHead>Prijs</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Acties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCars.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10">
                              <div className="flex flex-col items-center space-y-2">
                                <CarFront className="h-10 w-10 text-gray-400" />
                                <p className="text-gray-500">Geen auto's gevonden</p>
                                {searchTerm && (
                                  <Button variant="ghost" onClick={() => setSearchTerm('')}>
                                    Wis zoekopdracht
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCars.map((car) => (
                            <TableRow key={car.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                    <img 
                                      src={car.images[0]} 
                                      alt={`${car.brand} ${car.model}`} 
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-medium">{car.brand}</div>
                                    <div className="text-sm text-gray-500">{car.model}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{car.year}</TableCell>
                              <TableCell>{formatPrice(car.price)}</TableCell>
                              <TableCell>{getStatusBadge(car.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => openEditDialog(car)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => openDeleteDialog(car)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auto Bewerken</DialogTitle>
          </DialogHeader>
          {editCar && (
            <div>
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="images">Afbeeldingen</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="brand">Merk</Label>
                      <Select 
                        value={showCustomBrand ? "other" : editCar.brand}
                        onValueChange={handleBrandChange}
                      >
                        <SelectTrigger id="brand">
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
                            value={editCar.customBrand || ''}
                            onChange={(e) => handleChange('customBrand', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={editCar.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Bouwjaar</Label>
                      <Input
                        id="year"
                        type="number"
                        value={editCar.year}
                        onChange={(e) => handleChange('year', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">价格 (¥)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editCar.price}
                        onChange={(e) => handleChange('price', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mileage">Kilometerstand</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={editCar.mileage}
                        onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="color">Kleur</Label>
                      <Input
                        id="color"
                        value={editCar.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fuel">Brandstoftype</Label>
                      <Select 
                        value={editCar.fuel}
                        onValueChange={(value) => handleChange('fuel', value)}
                      >
                        <SelectTrigger id="fuel">
                          <SelectValue placeholder="Selecteer brandstof" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="汽油">汽油</SelectItem>
                          <SelectItem value="柴油">柴油</SelectItem>
                          <SelectItem value="混合动力">混合动力</SelectItem>
                          <SelectItem value="电动">电动</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="transmission">Transmissie</Label>
                      <Select 
                        value={editCar.transmission}
                        onValueChange={(value) => handleChange('transmission', value)}
                      >
                        <SelectTrigger id="transmission">
                          <SelectValue placeholder="Selecteer transmissie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="手动">手动</SelectItem>
                          <SelectItem value="自动">自动</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={editCar.status}
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Selecteer status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="可用">可用</SelectItem>
                          <SelectItem value="已预订">已预订</SelectItem>
                          <SelectItem value="已售出">已售出</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={editCar.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="features">Kenmerken (een per regel)</Label>
                    <Textarea
                      id="features"
                      rows={4}
                      value={editCar.features}
                      onChange={(e) => handleChange('features', e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="images" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {editCar.images.map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group">
                        <img 
                          src={image} 
                          alt={`Auto afbeelding ${index + 1}`} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => openImageEditor(image, index)}
                            className="bg-dealership-primary hover:bg-blue-900"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Bewerken
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Verwijderen
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gray-800/70">{index + 1}</Badge>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      className="h-48 border-dashed border-2 flex flex-col items-center justify-center"
                      onClick={handleAddNewImage}
                    >
                      <Plus className="h-10 w-10 mb-2 text-gray-400" />
                      <span>Afbeelding Toevoegen</span>
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-4">
                    <p>Tip: De eerste afbeelding wordt gebruikt als hoofdafbeelding in overzichten.</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isProcessing}
                >
                  Annuleren
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="bg-dealership-primary hover:bg-blue-900"
                >
                  {isProcessing ? "Bezig met opslaan..." : "Opslaan"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Auto Verwijderen</DialogTitle>
          </DialogHeader>
          
          {editCar && (
            <div>
              <div className="py-4">
                <p className="mb-4">
                  Weet u zeker dat u de volgende auto wilt verwijderen?
                </p>
                
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={editCar.images[0]} 
                      alt={`${editCar.brand} ${editCar.model}`} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{editCar.brand} {editCar.model}</div>
                    <div className="text-sm text-gray-500">{editCar.year} - {formatPrice(editCar.price)}</div>
                  </div>
                </div>
                
                <p className="mt-4 text-red-600">
                  Deze actie kan niet ongedaan worden gemaakt!
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isProcessing}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuleren
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isProcessing ? "Bezig met verwijderen..." : "Verwijderen"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isImageEditorOpen} onOpenChange={setIsImageEditorOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5" />
              Afbeelding Bewerken
            </DialogTitle>
          </DialogHeader>
          
          <ImageEditor
            imageUrl={selectedImage || undefined}
            onSave={handleSaveEditedImage}
            onCancel={() => setIsImageEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function ManageCarsWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ManageCars />
    </ErrorBoundary>
  );
}
