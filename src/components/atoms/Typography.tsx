import React from 'react';

type TextVariant =
  | 'headline-xl'
  | 'headline-lg'
  | 'headline-md'
  | 'body-lg'
  | 'body-md'
  | 'label-bold'
  | 'label-sm'
  | 'data-tabular';

interface TypographyProps {
  variant: TextVariant;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<TextVariant, string> = {
  'headline-xl': 'font-manrope text-[32px] leading-[40px] tracking-[-0.02em] font-bold',
  'headline-lg': 'font-manrope text-[24px] leading-[32px] tracking-[-0.01em] font-semibold',
  'headline-md': 'font-manrope text-[20px] leading-[28px] font-semibold',
  'body-lg': 'font-inter text-[16px] leading-[24px] font-normal',
  'body-md': 'font-inter text-[14px] leading-[20px] font-normal',
  'label-bold': 'font-inter text-[12px] leading-[16px] tracking-[0.05em] font-semibold uppercase',
  'label-sm': 'font-inter text-[12px] leading-[16px] font-medium',
  'data-tabular': 'font-inter text-[14px] leading-[20px] font-normal tabular-nums',
};

const variantElement: Record<TextVariant, React.ElementType> = {
  'headline-xl': 'h1',
  'headline-lg': 'h2',
  'headline-md': 'h3',
  'body-lg': 'p',
  'body-md': 'p',
  'label-bold': 'span',
  'label-sm': 'span',
  'data-tabular': 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant,
  as,
  className = '',
  children,
}) => {
  const Tag = as ?? variantElement[variant];

  return (
    <Tag className={`${variantStyles[variant]} ${className}`}>
      {children}
    </Tag>
  );
};

export default Typography;
