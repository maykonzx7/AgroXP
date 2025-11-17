
import React from 'react';
import { EditableField } from '../ui/editable-field';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description: string;
  onTitleChange: (value: string | number) => void;
  onDescriptionChange: (value: string | number) => void;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'centered' | 'compact';
  badge?: React.ReactNode;
  stats?: React.ReactNode;
  filterArea?: React.ReactNode;
}

const PageHeader = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange,
  actions,
  className = '',
  icon,
  variant = 'default',
  badge,
  stats,
  filterArea
}: PageHeaderProps) => {
  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={contentVariants}
      className={`page-header ${variant === 'centered' ? 'flex-col items-center text-center' : 
        variant === 'compact' ? 'flex-row items-center pb-4' : 
        ''} ${className}`}
    >
      <div className="flex flex-col space-y-3 flex-grow min-w-0">
        <div className={`flex ${variant === 'compact' ? 'items-center gap-3' : 'flex-col gap-2'}`}>
          {variant === 'compact' ? (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {icon && (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  {icon}
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <motion.h1 variants={itemVariants} className="page-title text-2xl break-words">
                  <EditableField
                    value={title}
                    onSave={onTitleChange}
                    className="inline-block break-words"
                    showEditIcon
                    asSpan
                  />
                  {badge && <span className="ml-2 whitespace-nowrap">{badge}</span>}
                </motion.h1>
                
                {variant === 'compact' && (
                  <motion.p variants={itemVariants} className="page-description text-sm break-words">
                    <EditableField
                      value={description}
                      onSave={onDescriptionChange}
                      className="inline-block break-words"
                      showEditIcon
                      asSpan
                    />
                  </motion.p>
                )}
              </div>
            </div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    {icon}
                  </div>
                )}
                <h1 className="page-title break-words min-w-0">
                  <EditableField
                    value={title}
                    onSave={onTitleChange}
                    className="inline-block break-words"
                    showEditIcon
                    asSpan
                  />
                  {badge && <span className="ml-2 whitespace-nowrap">{badge}</span>}
                </h1>
              </motion.div>
              
              <motion.p variants={itemVariants} className="page-description break-words">
                <EditableField
                  value={description}
                  onSave={onDescriptionChange}
                  className="inline-block break-words"
                  showEditIcon
                  asSpan
                />
              </motion.p>
            </>
          )}
        </div>
        
        {stats && <motion.div variants={itemVariants} className="mt-1">{stats}</motion.div>}
      </div>
      
      <div className="flex flex-col space-y-3 mt-4 md:mt-0 md:items-end flex-shrink-0">
        {actions && (
          <motion.div 
            variants={itemVariants}
            className={`flex flex-wrap items-center gap-2 ${variant === 'centered' ? 'justify-center' : 'justify-end'}`}
          >
            {actions}
          </motion.div>
        )}
        
        {filterArea && (
          <motion.div variants={itemVariants} className="w-full md:w-auto min-w-0">
            {filterArea}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default PageHeader;
