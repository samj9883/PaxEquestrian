import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        headerShown: true,
        headerStyle: {
          backgroundColor: '#8B4513',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Orders',
        }}
      />
      <Tabs.Screen
        name="estimation"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Completion Timeline',
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Clients',
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Add Entry',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});