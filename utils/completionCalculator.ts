import { EstimatedCompletion, Order, WorkPreferences } from '../types';

export const calculateEstimatedCompletions = (
  orders: Order[],
  workPreferences: WorkPreferences
): EstimatedCompletion[] => {
  const activeOrders = orders
    .filter(order => order.status !== 'complete')
    .sort((a, b) => {
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      return a.dateReceived.getTime() - b.dateReceived.getTime();
    });

  const estimations: EstimatedCompletion[] = [];
  let currentDate = new Date(); // Use updated date between iterations
  let carryOverHours = 0;

  for (const order of activeOrders) {
    const remainingHours = Math.max(0, order.estimatedHours - order.hoursCompleted);
    carryOverHours += remainingHours;

    const estimatedDate = calculateDateFromHours(
      currentDate,
      carryOverHours,
      workPreferences
    );

    estimations.push({
      orderId: order.id,
      estimatedDate,
      remainingHours,
    });

    currentDate = new Date(estimatedDate); // Start from the new estimate
  }

  return estimations;
};

export const calculateDateFromHours = (
  startDate: Date,
  totalHours: number,
  workPreferences: WorkPreferences
): Date => {
  let workingDate = new Date(startDate);
  workingDate.setHours(0, 0, 0, 0); // Normalize
  let remainingHours = totalHours;

  while (remainingHours > 0) {
    if (isWorkingDay(workingDate, workPreferences)) {
      const hoursToday = Math.min(remainingHours, workPreferences.hoursPerDay);
      remainingHours -= hoursToday;
    }

    if (remainingHours > 0) {
      workingDate.setDate(workingDate.getDate() + 1);
    }
  }

  return workingDate;
};

export const isWorkingDay = (date: Date, workPreferences: WorkPreferences): boolean => {
  const dayOfWeek = date.getDay();

  // Check for regular days off (e.g., weekends)
  if (workPreferences.daysOff.includes(dayOfWeek)) {
    return false;
  }

  // Check for custom days off
  return !workPreferences.customDaysOff.some(customDate => {
    const a = new Date(customDate);
    const b = new Date(date);
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return a.getTime() === b.getTime();
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// In completionCalculator.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `LW${year}${month}${day}-${random}`;
};
