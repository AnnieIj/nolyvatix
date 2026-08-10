import React from 'react';
import { GlassCard, GlassCardProps } from './GlassCard';

export type CardProps = GlassCardProps;

export const Card: React.FC<CardProps> = (props) => {
  return <GlassCard {...props} />;
};
