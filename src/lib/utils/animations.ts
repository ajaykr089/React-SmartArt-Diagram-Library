export class AnimationUtils {
  /**
   * Easing functions for smooth animations
   */
  static easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeOut(t: number): number {
    return t * (2 - t);
  }

  static easeIn(t: number): number {
    return t * t;
  }

  /**
   * Animate a value over time
   */
  static animateValue(
    startValue: number,
    endValue: number,
    duration: number,
    easing: (t: number) => number = this.easeInOut,
    onUpdate: (value: number) => void,
    onComplete?: () => void
  ): () => void {
    const startTime = Date.now();
    let animationId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      onUpdate(currentValue);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationId = requestAnimationFrame(animate);

    // Return cancel function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }

  /**
   * Animate an element's position
   */
  static animatePosition(
    element: HTMLElement,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 300,
    onComplete?: () => void
  ): () => void {
    return this.animateValue(
      0,
      1,
      duration,
      this.easeInOut,
      (progress) => {
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        element.style.transform = `translate(${currentX}px, ${currentY}px)`;
      },
      onComplete
    );
  }

  /**
   * Animate an element's opacity
   */
  static animateOpacity(
    element: HTMLElement,
    startOpacity: number,
    endOpacity: number,
    duration: number = 200,
    onComplete?: () => void
  ): () => void {
    return this.animateValue(
      startOpacity,
      endOpacity,
      duration,
      this.easeInOut,
      (opacity) => {
        element.style.opacity = opacity.toString();
      },
      onComplete
    );
  }

  /**
   * Animate an element's scale
   */
  static animateScale(
    element: HTMLElement,
    startScale: number,
    endScale: number,
    duration: number = 200,
    onComplete?: () => void
  ): () => void {
    return this.animateValue(
      startScale,
      endScale,
      duration,
      this.easeOut,
      (scale) => {
        element.style.transform = `scale(${scale})`;
      },
      onComplete
    );
  }

  /**
   * Create a smooth transition for multiple properties
   */
  static createTransition(
    properties: Array<{
      element: HTMLElement;
      property: string;
      startValue: number;
      endValue: number;
    }>,
    duration: number = 300,
    onComplete?: () => void
  ): () => void {
    let completedCount = 0;
    const totalAnimations = properties.length;

    const cancelFunctions = properties.map((prop) => {
      return this.animateValue(
        prop.startValue,
        prop.endValue,
        duration,
        this.easeInOut,
        (value) => {
          (prop.element as any).style[prop.property] = value;
        },
        () => {
          completedCount++;
          if (completedCount === totalAnimations) {
            onComplete?.();
          }
        }
      );
    });

    // Return function to cancel all animations
    return () => {
      cancelFunctions.forEach(cancel => cancel());
    };
  }

  /**
   * Debounce function for performance optimization
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Create a ripple effect animation
   */
  static createRipple(
    container: HTMLElement,
    x: number,
    y: number,
    color: string = 'rgba(255, 255, 255, 0.3)',
    duration: number = 600
  ): void {
    const ripple = document.createElement('div');
    const size = Math.max(container.clientWidth, container.clientHeight);

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background-color: ${color};
      transform: scale(0);
      animation: ripple ${duration}ms linear;
      pointer-events: none;
      width: ${size}px;
      height: ${size}px;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;

    container.appendChild(style);
    container.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
      style.remove();
    }, duration);
  }

  /**
   * Create a pulse animation
   */
  static pulse(
    element: HTMLElement,
    duration: number = 1000,
    scale: number = 1.05
  ): () => void {
    let animationId: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      // Create a sine wave for pulsing effect
      const pulseValue = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
      const currentScale = 1 + pulseValue * (scale - 1);

      element.style.transform = `scale(${currentScale})`;

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      element.style.transform = '';
    };
  }
}
