import { DiagramTheme } from '../types/diagram';

export const darkTheme: DiagramTheme = {
  name: 'dark',
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    background: '#1F2937',
    surface: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#4B5563',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B'
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 20
    },
    fontWeight: {
      normal: 400,
      bold: 600
    }
  },
  node: {
    default: {
      backgroundColor: '#374151',
      borderColor: '#4B5563',
      borderWidth: 2,
      textColor: '#F9FAFB',
      fontSize: 14
    },
    types: {
      rectangle: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      'rounded-rectangle': {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        borderRadius: 8,
        textColor: '#F9FAFB'
      },
      circle: {
        backgroundColor: '#6366F1',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      ellipse: {
        backgroundColor: '#6366F1',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      diamond: {
        backgroundColor: '#F59E0B',
        borderColor: '#4B5563',
        textColor: '#1F2937'
      },
      triangle: {
        backgroundColor: '#10B981',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      hexagon: {
        backgroundColor: '#8B5CF6',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      pentagon: {
        backgroundColor: '#8B5CF6',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      star: {
        backgroundColor: '#EF4444',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      parallelogram: {
        backgroundColor: '#F97316',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      trapezoid: {
        backgroundColor: '#EC4899',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      },
      custom: {
        backgroundColor: '#374151',
        borderColor: '#4B5563',
        textColor: '#F9FAFB'
      }
    }
  },
  edge: {
    default: {
      strokeColor: '#6B7280',
      strokeWidth: 2,
      arrowhead: 'arrow'
    },
    types: {
      straight: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        arrowhead: 'arrow'
      },
      curved: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        arrowhead: 'arrow'
      },
      orthogonal: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        arrowhead: 'arrow'
      },
      bezier: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        arrowhead: 'arrow'
      }
    }
  }
};
