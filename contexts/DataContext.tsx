import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { auth, db } from '../config/firebase';
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
  userReady: boolean; // ✅ Added to track auth readiness
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
  daysOff: [0],
  customDaysOff: [],
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workPreferences, setWorkPreferences] = useState<WorkPreferences>(defaultWorkPreferences);
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false); // ✅ New state


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserReady(true);
  
      if (!user) {
        setOrders([]);
        setClients([]);
        setLoading(false);
        // navigation.replace('Login'); // ✅ Redirect to Login screen
        return;
      }
  
      // ✅ Orders listener
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
  
      // ✅ Clients listener
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
  
      // ✅ User preferences listener
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
        const userData = snapshot.data();
        if (userData?.workPreferences) {
          const loadedPrefs = userData.workPreferences;
        
          setWorkPreferences({
            ...loadedPrefs,
            customDaysOff: (loadedPrefs.customDaysOff || []).map((d: any) =>
              d?.toDate ? d.toDate() : new Date(d)
            ),
          });
        }
        
      });
  
      return () => {
        unsubscribeOrders();
        unsubscribeClients();
        unsubscribeUser(); // ✅ clean up Firestore listener
      };
    });
  
    return () => unsubscribeAuth(); // ✅ clean up auth listener
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
  
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: now,
        updatedAt: now,
      });
  
      Toast.show({
        type: 'success',
        text1: 'Order added successfully',
      });
    } catch (error) {
      console.error('Failed to add order:', error); // Log detailed error
      Toast.show({
        type: 'error',
        text1: 'Failed to add order',
        text2: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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

  const updateWorkPreferences = async (preferences: WorkPreferences) => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      // Filter out customDaysOff that are in the past (before today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const cleanedCustomDaysOff = (preferences.customDaysOff || []).filter(date => {
        const day = new Date(date);
        day.setHours(0, 0, 0, 0);
        return day >= today;
      });
  
      const cleanedPreferences = {
        ...preferences,
        customDaysOff: cleanedCustomDaysOff,
      };
  
      await setDoc(doc(db, 'users', user.uid), {
        workPreferences: cleanedPreferences,
      }, { merge: true });
  
      setWorkPreferences(cleanedPreferences);
  
      Toast.show({
        type: 'success',
        text1: 'Preferences updated',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update preferences',
      });
    }
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
    userReady, // ✅ exposed
  };

  

  return (
    <DataContext.Provider value={value}>
      {children}
      <Toast />  {/* ✅ Toast is placed here correctly */}
    </DataContext.Provider>
  );
  
};
