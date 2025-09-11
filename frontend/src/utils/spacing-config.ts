// Standardized spacing configuration for consistent UI across the application
// Based on Tailwind CSS spacing scale and the existing patterns in the application

export const spacingConfig = {
  // Page container padding
  page: {
    paddingX: {
      mobile: 'px-3',
      desktop: 'px-6',
      wide: 'px-8'
    },
    paddingY: {
      top: 'pt-4',
      bottom: 'pb-6'
    }
  },
  
  // Section spacing
  section: {
    marginBottom: 'mb-6',
    marginTop: 'mt-6',
    paddingX: 'px-4',
    paddingY: 'py-4'
  },
  
  // Card spacing
  card: {
    padding: 'p-4',
    paddingX: 'px-4',
    paddingY: 'py-4',
    margin: 'm-4',
    marginBottom: 'mb-4',
    borderRadius: 'rounded-xl',
    borderWidth: 'border',
    shadow: 'shadow-sm'
  },
  
  // Header spacing
  header: {
    marginBottom: 'mb-6',
    titleMarginBottom: 'mb-1',
    descriptionMarginTop: 'mt-1'
  },
  
  // Grid spacing
  grid: {
    gap: 'gap-4',
    gapSmall: 'gap-2',
    gapMedium: 'gap-4',
    gapLarge: 'gap-6'
  },
  
  // Form spacing
  form: {
    fieldSpacing: 'space-y-4',
    inputMarginBottom: 'mb-4',
    labelMarginBottom: 'mb-2'
  },
  
  // Button spacing
  button: {
    gap: 'gap-2',
    margin: 'm-1',
    marginRight: 'mr-2',
    marginLeft: 'ml-2'
  },
  
  // Table spacing
  table: {
    cellPadding: 'px-4 py-2',
    headerPadding: 'px-4 py-3'
  },
  
  // Modal/Dialog spacing
  dialog: {
    padding: 'p-6',
    headerPadding: 'px-6 pt-6',
    contentPadding: 'px-6 py-4',
    footerPadding: 'px-6 pb-6'
  },
  
  // Tab spacing
  tabs: {
    marginBottom: 'mb-6',
    tabPaddingX: 'px-4',
    tabPaddingY: 'py-2'
  }
};

// Standardized class combinations for common UI elements
export const standardClasses = {
  // Page container
  pageContainer: `${spacingConfig.page.paddingX.desktop} ${spacingConfig.page.paddingY.top} ${spacingConfig.page.paddingY.bottom} animate-enter`,
  
  // Section header
  sectionHeader: `flex flex-col md:flex-row md:justify-between md:items-center ${spacingConfig.header.marginBottom} gap-4`,
  
  // Card container
  cardContainer: `bg-white rounded-xl border ${spacingConfig.card.padding} shadow-sm`,
  
  // Action button group
  actionButtonGroup: `flex flex-wrap gap-2`,
  
  // Form container
  formContainer: `space-y-6`,
  
  // Grid container
  gridContainer: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${spacingConfig.grid.gap}`,
  
  // Table container
  tableContainer: `overflow-x-auto`,
  
  // Dialog content
  dialogContent: `max-w-4xl`,
  
  // Tab content
  tabContent: `animate-fade-in transition-all duration-300`
};

// Responsive breakpoints for spacing
export const responsiveSpacing = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  desktop: '(min-width: 1024px)'
};

// Animation configurations
export const animationConfig = {
  fade: 'animate-fade-in',
  enter: 'animate-enter',
  slideUp: 'animate-slide-up',
  duration: {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500'
  }
};

export default spacingConfig;