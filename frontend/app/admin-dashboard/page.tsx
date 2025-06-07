'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/user/userSlice';
import { useRouter } from 'next/navigation';
import api from '@/lib/apis';
import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiTag, FiCreditCard, FiKey, FiShoppingCart, FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Define types for our data models
interface User {
  id: number;
  username: string;
  email: string;
  nom_complet: string;
  role: string;
  type: string;
  numero_telephone: string;
  adresse: string;
}

interface Category {
  id: number;
  nom: string;
  description: string;
}

interface Product {
  id: number;
  categorie: number;
  nom: string;
  description: string;
  validite: string;
  code_produit: string;
  image: string;
  prix_min: number;
  prix: number;
  prix_max: number;
}

interface PaymentMethod {
  id: number;
  nom: string;
  description: string;
}

interface Key {
  id: number;
  contenue: string;
  produit: number;
  disponiblite: boolean;
  code_cle: string;
}

interface Action {
  id: number;
  type: string;
  prix: number;
  date_action: string;
  livree: boolean;
  payee: boolean;
  client: number;
  vendeur: number | null;
  methode_paiement: number;
  code_action: string;
}

const AdminDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for data
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  // State for modals
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<any>(null);

  // Form data for different entities
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [paymentMethodForm, setPaymentMethodForm] = useState<Partial<PaymentMethod>>({});
  const [keyForm, setKeyForm] = useState<Partial<Key>>({});

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Accès non autorisé. Redirection vers la page de connexion.');
      router.push('/se-connecter');
    }
  }, [user, router]);

  // Fetch data based on active tab
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [activeTab, user]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response;

      switch (activeTab) {
        case 'users':
          // This endpoint might need to be created in the backend
          response = await api.get('/users/');
          setUsers(response.data);
          break;
        case 'categories':
          response = await api.get('/categories/');
          setCategories(response.data);
          break;
        case 'products':
          response = await api.get('/produits/');
          setProducts(response.data);
          break;
        case 'payment-methods':
          response = await api.get('/methode-paiement/');
          setPaymentMethods(response.data);
          break;
        case 'keys':
          // Fetch products first to ensure we have product data for displaying key information
          const productsResponse = await api.get('/produits/');
          setProducts(productsResponse.data);

          // Then fetch keys
          response = await api.get('/cles/');
          setKeys(response.data);
          break;
        case 'actions':
          // This endpoint might need to be created in the backend
          response = await api.get('/actions/');
          setActions(response.data);
          break;
      }

      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleAddItem = async () => {
    setModalType('add');
    setCurrentItem(null);

    // Reset form data based on active tab
    switch (activeTab) {
      case 'users':
        setUserForm({});
        break;
      case 'categories':
        setCategoryForm({});
        break;
      case 'products':
        setProductForm({});
        break;
      case 'payment-methods':
        setPaymentMethodForm({});
        break;
      case 'keys':
        setKeyForm({});
        // Ensure products are loaded for the dropdown
        if (products.length === 0) {
          try {
            const response = await api.get('/produits/');
            setProducts(response.data);
          } catch (err) {
            console.error('Error loading products:', err);
            toast.error('Erreur lors du chargement des produits');
          }
        }
        break;
    }

    setShowModal(true);
  };

  const handleEditItem = async (item: any) => {
    setModalType('edit');
    setCurrentItem(item);

    // Set form data based on active tab and selected item
    switch (activeTab) {
      case 'users':
        setUserForm(item);
        break;
      case 'categories':
        setCategoryForm(item);
        break;
      case 'products':
        setProductForm(item);
        break;
      case 'payment-methods':
        setPaymentMethodForm(item);
        break;
      case 'keys':
        setKeyForm(item);
        // Ensure products are loaded for the dropdown
        if (products.length === 0) {
          try {
            const response = await api.get('/produits/');
            setProducts(response.data);
          } catch (err) {
            console.error('Error loading products:', err);
            toast.error('Erreur lors du chargement des produits');
          }
        }
        break;
    }

    setShowModal(true);
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }

    setIsLoading(true);

    try {
      switch (activeTab) {
        case 'users':
          // This endpoint might need to be created in the backend
          await api.delete(`/users/${id}/`);
          setUsers(users.filter(user => user.id !== id));
          break;
        case 'categories':
          await api.delete(`/categories/${id}/`);
          setCategories(categories.filter(category => category.id !== id));
          break;
        case 'products':
          await api.delete(`/produits/${id}/`);
          setProducts(products.filter(product => product.id !== id));
          break;
        case 'payment-methods':
          await api.delete(`/methode-paiement/${id}/`);
          setPaymentMethods(paymentMethods.filter(method => method.id !== id));
          break;
        case 'keys':
          await api.delete(`/cles/${id}/`);
          setKeys(keys.filter(key => key.id !== id));
          break;
      }

      toast.success('Élément supprimé avec succès');
      setIsLoading(false);
    } catch (err) {
      toast.error('Erreur lors de la suppression');
      setIsLoading(false);
      console.error(err);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const parsedValue = type === 'number' ? parseFloat(value) : value;

    switch (activeTab) {
      case 'users':
        setUserForm({ ...userForm, [name]: parsedValue });
        break;
      case 'categories':
        setCategoryForm({ ...categoryForm, [name]: parsedValue });
        break;
      case 'products':
        setProductForm({ ...productForm, [name]: parsedValue });
        break;
      case 'payment-methods':
        setPaymentMethodForm({ ...paymentMethodForm, [name]: parsedValue });
        break;
      case 'keys':
        setKeyForm({ ...keyForm, [name]: parsedValue });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response;

      switch (activeTab) {
        case 'users':
          if (modalType === 'add') {
            // This endpoint might need to be created in the backend
            response = await api.post('/users/', userForm);
            setUsers([...users, response.data]);
          } else {
            // This endpoint might need to be created in the backend
            response = await api.put(`/users/${currentItem.id}/`, userForm);
            setUsers(users.map(u => u.id === currentItem.id ? response.data : u));
          }
          break;
        case 'categories':
          if (modalType === 'add') {
            response = await api.post('/categories/', categoryForm);
            setCategories([...categories, response.data]);
          } else {
            response = await api.put(`/categories/${currentItem.id}/`, categoryForm);
            setCategories(categories.map(c => c.id === currentItem.id ? response.data : c));
          }
          break;
        case 'products':
          if (modalType === 'add') {
            response = await api.post('/produits/', productForm);
            setProducts([...products, response.data]);
          } else {
            response = await api.put(`/produits/${currentItem.id}/`, productForm);
            setProducts(products.map(p => p.id === currentItem.id ? response.data : p));
          }
          break;
        case 'payment-methods':
          if (modalType === 'add') {
            response = await api.post('/methode-paiement/', paymentMethodForm);
            setPaymentMethods([...paymentMethods, response.data]);
          } else {
            response = await api.put(`/methode-paiement/${currentItem.id}/`, paymentMethodForm);
            setPaymentMethods(paymentMethods.map(m => m.id === currentItem.id ? response.data : m));
          }
          break;
        case 'keys':
          if (modalType === 'add') {
            response = await api.post('/cles/', keyForm);
            setKeys([...keys, response.data]);
          } else {
            response = await api.put(`/cles/${currentItem.id}/`, keyForm);
            setKeys(keys.map(k => k.id === currentItem.id ? response.data : k));
          }
          break;
      }

      toast.success(modalType === 'add' ? 'Élément ajouté avec succès' : 'Élément modifié avec succès');
      setShowModal(false);
      setIsLoading(false);
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
      setIsLoading(false);
      console.error(err);
    }
  };

  // Render form based on active tab
  const renderForm = () => {
    switch (activeTab) {
      case 'users':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input
                type="text"
                name="username"
                value={userForm.username || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={userForm.email || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input
                type="text"
                name="nom_complet"
                value={userForm.nom_complet || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                name="role"
                value={userForm.role || 'client'}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="client">Client</option>
                <option value="vendeur">Vendeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                value={userForm.type || 'particulier'}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
              <input
                type="text"
                name="numero_telephone"
                value={userForm.numero_telephone || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={userForm.adresse || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            {modalType === 'add' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  onChange={handleFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required={modalType === 'add'}
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Chargement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </form>
        );
      case 'categories':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={categoryForm.nom || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={categoryForm.description || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Chargement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </form>
        );
      case 'products':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={productForm.nom || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={productForm.description || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <select
                name="categorie"
                value={productForm.categorie || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Validité</label>
              <select
                name="validite"
                value={productForm.validite || '1 ans'}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="1 ans">1 ans</option>
                <option value="2 ans">2 ans</option>
                <option value="3 ans">3 ans</option>
                <option value="a vie">À vie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix minimum</label>
              <input
                type="number"
                name="prix_min"
                value={productForm.prix_min || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix</label>
              <input
                type="number"
                name="prix"
                value={productForm.prix || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix maximum</label>
              <input
                type="number"
                name="prix_max"
                value={productForm.prix_max || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Chargement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </form>
        );
      case 'payment-methods':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="nom"
                value={paymentMethodForm.nom || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={paymentMethodForm.description || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Chargement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </form>
        );
      case 'keys':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contenu</label>
              <input
                type="text"
                name="contenue"
                value={keyForm.contenue || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Produit</label>
              <select
                name="produit"
                value={keyForm.produit || ''}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Sélectionner un produit</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
              <select
                name="disponiblite"
                value={keyForm.disponiblite ? 'true' : 'false'}
                onChange={handleFormChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="true">Disponible</option>
                <option value="false">Non disponible</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading ? 'Chargement...' : modalType === 'add' ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  // Render table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case 'users':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d'utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom complet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.nom_complet}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'vendeur' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FiEdit className="inline" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteItem(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'categories':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{category.nom}</td>
                  <td className="px-6 py-4">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FiEdit className="inline" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteItem(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'products':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.prix} €</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {categories.find(c => c.id === product.categorie)?.nom || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.code_produit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(product)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FiEdit className="inline" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteItem(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'payment-methods':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentMethods.map(method => (
                <tr key={method.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{method.nom}</td>
                  <td className="px-6 py-4">{method.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(method)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FiEdit className="inline" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteItem(method.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'keys':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keys.map(key => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{key.contenue.substring(0, 4)}****</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {products.find(p => p.id === key.produit)?.nom || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      key.disponiblite ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {key.disponiblite ? 'Disponible' : 'Non disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{key.code_cle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditItem(key)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <FiEdit className="inline" /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteItem(key.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="inline" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'actions':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actions.map(action => (
                <tr key={action.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{action.code_action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      action.type === 'achat' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {action.type === 'achat' ? 'Achat' : 'Devis'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{action.prix} €</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(action.date_action).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {users.find(u => u.id === action.client)?.nom_complet || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      action.payee ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {action.payee ? 'Payé' : 'Non payé'}
                    </span>
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      action.livree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {action.livree ? 'Livré' : 'Non livré'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };

  // If user is not admin, show loading or redirect
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Chargement...</h1>
          <p className="mt-2 text-gray-600">Vérification des autorisations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord administrateur</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiUsers className="inline mr-2" /> Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiTag className="inline mr-2" /> Catégories
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiPackage className="inline mr-2" /> Produits
          </button>
          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`${
              activeTab === 'payment-methods'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiCreditCard className="inline mr-2" /> Méthodes de paiement
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`${
              activeTab === 'keys'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiKey className="inline mr-2" /> Clés
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`${
              activeTab === 'actions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiShoppingCart className="inline mr-2" /> Transactions
          </button>
        </nav>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Add button (not for actions tab) */}
      {activeTab !== 'actions' && (
        <div className="mb-4">
          <button
            onClick={handleAddItem}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <FiPlus className="mr-2" /> Ajouter
          </button>
        </div>
      )}

      {/* Data table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des données...</p>
            </div>
          ) : (
            renderTable()
          )}
        </div>
      </div>

      {/* Modal for add/edit */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {modalType === 'add' ? 'Ajouter un nouvel élément' : 'Modifier l\'élément'}
                  </h3>
                  <div className="mt-4">
                    {renderForm()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
