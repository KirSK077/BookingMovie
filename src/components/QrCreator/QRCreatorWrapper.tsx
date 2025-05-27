import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    QRCreator: (text: string, options?: Record<string, unknown>) => {
      result: SVGElement | HTMLCanvasElement | HTMLElement | string;
      error?: string;
      errorSubcode?: string;
    };
  }
}

interface QRCreatorProps {
  text: string;
  mode?: number;
  eccl?: number;
  mask?: number;
  size?: number;
  margin?: number;
  imageType?: 'PNG' | 'SVG' | 'HTML';
  scriptSrc?: string;
}

const QRCreator: React.FC<QRCreatorProps> = ({
  text,
  mode = 4,
  eccl = 2,
  mask = 1,
  size = 3,
  margin = 4,
  imageType = 'PNG',
  scriptSrc = `src/components/QrCreator/QRCreator.js`,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (typeof window.QRCreator !== 'undefined') {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error('Ошибка загрузки QRCreator.js');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [scriptSrc]);

  useEffect(() => {
    if (!scriptLoaded || !window.QRCreator || !containerRef.current) return;

    const qr = window.QRCreator(text, {
      mode: mode,
      eccl: eccl,
      mask: mask,
      modsize: size,
      margin: margin,
      image: imageType,
    });

    if (imageType === 'SVG' && qr.result instanceof SVGElement) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(qr.result);
    } else if (imageType === 'PNG' && qr.result instanceof HTMLCanvasElement) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(qr.result);
    } else if (imageType === 'HTML' && qr.result instanceof HTMLElement) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(qr.result);
    } else if (typeof qr.result === 'string') {
      containerRef.current.innerHTML = qr.result;
    }
  }, [text, mode, eccl, mask, size, margin, imageType, scriptLoaded]);

  return <span ref={containerRef} />;
};

export default QRCreator;
