
import React from 'react';

import { PageLayout, PageHeader } from '@/shared/components/layout';
import ParcelDetail from '../components/ParcelDetail';

import usePageMetadata from '../hooks/use-page-metadata';

const ParcelsDetailsPage = () => {
  const { 
    title, 
    description, 
    handleTitleChange, 
    handleDescriptionChange 
  } = usePageMetadata({
    defaultTitle: 'Gerenciamento de Parcelas',
    defaultDescription: 'Gerencie, monitore e otimize suas parcelas agrícolas'
  });

  return (
    <PageLayout>
      <div className="p-6 animate-enter">
        <PageHeader 
          title={title}
          description={description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
        />

        <ParcelDetail />
      </div>
    </PageLayout>
  );
};

export default ParcelsDetailsPage;
