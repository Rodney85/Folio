import React from 'react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { SubscriptionManagement } from '@/components/ui/SubscriptionManagement';

const SubscriptionManagePage = () => {
  return (
    <ResponsiveLayout>
      <SubscriptionManagement />
    </ResponsiveLayout>
  );
};

export default SubscriptionManagePage;
