import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Input } from '../../components/common/Input';
import ClientDetailsModal from '../../components/modals/ClientDetailsModal';
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
    {client.email && <Text style={styles.clientDetail}>📧 {client.email}</Text>}
    {client.phone && <Text style={styles.clientDetail}>📱 {client.phone}</Text>}
    {client.address && (
      <Text style={styles.clientDetail} numberOfLines={1}>📍 {client.address}</Text>
    )}
    <Text style={styles.clientDate}>Added {formatDate(client.createdAt)}</Text>
  </TouchableOpacity>
);

export default function ClientsScreen() {
  const { clients, orders, updateClient, updateOrder, loading, userReady } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (!userReady || loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {loading ? 'Loading clients...' : 'Checking authentication...'}
        </Text>
      </View>
    );
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  const getOrderCount = (clientId: string) => {
    return orders.filter(order => order.clientId === clientId).length;
  };

  const handleClientPress = (client: Client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

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
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() => handleClientPress(item)}
            orderCount={getOrderCount(item.id)}
          />
        )}
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
                : 'Add clients in the Manage tab'}
            </Text>
          </View>
        }
      />

      <ClientDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        client={selectedClient}
        orders={orders}
        updateClient={updateClient}
        updateOrder={updateOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC' },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: { marginBottom: 0 },
  listContent: { paddingBottom: 20 },
  clientCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  orderBadge: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  clientDetail: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  clientDate: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
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
});
