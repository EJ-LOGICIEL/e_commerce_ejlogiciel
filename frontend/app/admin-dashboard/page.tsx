'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/user/userSlice';
import { useRouter } from 'next/navigation';
import api from '@/lib/apis';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
    ActionElementDetail,
    ActionHistory, CurrentItem,
    TypeCategorie,
    TypeCle,
    TypeElementAchatDevis,
    TypeMethodePaiement,
    TypeProduit,
    UserState
} from '@/utils/types';
import { AxiosResponse } from "axios";

// Import components
import TabNavigation from './components/TabNavigation';
import SalesStats from './components/SalesStats';
import FormModal from './components/FormModal';
import ProductModal from './components/ProductModal';
import UserForm from './components/UserForm';
import CategoryForm from './components/CategoryForm';
import ProductForm from './components/ProductForm';
import PaymentMethodForm from './components/PaymentMethodForm';
import KeyForm from './components/KeyForm';
import ActionForm from './components/ActionForm';
import UsersTable from './components/UsersTable';
import CategoriesTable from './components/CategoriesTable';
import ProductsTable from './components/ProductsTable';
import PaymentMethodsTable from './components/PaymentMethodsTable';
import KeysTable from './components/KeysTable';
import ActionsTable from './components/ActionsTable';

const AdminDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('users');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for data
    const [users, setUsers] = useState<UserState[]>([]);
    const [categories, setCategories] = useState<TypeCategorie[]>([]);
    const [products, setProducts] = useState<TypeProduit[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<TypeMethodePaiement[]>([]);
    const [keys, setKeys] = useState<TypeCle[]>([]);
    const [actions, setActions] = useState<Partial<ActionHistory>[]>([]);
    const [elementsAchatDevis, setElementsAchatDevis] = useState<TypeElementAchatDevis[]>([]);

    const [salesStats, setSalesStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        paidSales: 0,
        unpaidSales: 0,
        deliveredSales: 0,
        undeliveredSales: 0
    });

    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [currentItem, setCurrentItem] = useState<CurrentItem | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [productToAdd, setProductToAdd] = useState<{ produit_id: number, quantite: number }>({
        produit_id: 0,
        quantite: 1
    });

    // Form data for different entities
    const [userForm, setUserForm] = useState<Partial<UserState>>({});
    const [categoryForm, setCategoryForm] = useState<Partial<TypeCategorie>>({});
    const [productForm, setProductForm] = useState<Partial<TypeProduit>>({});
    const [productImage, setProductImage] = useState<File | null>(null);
    const [paymentMethodForm, setPaymentMethodForm] = useState<Partial<TypeMethodePaiement>>({});
    const [keyForm, setKeyForm] = useState<Partial<TypeCle>>({});
    const [actionForm, setActionForm] = useState<Partial<ActionHistory>>({});
    const [actionProductsForm, setActionProductsForm] = useState<ActionElementDetail[]>([]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('Accès non autorisé. Redirection vers la page de connexion.');
            router.push('/se-connecter');
        }
    }, [user, router]);

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
                    const productsResponse = await api.get('/produits/');
                    setProducts(productsResponse.data);

                    response = await api.get('/cles/');
                    setKeys(response.data);
                    break;
                case 'actions':
                    response = await api.get('/actions/');
                    const actionsData = response.data;
                    setActions(actionsData);

                    const purchaseActions: Partial<ActionHistory>[] = actionsData.filter((action: Partial<ActionHistory>) => action.type === 'achat');
                    const totalSales = purchaseActions.length;
                    const totalRevenue = purchaseActions.reduce((sum: number, action: Partial<ActionHistory>) => {
                        const prix = action.prix ?? 0; // si prix est undefined, on met 0
                        return sum + prix;
                    }, 0);

                    const paidSales = purchaseActions.filter((action) => action.payee).length;
                    const unpaidSales = totalSales - paidSales;
                    const deliveredSales = purchaseActions.filter((action) => action.livree).length;
                    const undeliveredSales = totalSales - deliveredSales;

                    setSalesStats({
                        totalSales,
                        totalRevenue,
                        paidSales,
                        unpaidSales,
                        deliveredSales,
                        undeliveredSales
                    });

                    if (products.length === 0) {
                        try {
                            const productsResponse = await api.get('/produits/');
                            setProducts(productsResponse.data);
                        } catch (err) {
                            console.error('Error loading products:', err);
                        }
                    }

                    // Fetch elements for actions
                    try {
                        const elementsResponse = await api.get('/elements/');
                        setElementsAchatDevis(elementsResponse.data);
                    } catch (err) {
                        console.error('Error loading elements:', err);
                    }
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

        switch (activeTab) {
            case 'users':
                setUserForm({});
                break;
            case 'categories':
                setCategoryForm({});
                break;
            case 'products':
                setProductForm({});
                setProductImage(null);
                break;
            case 'payment-methods':
                setPaymentMethodForm({});
                break;
            case 'keys':
                setKeyForm({});
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
            case 'actions':
                setActionForm({
                    type: 'achat',
                    prix: 0,
                    livree: false,
                    payee: false,
                });
                setActionProductsForm([]);

                if (users.length === 0) {
                    try {
                        const response = await api.get('/users/');
                        setUsers(response.data);
                    } catch (err) {
                        console.error('Error loading users:', err);
                        toast.error('Erreur lors du chargement des utilisateurs');
                    }
                }
                if (paymentMethods.length === 0) {
                    try {
                        const response = await api.get('/methode-paiement/');
                        setPaymentMethods(response.data);
                    } catch (err) {
                        console.error('Error loading payment methods:', err);
                        toast.error('Erreur lors du chargement des méthodes de paiement');
                    }
                }
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

    const handleEditItem = async (item: Partial<UserState> | Partial<TypeCategorie> | Partial<TypeProduit> | Partial<TypeMethodePaiement> | Partial<TypeCle> | Partial<ActionHistory>) => {
        setModalType('edit');
        setCurrentItem(item as CurrentItem);

        switch (activeTab) {
            case 'users':
                setUserForm(item as Partial<UserState>);
                break;
            case 'categories':
                setCategoryForm(item as Partial<TypeCategorie>);
                break;
            case 'products':
                setProductForm(item as Partial<TypeProduit>);
                setProductImage(null);
                break;
            case 'payment-methods':
                setPaymentMethodForm(item as Partial<TypeMethodePaiement>);
                break;
            case 'keys':
                setKeyForm(item as Partial<TypeCle>);
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
            case 'actions':
                const actionItem = item as Partial<ActionHistory>;
                setActionForm(actionItem);

                if (actionItem.elements_details) {
                    setActionProductsForm(actionItem.elements_details);
                } else {
                    const actionElements = elementsAchatDevis.filter(element => element.action === actionItem.id);
                    const formattedElements = actionElements.map(element => {
                        const product = products.find(p => p.id === element.produit);
                        return {
                            id: element.id,
                            produit_id: element.produit,
                            produit_nom: product ? product.nom : 'Produit inconnu',
                            quantite: element.quantite,
                            prix_total: element.prix_total,
                            prix_unitaire: product ? product.prix : 0
                        };
                    });
                    setActionProductsForm(formattedElements);
                }

                if (users.length === 0) {
                    try {
                        const response = await api.get('/users/');
                        setUsers(response.data);
                    } catch {
                    }
                }
                if (paymentMethods.length === 0) {
                    try {
                        const response = await api.get('/methode-paiement/');
                        setPaymentMethods(response.data);
                    } catch (err) {
                        console.error('Error loading payment methods:', err);
                        toast.error('Erreur lors du chargement des méthodes de paiement');
                    }
                }

                if (products.length === 0) {
                    try {
                        const response = await api.get('/produits/');
                        setProducts(response.data);
                    } catch {
                    }
                }
                break;
        }

        setShowModal(true);
    };

    const handleDeleteItem = async (id?: number) => {
        if (id === undefined) return;
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
                case 'actions':
                    await api.delete(`/actions/${id}/`);
                    setActions(actions.filter(action => action.id !== id));
                    break;
            }

            toast.success('Élément supprimé avec succès');
            setIsLoading(false);
        } catch {
            setIsLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target as HTMLInputElement;
        const parsedValue = type === 'number' ? parseFloat(value) :
            type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        switch (activeTab) {
            case 'users':
                setUserForm({...userForm, [name]: parsedValue});
                break;
            case 'categories':
                setCategoryForm({...categoryForm, [name]: parsedValue});
                break;
            case 'products':
                setProductForm({...productForm, [name]: parsedValue});
                break;
            case 'payment-methods':
                setPaymentMethodForm({...paymentMethodForm, [name]: parsedValue});
                break;
            case 'keys':
                setKeyForm({...keyForm, [name]: parsedValue});
                break;
            case 'actions':
                setActionForm({...actionForm, [name]: parsedValue});
                break;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setProductImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let response: AxiosResponse;

            switch (activeTab) {
                case 'users':
                    if (modalType === 'add') {
                        // This endpoint might need to be created in the backend
                        response = await api.post('/users/', userForm);
                        setUsers([...users, response.data]);
                    } else {
                        if (currentItem){
                            // This endpoint might need to be created in the backend
                            response = await api.put(`/users/${currentItem.id}/`, userForm);
                            setUsers(users.map(u => u.id === currentItem.id ? response.data : u));
                        }
                    }
                    break;
                case 'categories':
                    if (modalType === 'add') {
                        response = await api.post('/categories/', categoryForm);
                        setCategories([...categories, response.data]);
                    } else {
                        if (currentItem){
                            response = await api.put(`/categories/${currentItem.id}/`, categoryForm);
                            setCategories(categories.map(c => c.id === currentItem.id ? response.data : c));
                        }
                    }
                    break;
                case 'products':
                    if (modalType === 'add' || productImage) {
                        // Use FormData for file uploads
                        const formData = new FormData();

                        // Add all product form fields to FormData
                        Object.entries(productForm).forEach(([key, value]) => {
                            if (value !== undefined && value !== null) {
                                // Handle categorie specially if it's an object
                                if (key === 'categorie' && typeof value === 'object') {
                                    formData.append(key, value.id.toString());
                                } else {
                                    formData.append(key, value.toString());
                                }
                            }
                        });

                        if (productImage) {
                            formData.append('image', productImage);
                        }

                        if (modalType === 'add') {
                            response = await api.post('/produits/', formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });
                            setProducts([...products, response.data]);
                        } else {
                            if (currentItem){
                                response = await api.put(`/produits/${currentItem.id}/`, formData, {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                });
                                setProducts(products.map(p => p.id === currentItem.id ? response.data : p));
                            }
                        }
                    } else {
                        if (currentItem){
                            // Create a new object with the correct category ID if categorie is an object
                            const formData = { ...productForm };
                            if (typeof formData.categorie === 'object' && formData.categorie !== null) {
                                formData.categorie = formData.categorie.id;
                            }

                            response = await api.put(`/produits/${currentItem.id}/`, formData);
                            setProducts(products.map(p => p.id === currentItem.id ? response.data : p));
                        }
                    }
                    setProductImage(null);
                    break;
                case 'payment-methods':
                    if (modalType === 'add') {
                        response = await api.post('/methode-paiement/', paymentMethodForm);
                        setPaymentMethods([...paymentMethods, response.data]);
                    } else {

                        if (currentItem){
                            // This endpoint might need to be created in the backend
                             response = await api.put(`/methode-paiement/${currentItem.id}/`, paymentMethodForm);
                             setPaymentMethods(paymentMethods.map(m => m.id === currentItem.id ? response.data : m));
                        }
                    }
                    break;
                case 'keys':
                    if (modalType === 'add') {
                        response = await api.post('/cles/', keyForm);
                        setKeys([...keys, response.data]);
                    } else {
                        if (currentItem){
                            // This endpoint might need to be created in the backend
                            response = await api.put(`/cles/${currentItem.id}/`, keyForm);
                            setKeys(keys.map(k => k.id === currentItem.id ? response.data : k));
                        }
                    }
                    break;
                case 'actions':
                    if (modalType === 'add') {
                        // For new actions, we need to create the action first, then add the products
                        response = await api.post('/actions/', actionForm);
                        const newAction = response.data;

                        // If we have products, create elements for them
                        if (actionProductsForm.length > 0) {
                            const elementsData = actionProductsForm.map(product => ({
                                action: newAction.id,
                                produit: product.produit_id,
                                quantite: product.quantite,
                                prix_total: product.prix_total
                            }));

                            try {
                                await Promise.all(elementsData.map(element =>
                                    api.post('/elements/', element)
                                ));

                                const actionsResponse = await api.get('/actions/');
                                setActions(actionsResponse.data);
                            } catch {
                            }
                        } else {
                            setActions([...actions, newAction]);
                        }
                    } else {
                        if (currentItem){
                            response = await api.put(`/actions/${currentItem.id}/`, actionForm);
                            const updatedAction = response.data;

                            const existingElements = elementsAchatDevis.filter(element => element.action === currentItem.id);

                            // Delete elements that are no longer in the form
                            const elementsToDelete = existingElements.filter(element =>
                                !actionProductsForm.some(product => product.id === element.id)
                            );

                            // Update existing elements and create new ones
                            const elementsToUpdateOrCreate = actionProductsForm.map(product => ({
                                id: product.id, // Will be undefined for new elements
                                action: currentItem.id,
                                produit: product.produit_id,
                                quantite: product.quantite,
                                prix_total: product.prix_total
                            }));

                            try {
                                // Delete elements
                                await Promise.all(elementsToDelete.map(element =>
                                    api.delete(`/elements/${element.id}/`)
                                ));

                                // Update or create elements
                                await Promise.all(elementsToUpdateOrCreate.map(element => {
                                    if (element.id) {
                                        return api.put(`/elements/${element.id}/`, element);
                                    } else {
                                        return api.post('/elements/', element);
                                    }
                                }));

                                // Refresh the actions list to get the updated data
                                const actionsResponse = await api.get('/actions/');
                                setActions(actionsResponse.data);
                            } catch (err) {
                                console.error('Error updating elements:', err);
                                toast.error('Erreur lors de la mise à jour des éléments');

                                // Still update the actions list with the updated action
                                setActions(actions.map(a => a.id === currentItem.id ? updatedAction : a));
                            }
                        }
                    }
                    break;
            }

            toast.success(modalType === 'add' ? 'Élément ajouté avec succès' : 'Élément modifié avec succès');
            setShowModal(false);
            setIsLoading(false);
        } catch (err) {
            console.error('Error submitting form:', err);
            toast.error('Erreur lors de la soumission du formulaire');
            setIsLoading(false);
        }
    };

    // Handle product selection
    const handleAddProductToAction = () => {
        if (!productToAdd.produit_id || productToAdd.quantite < 1) {
            toast.error('Veuillez sélectionner un produit et spécifier une quantité valide');
            return;
        }

        const selectedProduct = products.find(p => p.id === productToAdd.produit_id);
        if (!selectedProduct) {
            toast.error('Produit non trouvé');
            return;
        }

        const prix_total = selectedProduct.prix * productToAdd.quantite;

        const newProduct = {
            id: -Date.now(), // Generate a temporary negative ID using timestamp
            produit_id: selectedProduct.id,
            produit_nom: selectedProduct.nom,
            quantite: productToAdd.quantite,
            prix_unitaire: selectedProduct.prix,
            prix_total: prix_total
        };

        const updatedProducts = [...actionProductsForm, newProduct];
        setActionProductsForm(updatedProducts);

        // Update total price
        const newTotalPrice = updatedProducts.reduce((sum, p) => sum + p.prix_total, 0);
        setActionForm({...actionForm, prix: newTotalPrice});

        // Reset form
        setProductToAdd({produit_id: 0, quantite: 1});

        // Close modal with setTimeout to ensure it happens after the current event cycle
        setTimeout(() => {
            setShowProductModal(false);
            // Show success message after modal is closed
            toast.success('Produit ajouté');
        }, 0);
    };

    const handleRemoveProduct = (index: number) => {
        const updatedProducts = [...actionProductsForm];
        updatedProducts.splice(index, 1);
        setActionProductsForm(updatedProducts);

        // Recalculate total price
        const newTotalPrice = updatedProducts.reduce((sum, p) => sum + p.prix_total, 0);
        setActionForm({...actionForm, prix: newTotalPrice});
    };

    const handleApproveAction = async (actionId?: number) => {
        if (actionId === undefined) return;
        if (!confirm('Êtes-vous sûr de vouloir approuver cette vente ? Cela marquera la vente comme payée et livrée, et enverra les clés au client par email.')) {
            return;
        }

        setIsLoading(true);

        try {
            await api.post(`/actions/${actionId}/approuver/`, {
                livree: true,
                payee: true
            });

            // Mettre à jour la liste des actions
            const updatedActions = actions.map(action => {
                if (action.id === actionId) {
                    return {...action, livree: true, payee: true};
                }
                return action;
            });

            setActions(updatedActions);
            toast.success('Vente approuvée avec succès. Les clés ont été envoyées au client.');
        } catch (error) {
            console.error('Erreur lors de l\'approbation de la vente:', error);
            toast.error('Erreur lors de l\'approbation de la vente');
        } finally {
            setIsLoading(false);
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
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Error message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                     role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Add button */}
            <div className="mb-4">
                <button
                    onClick={handleAddItem}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FiPlus className="mr-2"/> Ajouter
                </button>
            </div>

            {/* Sales Statistics */}
            {activeTab === 'actions' && !isLoading && (
                <SalesStats salesStats={salesStats} />
            )}

            {/* Data table */}
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <div className="overflow-x-auto">
                    {activeTab === 'users' && (
                        <UsersTable 
                            users={users} 
                            handleEditItem={handleEditItem} 
                            handleDeleteItem={handleDeleteItem} 
                            isLoading={isLoading} 
                        />
                    )}
                    {activeTab === 'categories' && (
                        <CategoriesTable 
                            categories={categories} 
                            handleEditItem={handleEditItem} 
                            handleDeleteItem={handleDeleteItem} 
                            isLoading={isLoading} 
                        />
                    )}
                    {activeTab === 'products' && (
                        <ProductsTable 
                            products={products} 
                            categories={categories}
                            handleEditItem={handleEditItem} 
                            handleDeleteItem={handleDeleteItem} 
                            isLoading={isLoading} 
                        />
                    )}
                    {activeTab === 'payment-methods' && (
                        <PaymentMethodsTable 
                            paymentMethods={paymentMethods} 
                            handleEditItem={handleEditItem} 
                            handleDeleteItem={handleDeleteItem} 
                            isLoading={isLoading} 
                        />
                    )}
                    {activeTab === 'keys' && (
                        <KeysTable 
                            keys={keys} 
                            products={products}
                            handleEditItem={handleEditItem} 
                            handleDeleteItem={handleDeleteItem} 
                            isLoading={isLoading} 
                        />
                    )}
                    {activeTab === 'actions' && (
                        <ActionsTable 
                            actions={actions} 
                            handleEditItem={handleEditItem} 
                            handleDeleteItem={handleDeleteItem} 
                            handleApproveAction={handleApproveAction}
                            isLoading={isLoading} 
                        />
                    )}
                </div>
            </div>

            {/* Modal for add/edit */}
            <FormModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                title={modalType === 'add' ? 'Ajouter un nouvel élément' : 'Modifier l\'élément'}
            >
                {activeTab === 'users' && (
                    <UserForm 
                        userForm={userForm}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        modalType={modalType}
                        onCancel={() => setShowModal(false)}
                    />
                )}
                {activeTab === 'categories' && (
                    <CategoryForm 
                        categoryForm={categoryForm}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        modalType={modalType}
                        onCancel={() => setShowModal(false)}
                    />
                )}
                {activeTab === 'products' && (
                    <ProductForm 
                        productForm={productForm}
                        categories={categories}
                        handleFormChange={handleFormChange}
                        handleFileChange={handleFileChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        modalType={modalType}
                        onCancel={() => setShowModal(false)}
                        productImage={productImage}
                    />
                )}
                {activeTab === 'payment-methods' && (
                    <PaymentMethodForm 
                        paymentMethodForm={paymentMethodForm}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        modalType={modalType}
                        onCancel={() => setShowModal(false)}
                    />
                )}
                {activeTab === 'keys' && (
                    <KeyForm 
                        keyForm={keyForm}
                        products={products}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        modalType={modalType}
                        onCancel={() => setShowModal(false)}
                    />
                )}
                {activeTab === 'actions' && (
                    <ActionForm 
                        actionForm={actionForm}
                        actionProductsForm={actionProductsForm}
                        users={users}
                        paymentMethods={paymentMethods}
                        handleFormChange={handleFormChange}
                        handleSubmit={handleSubmit}
                        isLoading={isLoading}
                        modalType={modalType}
                        onCancel={() => setShowModal(false)}
                        onAddProduct={() => setShowProductModal(true)}
                        onRemoveProduct={handleRemoveProduct}
                    />
                )}
            </FormModal>

            {/* Product Modal */}
            <ProductModal 
                isOpen={showProductModal}
                onClose={() => setShowProductModal(false)}
                products={products}
                productToAdd={productToAdd}
                setProductToAdd={setProductToAdd}
                handleAddProductToAction={handleAddProductToAction}
            />
        </div>
    );
};

export default AdminDashboard;