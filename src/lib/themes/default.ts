import { DiagramTheme } from '../types/diagram';

export const defaultTheme: DiagramTheme = {
  name: 'default',
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#D1D5DB',
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
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18
    },
    fontWeight: {
      normal: 400,
      bold: 600
    }
  },
  node: {
    default: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D1D5DB',
      borderWidth: 1,
      borderRadius: 4,
      textColor: '#111827',
      fontSize: 14,
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontWeight: 'normal',
      padding: 8,
      shadow: false
    },
    types: {
      rectangle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 4,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      circle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 50,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      diamond: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      'rounded-rectangle': {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 8,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      triangle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      hexagon: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      pentagon: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      star: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      ellipse: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 50,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      parallelogram: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      trapezoid: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 0,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      },
      custom: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 4,
        textColor: '#111827',
        fontSize: 14,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 'normal',
        padding: 8,
        shadow: false
      }
    }
  },
  edge: {
    default: {
      strokeColor: '#6B7280',
      strokeWidth: 2,
      strokeDasharray: undefined,
      fillColor: '#6B7280',
      arrowhead: 'arrow',
      animated: false
    },
    types: {
      straight: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        strokeDasharray: undefined,
        fillColor: '#6B7280',
        arrowhead: 'arrow',
        animated: false
      },
      curved: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        strokeDasharray: undefined,
        fillColor: '#6B7280',
        arrowhead: 'arrow',
        animated: false
      },
      orthogonal: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        strokeDasharray: undefined,
        fillColor: '#6B7280',
        arrowhead: 'arrow',
        animated: false
      },
      bezier: {
        strokeColor: '#6B7280',
        strokeWidth: 2,
        strokeDasharray: undefined,
        fillColor: '#6B7280',
        arrowhead: 'arrow',
        animated: false
      }
    }
  }
};
