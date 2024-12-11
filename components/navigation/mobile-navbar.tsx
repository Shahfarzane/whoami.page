'use client';

import React from 'react';
import Navigation from '@/components/navigation/navigations';

const MobileNavbar = () => {
  return (
    <div className="fixed bottom-0 left-0 z-50 h-14 w-full border-neutral-300 bg-background/90 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex h-full w-full items-center justify-between px-4">
        <Navigation />
      </div>
    </div>
  );
};

export default MobileNavbar;
