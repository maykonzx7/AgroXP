import { spacingConfig, standardClasses, animationConfig } from '../utils/spacing-config';

// Hook to provide standardized spacing utilities
export const useSpacing = () => {
  return {
    // Spacing configuration
    spacing: spacingConfig,
    
    // Standardized class combinations
    classes: standardClasses,
    
    // Animation configurations
    animations: animationConfig,
    
    // Utility functions for common spacing patterns
    getPageContainerClasses: () => standardClasses.pageContainer,
    
    getSectionHeaderClasses: () => standardClasses.sectionHeader,
    
    getCardContainerClasses: () => standardClasses.cardContainer,
    
    getActionButtonGroupClasses: () => standardClasses.actionButtonGroup,
    
    getFormContainerClasses: () => standardClasses.formContainer,
    
    getGridContainerClasses: (columns: { mobile?: number; tablet?: number; desktop?: number } = {}) => {
      const mobileCols = columns.mobile || 1;
      const tabletCols = columns.tablet || 2;
      const desktopCols = columns.desktop || 3;
      
      return `grid grid-cols-${mobileCols} md:grid-cols-${tabletCols} lg:grid-cols-${desktopCols} ${spacingConfig.grid.gap}`;
    },
    
    getTableContainerClasses: () => standardClasses.tableContainer,
    
    getDialogContentClasses: () => standardClasses.dialogContent,
    
    getTabContentClasses: () => standardClasses.tabContent,
    
    // Generate responsive padding classes
    getResponsivePadding: (size: 'small' | 'medium' | 'large' = 'medium') => {
      const paddingMap = {
        small: 'p-2 md:p-3',
        medium: 'p-4 md:p-6',
        large: 'p-6 md:p-8'
      };
      
      return paddingMap[size];
    },
    
    // Generate responsive margin classes
    getResponsiveMargin: (direction: 'all' | 'bottom' | 'top' | 'left' | 'right' = 'all', size: 'small' | 'medium' | 'large' = 'medium') => {
      const marginMap = {
        small: 'm-2',
        medium: 'm-4',
        large: 'm-6'
      };
      
      const directionalMap = {
        bottom: {
          small: 'mb-2',
          medium: 'mb-4',
          large: 'mb-6'
        },
        top: {
          small: 'mt-2',
          medium: 'mt-4',
          large: 'mt-6'
        },
        left: {
          small: 'ml-2',
          medium: 'ml-4',
          large: 'ml-6'
        },
        right: {
          small: 'mr-2',
          medium: 'mr-4',
          large: 'mr-6'
        }
      };
      
      if (direction === 'all') {
        return marginMap[size];
      }
      
      return directionalMap[direction][size];
    },
    
    // Generate flex container classes with gap
    getFlexContainerClasses: (direction: 'row' | 'col' = 'row', gap: 'small' | 'medium' | 'large' = 'medium', wrap: boolean = true) => {
      const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
      const wrapClass = wrap ? 'flex-wrap' : '';
      const gapClass = gap === 'small' ? 'gap-2' : gap === 'medium' ? 'gap-4' : 'gap-6';
      
      return `flex ${directionClass} ${wrapClass} ${gapClass}`;
    }
  };
};

export default useSpacing;