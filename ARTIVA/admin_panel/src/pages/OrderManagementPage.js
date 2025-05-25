// admin_panel/src/pages/OrderManagementPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import OrderDetailsModal from '../components/OrderDetailsModal';
import './ProductManagementPage.css'; // On réutilise les styles généraux et de tableau

const API_BASE_URL = 'http://localhost:3001/api';

// Statuts possibles pour le filtre et le changement de statut
const ORDER_STATUSES = ['pending', 'awaiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'];

function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pour la pagination (si implémentée côté backend)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10; // Ou ce que ton backend utilise par défaut

  // Pour les filtres
  const [filterStatus, setFilterStatus] = useState(''); // Filtre par statut
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // État pour le modal de détails
  const [selectedOrderId, setSelectedOrderId] = useState(null);     // ID de la commande pour les détails

  const adminToken = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (page = 1, status = '') => {
    if (!adminToken) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/orders/admin/all?page=${page}&limit=${ITEMS_PER_PAGE}`;
      if (status) {
        url += `&status=${status}`;
      }
      // Ajoute d'autres filtres ici si besoin (date_from, date_to, user_id)

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      setOrders(response.data.orders || []);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (err) {
      console.error("Erreur chargement commandes (admin):", err);
      setError(err.response?.data?.message || 'Impossible de charger les commandes.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [adminToken, navigate, ITEMS_PER_PAGE]); // ITEMS_PER_PAGE est constant

  useEffect(() => {
    fetchOrders(currentPage, filterStatus);
  }, [fetchOrders, currentPage, filterStatus]); // Re-fetch si la page ou le filtre change

  const handleStatusChange = async (orderId, newStatus) => {
    if (!adminToken) return;
    if (!ORDER_STATUSES.includes(newStatus)) {
        alert("Statut invalide sélectionné.");
        return;
    }

    // Demander confirmation pour certains statuts critiques si besoin
    // if (newStatus === 'cancelled' && !window.confirm("Confirmer l'annulation de cette commande ?")) return;
    
    setIsLoading(true); // Pour indiquer une action sur la ligne
    try {
      await axios.put(`${API_BASE_URL}/orders/admin/${orderId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${adminToken}` } }
      );
      // Mettre à jour l'état local pour un retour visuel immédiat ou re-fetcher
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
        )
      );
      // Ou simplement : fetchOrders(currentPage, filterStatus); // Plus simple mais recharge tout
    } catch (err) {
      console.error("Erreur MàJ statut commande:", err);
      alert(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short'});
  };

  // NOUVELLES FONCTIONS pour le modal de détails
  const handleOpenDetailsModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrderId(null);
  };


  if (isLoading && orders.length === 0 && currentPage === 1) { // Loader initial seulement
    return <div className="management-page"><p>Chargement des commandes...</p></div>;
  }

  return (
    <div className="management-page">
      <div className="page-header">
        <h1>Gestion des Commandes</h1>
        {/* Pas de bouton "Ajouter Commande" ici, car elles viennent des clients */}
      </div>
      <Link to="/dashboard" className="back-link">← Retour au Tableau de Bord</Link>

      {/* Filtres */}
      <div className="filters-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label htmlFor="statusFilter">Filtrer par statut :</label>
        <select 
            id="statusFilter" 
            value={filterStatus} 
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); /* Reset page on filter change */}}
            style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
        {/* Tu pourrais ajouter d'autres filtres ici (date, utilisateur) */}
      </div>


      {error && <p className="error-message">{error}</p>}
      {isLoading && <p className="loading-indicator">Chargement...</p>}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID Commande</th>
              <th>N° Commande</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(order => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.order_number}</td>
                <td>{order.userName || 'N/A'} ({order.userEmail || 'N/A'})</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.total} {order.currency}</td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                    style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc'}}
                    disabled={isLoading} // Désactiver pendant une autre opération
                  >
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td className="actions-cell">
                  <button 
                    onClick={() => handleOpenDetailsModal(order.orderId)} // APPELLE LA NOUVELLE FONCTION 
                    className="action-btn edit-btn" // Réutiliser le style edit
                    title="Voir Détails"
                    style={{fontSize: '1.2em'}} // Rendre l'icône un peu plus grande
                  >
                    👁️ {/* Ou une icône de loupe */}
                  </button>
                  {/* D'autres actions possibles (ex: imprimer facture) */}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{textAlign: 'center'}}>Aucune commande trouvée pour les filtres actuels.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-controls" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}>Précédent</button>
          <span>Page {currentPage} sur {totalPages} ({totalItems} commandes)</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading}>Suivant</button>
        </div>
      )}

       {/* Modal pour les détails de la commande */}
       {isDetailsModalOpen && selectedOrderId && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          orderId={selectedOrderId}
          apiBaseUrl={API_BASE_URL}
          adminToken={adminToken}
        />
      )}
    </div>
  );
}

export default OrderManagementPage;