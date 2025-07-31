import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/completionCalculator';


interface OrderCardProps {
  order: Order;
  onPress: () => void;
  showEstimatedCompletion?: boolean;
  estimatedDate?: Date;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  showEstimatedCompletion = false,
  estimatedDate,
}) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'waiting':
        return '#F59E0B';
      case 'started':
        return '#3B82F6';
      case 'complete':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'waiting':
        return 'Waiting';
      case 'started':
        return 'In Progress';
      case 'complete':
        return 'Complete';
      default:
        return status;
    }
  };

  const progressPercentage = (order.hoursCompleted / order.estimatedHours) * 100;
  const remainingHours = Math.max(0, order.estimatedHours - order.hoursCompleted);
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // adjust as needed

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      

      <View style={styles.header}>
          <Text style={styles.clientName}>{order.clientName} | {order.jobTitle}</Text>
        </View>

        <Text style={styles.orderNumber}>{order.orderNumber}</Text>

        {isMobile && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status), alignSelf: 'flex-start', marginBottom: 8 }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
        )}

        {!isMobile && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status), position: 'absolute', top: 16, right: 16 }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
        )}

      <Text style={styles.description} numberOfLines={2}>
        {order.description}
      </Text>

      <View style={styles.dateRow}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Received</Text>
          <Text style={styles.dateValue}>{formatDate(order.dateReceived)}</Text>
        </View>
        {order.deadline && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Deadline</Text>
            <Text style={[
              styles.dateValue,
              order.deadline < new Date() && order.status !== 'complete' && styles.overdue
            ]}>
              {formatDate(order.deadline)}
            </Text>
          </View>
        )}
      </View>

      {showEstimatedCompletion && estimatedDate && (
        <View style={styles.estimationContainer}>
          <Text style={styles.estimationLabel}>Est. Completion</Text>
          <Text style={styles.estimationValue}>{formatDate(estimatedDate)}</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {order.hoursCompleted}h / {order.estimatedHours}h completed
          </Text>
          <Text style={styles.remainingText}>
            {remainingHours}h remaining
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progressPercentage, 100)}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Cost</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.internalCost)}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={[styles.priceValue, styles.clientPrice]}>
            {formatCurrency(order.clientPrice)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 4,

  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  overdue: {
    color: '#DC2626',
    fontWeight: '600',
  },
  estimationContainer: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  estimationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  estimationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  remainingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B4513',
    borderRadius: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  clientPrice: {
    color: '#059669',
  },
  
  
});