import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useData } from '../../contexts/DataContext';
import { Client } from '../../types';
import { formatDate } from '../../utils/completionCalculator';


interface ClientCardProps {
  client: Client;
  onPress: () => void;
  orderCount: number;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onPress, orderCount }) => (
  <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.clientHeader}>
      <Text style={styles.clientName}>{client.name}</Text>
      <View style={styles.orderBadge}>
        <Text style={styles.orderBadgeText}>{orderCount} orders</Text>
      </View>
    </View>
    
    {client.email && (
      <Text style={styles.clientDetail}>📧 {client.email}</Text>
    )}
    {client.phone && (
      <Text style={styles.clientDetail}>📱 {client.phone}</Text>
    )}
    {client.address && (
      <Text style={styles.clientDetail} numberOfLines={1}>📍 {client.address}</Text>
    )}
    
    <Text style={styles.clientDate}>Added {formatDate(client.createdAt)}</Text>
  </TouchableOpacity>
);

export default function ClientsScreen() {
  const { clients, orders, updateClient, loading, userReady } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedClient, setEditedClient] = useState<Client | null>(null);


  if (!userReady) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Checking authentication...</Text>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading clients...</Text>
      </View>
    );
  }
  
  

  // Filter clients based on search query
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  // Get order count for each client
  const getOrderCount = (clientId: string) => {
    return orders.filter(order => order.clientId === clientId).length;
  };

  // Get client orders
  const getClientOrders = (clientId: string) => {
    return orders.filter(order => order.clientId === clientId);
  };

  const handleClientPress = (client: Client) => {
    setSelectedClient(client);
    setEditedClient(client);
    setModalVisible(true);
    setEditMode(false);
  };

  const handleEditClient = async () => {
    if (!editedClient || !selectedClient) return;

    try {
      await updateClient(selectedClient.id, {
        name: editedClient.name,
        email: editedClient.email,
        phone: editedClient.phone,
        address: editedClient.address,
        notes: editedClient.notes,
      });
      setModalVisible(false);
      setEditMode(false);
      Toast.show({
              type: 'success',
              text1: 'Client updated successfully',
            });
    } catch (error) {
      Toast.show({
              type: 'error',
              text1: 'Failed to update client.',
            });
    }
  };

  const renderClient = ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      onPress={() => handleClientPress(item)}
      orderCount={getOrderCount(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          label=""
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search clients..."
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No clients found' : 'No clients yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Add clients in the Manage tab'
              }
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedClient?.name}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {!editMode ? (
              <>
                <View style={styles.clientInfoSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{selectedClient?.email || 'Not provided'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={styles.infoValue}>{selectedClient?.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{selectedClient?.address || 'Not provided'}</Text>
                  </View>
                  {selectedClient?.notes && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Notes:</Text>
                      <Text style={styles.infoValue}>{selectedClient.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.ordersSection}>
                  <Text style={styles.sectionTitle}>Order History</Text>
                  {selectedClient && getClientOrders(selectedClient.id).map(order => (
                    <View key={order.id} style={styles.orderItem}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderDescription} numberOfLines={1}>
                        {order.description}
                      </Text>
                      <Text style={styles.orderStatus}>{order.status}</Text>
                    </View>
                  ))}
                  {selectedClient && getClientOrders(selectedClient.id).length === 0 && (
                    <Text style={styles.noOrdersText}>No orders yet</Text>
                  )}
                </View>

                <Button
                  title="Edit Client"
                  onPress={() => setEditMode(true)}
                  style={styles.editButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Edit Client</Text>
                
                <Input
                  label="Name"
                  value={editedClient?.name || ''}
                  onChangeText={(text) => setEditedClient(prev => prev ? {...prev, name: text} : null)}
                  required
                />

                <Input
                  label="Email"
                  value={editedClient?.email || ''}
                  onChangeText={(text) => setEditedClient(prev => prev ? {...prev, email: text} : null)}
                  keyboardType="email-address"
                />

                <Input
                  label="Phone"
                  value={editedClient?.phone || ''}
                  onChangeText={(text) => setEditedClient(prev => prev ? {...prev, phone: text} : null)}
                />

                <Input
                  label="Address"
                  value={editedClient?.address || ''}
                  onChangeText={(text) => setEditedClient(prev => prev ? {...prev, address: text} : null)}
                  multiline
                />

                <Input
                  label="Notes"
                  value={editedClient?.notes || ''}
                  onChangeText={(text) => setEditedClient(prev => prev ? {...prev, notes: text} : null)}
                  multiline
                />

                <View style={styles.editButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => setEditMode(false)}
                    variant="secondary"
                    style={styles.editButton}
                  />
                  <Button
                    title="Save"
                    onPress={handleEditClient}
                    style={styles.editButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    paddingBottom: 20,
  },
  clientCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  orderBadge: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clientDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  clientDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalContent: {
    padding: 20,
  },
  clientInfoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  ordersSection: {
    marginBottom: 24,
  },
  orderItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  noOrdersText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  editButton: {
    marginTop: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});