'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectPanier, viderPanier } from '@/features/produit/produitSlice';
import { selectCurrentUser } from '@/features/user/userSlice';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiCheck, FiCreditCard, FiShoppingBag } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/apis';
import toast from 'react-hot-toast';
import { TypeCartItem } from '@/utils/types';
import { AppDispatch } from '@/redux/store';

export default function CheckoutPage() {
  const dispatch: AppDispatch = useDispatch();
  const panier: TypeCartItem[] = useSelector(selectPanier);
  const user = useSelector(selectCurrentUser);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderReference, setOrderReference] = useState('');

  useEffect(() => {
    // Redirect to login if user is not logged in
    if (!user) {
      toast.error('Veuillez vous connecter pour continuer');
      router.push('/se-connecter');
      return;
    }

    // Redirect to products if cart is empty
    if (panier.length === 0 && !orderComplete) {
      toast.error('Votre panier est vide');
      router.push('/produits');
      return;
    }

    // Fetch payment methods
    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get('/methode-paiement/');
        setPaymentMethods(response.data);
        if (response.data.length > 0) {
          setSelectedPaymentMethod(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        toast.error('Erreur lors du chargement des méthodes de paiement');
      }
    };

    fetchPaymentMethods();
  }, [user, panier, router, orderComplete]);

  const calculerTotal = () => {
    return panier.reduce((total, item) => total + (item.produit.prix * item.quantite), 0);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(Number(e.target.value));
  };

  const handleSubmitOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare order data
      const orderData = {
        action: {
          type: 'achat',
          client: user?.id,
          methode_paiement: selectedPaymentMethod,
        },
        produits: panier.map(item => ({
          produit: item.produit.id,
          quantite: item.quantite,
        })),
      };

      // Submit order
      const response = await api.post('/actions/', orderData);

      // Handle successful order
      setOrderReference(response.data.action_id);
      setOrderComplete(true);
      dispatch(viderPanier());
      toast.success('Commande effectuée avec succès');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Erreur lors de la soumission de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  // Order success screen
  if (orderComplete) {
    return (
      <div className="max-w-4xl mx-auto p-4 min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Commande confirmée !</h1>
          <p className="text-gray-600 mb-4">
            Votre commande a été enregistrée avec succès. Vous recevrez vos clés par email une fois le paiement confirmé.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">Référence de commande</p>
            <p className="text-lg font-semibold text-[#061e53]">{orderReference}</p>
          </div>
          <div className="space-y-3">
            <Link href="/mon-compte">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 bg-[#061e53] text-white rounded-lg font-medium hover:bg-[#0c2b7a] transition-colors"
              >
                Voir mes commandes
              </motion.button>
            </Link>
            <Link href="/produits">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 px-4 border border-[#061e53] text-[#061e53] rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continuer mes achats
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-[#061e53] mb-6">Finaliser la commande</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-[#061e53] mb-4 flex items-center">
              <FiShoppingBag className="mr-2" /> Récapitulatif de la commande
            </h2>
            <div className="space-y-4">
              {panier.map((item) => (
                <div key={item.produit.id} className="flex items-center gap-4 border-b pb-4">
                  <Image
                    src={item.produit.image}
                    width={60}
                    height={60}
                    alt={item.produit.nom}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.produit.nom}</h3>
                    <p className="text-sm text-gray-500">Validité: {item.produit.validite}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(item.produit.prix).toLocaleString()} Ar</p>
                    <p className="text-sm text-gray-500">Quantité: {item.quantite}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-[#061e53] mb-4 flex items-center">
              <FiCreditCard className="mr-2" /> Méthode de paiement
            </h2>

            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={handlePaymentMethodChange}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium">{method.nom}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <FiAlertCircle className="mx-auto text-yellow-500 text-xl mb-2" />
                  <p>Aucune méthode de paiement disponible</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Le paiement sera traité manuellement. Vous recevrez vos clés par email une fois le paiement confirmé.
              </p>
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-sm sticky top-4">
            <h2 className="text-xl font-semibold text-[#061e53] mb-4">Résumé</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">
                  {calculerTotal().toLocaleString()} Ar
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className="font-medium">Gratuite</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-[#061e53]">
                    {calculerTotal().toLocaleString()} Ar
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSubmitOrder}
                disabled={isLoading || !selectedPaymentMethod}
                className={`w-full py-3 flex items-center justify-center rounded-lg font-medium transition-colors ${
                  isLoading || !selectedPaymentMethod
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#061e53] text-white hover:bg-[#0c2b7a]'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Traitement...
                  </>
                ) : (
                  'Confirmer la commande'
                )}
              </motion.button>

              <Link href="/panier">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-2 text-[#061e53] border border-[#061e53] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Retour au panier
                </motion.button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              En confirmant votre commande, vous acceptez nos conditions générales de vente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
