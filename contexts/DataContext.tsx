import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { Client, Order, WorkPreferences } from '../types';

interface DataContextType {
  orders: Order[];
  clients: Client[];
  workPreferences: WorkPreferences;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updateWorkPreferences: (preferences: WorkPreferences) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const defaultWorkPreferences: WorkPreferences = {
  daysPerWeek: 5,
  hoursPerDay: 8,
  daysOff: [0], // Sunday off by default
  customDaysOff: [],
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workPreferences, setWorkPreferences] = useState<WorkPreferences>(defaultWorkPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to orders
    const ordersQuery = query(collection(db, 'orders'), orderBy('deadline', 'asc'));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateReceived: doc.data().dateReceived?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || null,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Order[];
      setOrders(ordersData);
    });

    // Subscribe to clients
    const clientsQuery = query(collection(db, 'clients'), orderBy('name', 'asc'));
    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Client[];
      setClients(clientsData);
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeClients();
    };
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    await updateDoc(doc(db, 'orders', id), {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteOrder = async (id: string) => {
    await deleteDoc(doc(db, 'orders', id));
  };

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    await addDoc(collection(db, 'clients'), {
      ...clientData,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    await updateDoc(doc(db, 'clients', id), {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteClient = async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));
  };

  const updateWorkPreferences = (preferences: WorkPreferences) => {
    setWorkPreferences(preferences);
    // You might want to persist this to AsyncStorage or Firestore
  };

  const value = {
    orders,
    clients,
    workPreferences,
    addOrder,
    updateOrder,
    deleteOrder,
    addClient,
    updateClient,
    deleteClient,
    updateWorkPreferences,
    loading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};