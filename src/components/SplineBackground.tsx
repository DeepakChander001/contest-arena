import { useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineBackgroundProps {
  className?: string;
}

export const SplineBackground = ({ className = '' }: SplineBackgroundProps) => {
  const splineRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);

  const onLoad = (spline: any) => {
    splineRef.current = spline;
    setHasError(false);
    console.log('✅ Spline scene loaded successfully');
    
    // Optional: Adjust camera or scene settings
    if (spline && spline.findObjectByName) {
      // You can interact with objects in the scene here
      // Example: const camera = spline.findObjectByName('Camera');
    }
  };

  const onError = (error: Error) => {
    console.error('❌ Error loading Spline scene:', error);
    setHasError(true);
  };

  // If error occurs, don't render the Spline component
  if (hasError) {
    return null;
  }

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`} 
      style={{ zIndex: 0 }}
    >
      <Spline
        scene="/reactive_background.splinecode"
        onLoad={onLoad}
        onError={onError}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

