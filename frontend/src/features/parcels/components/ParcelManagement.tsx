import React from 'react';
import ParcelManagementOrganism from './ParcelManagementOrganism';

interface ParcelManagementProps {
  searchTerm?: string;
  filterStatus?: string;
}

const ParcelManagement = ({ searchTerm = '', filterStatus = 'all' }: ParcelManagementProps) => {
  return (
    <ParcelManagementOrganism searchTerm={searchTerm} filterStatus={filterStatus} />
  );
};

export default ParcelManagement;