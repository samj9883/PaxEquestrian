declare const window: any;

import { Alert, Platform } from 'react-native';

export const confirmLogout = (logout: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  } else {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  }
};
