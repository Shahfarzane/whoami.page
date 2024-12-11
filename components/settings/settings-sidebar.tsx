'use client';

import React from 'react';
import styles from './sidebar.module.css';

interface SettingsSidebarItemProps<T extends string> {
  id: T;
  name: string;
}

interface SettingsSidebarProps<T extends string> {
  items: SettingsSidebarItemProps<T>[];
  selectedItem: T;
  onSelectItem: (id: T) => void;
  isMobileView: boolean;
  showSidebar: boolean;
}

function SettingsSidebar<T extends string>({
  items,
  selectedItem,
  onSelectItem,
  isMobileView,
  showSidebar,
}: SettingsSidebarProps<T>) {
  if (!showSidebar && isMobileView) {
    return null;
  }

  return (
    <div
      className={`${styles.sidebar} ${isMobileView ? styles.mobileSidebar : ''}`}
    >
      <div className={styles.sidebarInner}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarNav}>
            {items.map((item) => (
              <a
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectItem(item.id);
                }}
                className={styles.sidebarNavItem}
                data-active={selectedItem === item.id}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsSidebar;
