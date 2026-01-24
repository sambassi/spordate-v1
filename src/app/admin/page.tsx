'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Euro,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  TrendingUp,
  DollarSign,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';

interface Partner {
  id: string;
  name: string;
  address: string;
  city: string;
  type: string;
  photoUrl?: string;
  mapsUrl?: string;
  priceSolo: number;
  priceDuo: number;
  active: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
  _count: {
    bookings: number;
  };
}

interface Booking {
  id: string;
  profileName: string;
  partnerName: string | null;
  ticketType: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  user: {
    email: string | null;
    name: string | null;
  };
}

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalPartners: number;
}

export default function AdminDashboardPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalPartners: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Partner form state
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    address: '',
    city: '',
    type: 'gym',
    photoUrl: '',
    mapsUrl: '',
    priceSolo: 25,
    priceDuo: 50,
  });

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPartners(),
        loadUsers(),
        loadBookings(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      const response = await fetch('/api/admin/partners');
      if (!response.ok) throw new Error('Failed to fetch partners');
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error('Error loading partners:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' }),
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Partner CRUD operations
  const handleSavePartner = async () => {
    try {
      const url = '/api/admin/partners';
      const method = editingPartner ? 'PUT' : 'POST';
      const body = editingPartner
        ? { ...partnerForm, id: editingPartner.id }
        : partnerForm;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save partner');

      toast.success(
        editingPartner
          ? 'Partenaire mis à jour avec succès'
          : 'Partenaire créé avec succès'
      );

      setShowPartnerDialog(false);
      resetPartnerForm();
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Erreur lors de la sauvegarde du partenaire');
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setPartnerForm({
      name: partner.name,
      address: partner.address,
      city: partner.city,
      type: partner.type,
      photoUrl: partner.photoUrl || '',
      mapsUrl: partner.mapsUrl || '',
      priceSolo: partner.priceSolo,
      priceDuo: partner.priceDuo,
    });
    setShowPartnerDialog(true);
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    try {
      const response = await fetch(`/api/admin/partners?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete partner');

      toast.success('Partenaire supprimé avec succès');
      loadPartners();
      loadStats();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Erreur lors de la suppression du partenaire');
    }
  };

  const handleTogglePartnerActive = async (partner: Partner) => {
    try {
      const response = await fetch('/api/admin/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partner.id,
          active: !partner.active,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle partner status');

      toast.success(
        partner.active
          ? 'Partenaire désactivé'
          : 'Partenaire activé'
      );
      loadPartners();
    } catch (error) {
      console.error('Error toggling partner:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const resetPartnerForm = () => {
    setEditingPartner(null);
    setPartnerForm({
      name: '',
      address: '',
      city: '',
      type: 'gym',
      photoUrl: '',
      mapsUrl: '',
      priceSolo: 25,
      priceDuo: 50,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard Administrateur</h1>
        <p className="text-muted-foreground">
          Gérez votre application Spordateur
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total des réservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              Chiffre d'affaires total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Membres inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partenaires</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">
              Salles partenaires
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">Partenaires</TabsTrigger>
          <TabsTrigger value="bookings">Réservations</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestion des Partenaires</CardTitle>
                  <CardDescription>
                    Ajoutez et gérez les salles partenaires
                  </CardDescription>
                </div>
                <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={resetPartnerForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une salle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                      </DialogTitle>
                      <DialogDescription>
                        Remplissez les informations de la salle partenaire
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom de la salle *</Label>
                          <Input
                            id="name"
                            value={partnerForm.name}
                            onChange={(e) =>
                              setPartnerForm({ ...partnerForm, name: e.target.value })
                            }
                            placeholder="Artboost Paris"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Ville *</Label>
                          <Input
                            id="city"
                            value={partnerForm.city}
                            onChange={(e) =>
                              setPartnerForm({ ...partnerForm, city: e.target.value })
                            }
                            placeholder="Paris"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse complète *</Label>
                        <Input
                          id="address"
                          value={partnerForm.address}
                          onChange={(e) =>
                            setPartnerForm({ ...partnerForm, address: e.target.value })
                          }
                          placeholder="123 Rue de la Paix, 75001 Paris"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priceSolo">Prix Solo (€)</Label>
                          <Input
                            id="priceSolo"
                            type="number"
                            step="0.01"
                            value={partnerForm.priceSolo}
                            onChange={(e) =>
                              setPartnerForm({
                                ...partnerForm,
                                priceSolo: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priceDuo">Prix Duo (€)</Label>
                          <Input
                            id="priceDuo"
                            type="number"
                            step="0.01"
                            value={partnerForm.priceDuo}
                            onChange={(e) =>
                              setPartnerForm({
                                ...partnerForm,
                                priceDuo: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="photoUrl">URL de la photo</Label>
                        <Input
                          id="photoUrl"
                          value={partnerForm.photoUrl}
                          onChange={(e) =>
                            setPartnerForm({ ...partnerForm, photoUrl: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mapsUrl">URL Google Maps</Label>
                        <Input
                          id="mapsUrl"
                          value={partnerForm.mapsUrl}
                          onChange={(e) =>
                            setPartnerForm({ ...partnerForm, mapsUrl: e.target.value })
                          }
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPartnerDialog(false);
                          resetPartnerForm();
                        }}
                      >
                        Annuler
                      </Button>
                      <Button onClick={handleSavePartner}>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Prix Solo</TableHead>
                    <TableHead>Prix Duo</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.city}</TableCell>
                      <TableCell>
                        {partner.priceSolo === 0 ? (
                          <Badge variant="secondary">GRATUIT</Badge>
                        ) : (
                          `${partner.priceSolo}€`
                        )}
                      </TableCell>
                      <TableCell>
                        {partner.priceDuo === 0 ? (
                          <Badge variant="secondary">GRATUIT</Badge>
                        ) : (
                          `${partner.priceDuo}€`
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={partner.active}
                          onCheckedChange={() => handleTogglePartnerActive(partner)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPartner(partner)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePartner(partner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Réservations</CardTitle>
              <CardDescription>
                Toutes les réservations effectuées sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Profil</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {booking.user.name || booking.user.email || 'Anonyme'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {booking.profileName}
                      </TableCell>
                      <TableCell>{booking.partnerName || 'Non spécifié'}</TableCell>
                      <TableCell>
                        <Badge variant={booking.ticketType === 'duo' ? 'default' : 'secondary'}>
                          {booking.ticketType === 'duo' ? 'Duo' : 'Solo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.amount === 0 ? (
                          <Badge variant="secondary">GRATUIT</Badge>
                        ) : (
                          `${booking.amount}€`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.paymentStatus === 'paid'
                              ? 'default'
                              : booking.paymentStatus === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>
                Liste de tous les utilisateurs inscrits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Réservations</TableHead>
                    <TableHead>Date d'inscription</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email || 'Non renseigné'}
                      </TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count.bookings}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
