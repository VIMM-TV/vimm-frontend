import React, { useRef, useEffect } from 'react';
import { useVimmPlayer } from '@vimm-tv/vimm-player';
import './VimmPlayer.css';

function VimmPlayer({ username, coreServer, className, style, onReady, onError }) {
  const {
    containerRef,
    isReady,
    isPlaying,
    hasError,
    controls
  } = useVimmPlayer({
    username,
    coreServer,
    options: {
      autoplay: true,
      theme: 'dark',
      responsive: true,
      controls: true
    }
  });

  useEffect(() => {
    if (isReady && onReady) {
      onReady();
    }
  }, [isReady, onReady]);

  useEffect(() => {
    if (hasError && onError) {
      onError(hasError);
    }
  }, [hasError, onError]);

  return (
    <div 
      ref={containerRef} 
      className={`vimm-player-container ${className || ''}`}
      style={style}
    />
  );
}

export default VimmPlayer;