// src/assets/Icons/icons.jsx

const SpriteIcon = ({ id, width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} fill="none" className={className} style={style}>
    <use href={`/sprite.svg#${id}`} />
  </svg>
);

export const IconChart = () => <SpriteIcon id="icon-chart" width={20} height={20} />;
export const IconHourglass = () => <SpriteIcon id="icon-hourglass" width={20} height={20} />;
export const AttachmentIcon = () => <SpriteIcon id="icon-attachment" width={18} height={18} />;
export const ArrowRightIcon = () => <SpriteIcon id="icon-arrow-right" width={24} height={24} />;
export const EyeOpenIcon = () => <SpriteIcon id="icon-eye-open" width={20} height={20} />;
export const EyeClosedIcon = () => <SpriteIcon id="icon-eye-closed" width={20} height={20} />;
export const ErrorIcon = () => <SpriteIcon id="icon-error" width={20} height={20} />;
export const SuccessIcon = () => <SpriteIcon id="icon-success" width={20} height={20} />;
export const ChevronLeftIcon = () => <SpriteIcon id="icon-chevron-left" width={24} height={24} />;
export const ChevronRightIcon = () => <SpriteIcon id="icon-chevron-right" width={24} height={24} />;
export const ChevronDownIcon = () => <SpriteIcon id="icon-chevron-down" width={24} height={24} />;
export const TrashIcon = () => <SpriteIcon id="icon-trash" width={14} height={14} style={{ color: '#E85050' }} />;
export const BookIcon = () => <SpriteIcon id="icon-book" width={68} height={68} />;
export const FolderIcon = () => <SpriteIcon id="icon-folder" width={42} height={17} />;
export const StatusIndicator = () => <SpriteIcon id="icon-status" width={50} height={50} />;