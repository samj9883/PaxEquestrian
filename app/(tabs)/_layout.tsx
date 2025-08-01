import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width <= 480;

  const dynamicTabBarStyle = {
    ...styles.tabBar,
    height: isMobileWeb ? 80 : styles.tabBar.height,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: dynamicTabBarStyle,
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
          tabBarIcon: ({ color }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Orders',
        }}
      />
      <Tabs.Screen
        name="estimation"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Completion Timeline',
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => (
            <View style={[styles.icon, { backgroundColor: color }]} />
          ),
          headerTitle: 'Clients',
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color }) => (
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
    height: 60, // default height
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
