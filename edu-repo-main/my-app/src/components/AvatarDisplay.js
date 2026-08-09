import React, { useMemo } from 'react';
import { generateAvataaarsSvg, FRAME_STYLES } from '../utils/avatarHelper';

/**
 * Reusable avatar display component.
 * Renders DiceBear avataaars locally with options and custom frames.
 */
const AvatarDisplay = ({
  config,
  size = 48,
  onClick,
  border,
  shadow,
  className,
  containerStyle = {},
}) => {
  const svgString = useMemo(() => {
    return generateAvataaarsSvg(config || {});
  }, [config]);

  const frameKey = config?.frame || 'blue';
  const frameStyle = FRAME_STYLES[frameKey] || FRAME_STYLES.blue;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        border: border || frameStyle.border,
        boxShadow: shadow || frameStyle.boxShadow,
        background: config?.background ? `#${config.background.replace('#','')}` : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease',
        ...containerStyle,
      }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

export default AvatarDisplay;
