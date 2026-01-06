import { DiagramTheme } from '../types/diagram';

export const corporateTheme: DiagramTheme = {
  name: 'corporate',
  colors: {
    primary: '#1F2937',
    secondary: '#374151',
    accent: '#6B7280',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#059669',
    warning: '#D97706'
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      borderWidth: 2,
      textColor: '#111827',
      fontSize: 14,
      shadow: true
    },
    types: {
      rectangle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        textColor: '#111827',
        shadow: true
      },
      'rounded-rectangle': {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        borderRadius: 6,
        textColor: '#111827',
        shadow: true
      },
      circle: {
        backgroundColor: '#1F2937',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      ellipse: {
        backgroundColor: '#1F2937',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      diamond: {
        backgroundColor: '#059669',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      triangle: {
        backgroundColor: '#7C3AED',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      hexagon: {
        backgroundColor: '#DC2626',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      pentagon: {
        backgroundColor: '#DC2626',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      star: {
        backgroundColor: '#D97706',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      parallelogram: {
        backgroundColor: '#0891B2',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      trapezoid: {
        backgroundColor: '#BE185D',
        borderColor: '#E5E7EB',
        textColor: '#FFFFFF'
      },
      custom: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
        textColor: '#111827',
        shadow: true
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
