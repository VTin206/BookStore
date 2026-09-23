import React from 'react';

export const SkeletonBox: React.FC<{
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)', style }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--surface-alt)',
        backgroundImage: 'linear-gradient(90deg, var(--surface-alt) 0px, #e2e8f0 50%, var(--surface-alt) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.5s infinite linear',
        ...style,
      }}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <SkeletonBox height="240px" borderRadius="var(--radius-md)" />
      <SkeletonBox width="60%" height="16px" />
      <SkeletonBox width="90%" height="20px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <SkeletonBox width="45%" height="24px" />
        <SkeletonBox width="35%" height="32px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBox key={i} height="48px" />
      ))}
    </div>
  );
};
