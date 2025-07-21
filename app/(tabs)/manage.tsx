import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Toast from 'react-native-toast-message';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useData } from '../../contexts/DataContext';
import { Client, Order } from '../../types';
import { generateOrderNumber } from '../../utils/completionCalculator';


<link href="https://fonts.googleapis.com/css2?family=Space+Mono&display=swap" />



export default function ManageScreen() {
  const { addOrder, addClient, clients, userReady, loading } = useData();
  const [activeTab, setActiveTab] = useState<'order' | 'client'>('order');

  const [orderForm, setOrderForm] = useState({
    clientId: '',
    clientName: '',
    jobTitle: '',
    description: '',
    internalCost: '',
    clientPrice: '',
    estimatedHours: '',
    deadline: '',
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);


  const [submitting, setSubmitting] = useState(false);

  const resetOrderForm = () => {
    setOrderForm({
      clientId: '',
      clientName: '',
      jobTitle: '',
      description: '',
      internalCost: '',
      clientPrice: '',
      estimatedHours: '',
      deadline: '',
    });
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
  };

  const handleSubmitOrder = async () => {
    if (!orderForm.clientName || !orderForm.jobTitle || !orderForm.description || !orderForm.estimatedHours) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields.',
      });
      return;
    }
    

    if (isNaN(parseFloat(orderForm.estimatedHours)) || parseFloat(orderForm.estimatedHours) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Hours',
        text2: 'Please enter a valid estimated hours.',
      });
      return;
    }

    if (orderForm.internalCost && isNaN(parseFloat(orderForm.internalCost))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Cost',
        text2: 'Please enter a valid internal cost.',
      });
      return;
    }

    if (orderForm.clientPrice && isNaN(parseFloat(orderForm.clientPrice))) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Price',
        text2: 'Please enter a valid client price.',
      });
      return;
    }

    setSubmitting(true);
    try {
      let clientId = orderForm.clientId;

      if (!clientId) {
        const existingClient = clients.find(
          client => client.name.toLowerCase() === orderForm.clientName.toLowerCase()
        );

        if (!existingClient) {
          Toast.show({
            type: 'error',
            text1: 'Client Not Found',
            text2: 'Please select an existing client or add them first.',
          });
          setSubmitting(false);
          return;
        }

        clientId = existingClient.id;
      }


      const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderNumber: generateOrderNumber(),
        clientId,
        clientName: orderForm.clientName,
        dateReceived: new Date(),
        jobTitle: orderForm.jobTitle || '', // 👈 ADD THIS LINE
        description: orderForm.description,
        internalCost: parseFloat(orderForm.internalCost) || 0,
        clientPrice: parseFloat(orderForm.clientPrice) || 0,
        estimatedHours: parseFloat(orderForm.estimatedHours),
        hoursCompleted: 0,
        deadline: orderForm.deadline ? new Date(orderForm.deadline) : undefined,
        status: 'waiting',
        paymentStatus:'incomplete',

      };

      await addOrder(newOrder);
      resetOrderForm();
      Toast.show({
        type: 'success',
        text1: 'Order added successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add order',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClient = async () => {
    if (!clientForm.name) {
      Toast.show({
        type: 'error',
        text1: 'Missing Field',
        text2: 'Client name is required.',
      });
      return;
    }
    

    const existingClient = clients.find(
      client => client.name.toLowerCase() === clientForm.name.toLowerCase()
    );

    if (existingClient) {
      Toast.show({
        type: 'error',
        text1: 'Existing Client',
        text2: 'Client with this name already exists.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const newClient: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
        name: clientForm.name,
        email: clientForm.email || undefined,
        phone: clientForm.phone || undefined,
        address: clientForm.address || undefined,
        notes: clientForm.notes || undefined,
      };

      await addClient(newClient);
      resetClientForm();
      Toast.show({
        type: 'success',
        text1: 'New client added',
        
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to add new client',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectClient = (client: Client) => {
    setOrderForm(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
    }));
  };

  // ✅ WAIT for user auth to be ready
  if (!userReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'order' && styles.activeTab]}
          onPress={() => setActiveTab('order')}
        >
          <Text style={[styles.tabText, activeTab === 'order' && styles.activeTabText]}>
            Add Order
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'client' && styles.activeTab]}
          onPress={() => setActiveTab('client')}
        >
          <Text style={[styles.tabText, activeTab === 'client' && styles.activeTabText]}>
            Add Client
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'order' ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>New Order</Text>

            <Input
              label="Client Name"
              value={orderForm.clientName}
              onChangeText={(text) => setOrderForm(prev => ({ ...prev, clientName: text }))}
              placeholder="Search and select an existing client"
              placeholderTextColor="#A9A9A9"
              required
            />

            {clients.length > 0 && !orderForm.clientId && (
              <View style={styles.clientSuggestions}>
                <Text style={styles.suggestionsTitle}>Existing Clients:</Text>
                {clients
                  .filter(client => 
                    orderForm.clientName && 
                    client.name.toLowerCase().includes(orderForm.clientName.toLowerCase())
                  )
                  .slice(0, 3)
                  .map(client => (
                    <TouchableOpacity
                      key={client.id}
                      style={styles.suggestionItem}
                      onPress={() => selectClient(client)}
                    >
                      <Text style={styles.suggestionText}>{client.name}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            <Input
                label="Job Title"
                value={orderForm.jobTitle}
                onChangeText={(text) => setOrderForm(prev => ({ ...prev, jobTitle: text }))}
                placeholder="Job title for this work"
                placeholderTextColor="#A9A9A9"
                required  
            />

            <Input
              label="Description"
              value={orderForm.description}
              onChangeText={(text) => setOrderForm(prev => ({ ...prev, description: text }))}
              placeholder="Describe the work to be done"
              placeholderTextColor="#A9A9A9"
              multiline
              required
            />

            <Input
              label="Estimated Hours"
              value={orderForm.estimatedHours}
              onChangeText={(text) => setOrderForm(prev => ({ ...prev, estimatedHours: text }))}
              placeholder="0.0"
              keyboardType="numeric"
              placeholderTextColor="#A9A9A9"
              required
            />

            <Input
              label="Internal Cost"
              value={orderForm.internalCost !== '' ? `£${orderForm.internalCost}` : ''}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9.]/g, ''); // Keep only numbers and dot
                setOrderForm((prev) => ({ ...prev, internalCost: numericValue }));
              }}
              placeholder="£0.00"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
            />

            <Input
              label="Client Price"
              value={orderForm.clientPrice !== '' ? `£${orderForm.clientPrice}` : ''}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9.]/g, '');
                setOrderForm((prev) => ({ ...prev, clientPrice: numericValue }));
              }}
              placeholder="£0.00"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
            />


            <View style={{ marginBottom: 16 }}>
              {Platform.OS === 'web' ? (
                <>
                  <label
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#4A4A4A',
                      marginBottom: 8,
                      fontFamily: 'Space Mono, monospace',
                    }}
                  >
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={orderForm.deadline ? orderForm.deadline.split('T')[0] : ''}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const selectedDate = target.value;
                      if (selectedDate) {
                        setOrderForm((prev) => ({
                          ...prev,
                          deadline: new Date(selectedDate).toISOString(),
                        }));
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      width: '100%',
                      boxSizing: 'border-box',
                      height: '48px',
                      color: '#333',
                      fontSize: '16px',
                    }}
                  />
                </>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#4A4A4A',
                      marginBottom: 8,
                      fontFamily: 'Space Mono, monospace',
                    }}
                  >
                    Deadline
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      marginBottom: 16,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: '#f9f9f9',
                      borderColor: '#ccc',
                      borderWidth: 1,
                    }}
                  >
                    <Text style={{ color: '#333' }}>
                      {orderForm.deadline
                        ? new Date(orderForm.deadline).toLocaleDateString()
                        : 'Select deadline date'}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      mode="date"
                      display="default"
                      value={
                        orderForm.deadline
                          ? new Date(orderForm.deadline)
                          : new Date()
                      }
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setOrderForm((prev) => ({
                            ...prev,
                            deadline: selectedDate.toISOString(),
                          }));
                        }
                      }}
                    />
                  )}
                </>
              )}
            </View>




            <Button
              title={submitting ? 'Adding Order...' : 'Add Order'}
              onPress={handleSubmitOrder}
              disabled={submitting}
              style={styles.submitButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>New Client</Text>

            <Input
              label="Name"
              value={clientForm.name}
              onChangeText={(text) => setClientForm(prev => ({ ...prev, name: text }))}
              placeholder="Enter client name"
              placeholderTextColor="#A9A9A9"
              required
            />

            <Input
              label="Email"
              value={clientForm.email}
              onChangeText={(text) => setClientForm(prev => ({ ...prev, email: text }))}
              placeholder="client@example.com"
              placeholderTextColor="#A9A9A9"
              keyboardType="email-address"
            />

            <Input
              label="Phone"
              value={clientForm.phone}
              onChangeText={(text) => setClientForm(prev => ({ ...prev, phone: text }))}
              placeholder="eg. 07496745208"
              placeholderTextColor="#A9A9A9"

            />

            <Input
              label="Address"
              value={clientForm.address}
              onChangeText={(text) => setClientForm(prev => ({ ...prev, address: text }))}
              placeholder="Enter full address"
              placeholderTextColor="#A9A9A9"
              multiline
            />

            <Input
              label="Notes"
              value={clientForm.notes}
              onChangeText={(text) => setClientForm(prev => ({ ...prev, notes: text }))}
              placeholder="Additional notes about the client"
              placeholderTextColor="#A9A9A9"
              multiline
            />

            <Button
              title={submitting ? 'Adding Client...' : 'Add Client'}
              onPress={handleSubmitClient}
              disabled={submitting}
              style={styles.submitButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8B4513',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  clientSuggestions: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  suggestionItem: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  
});