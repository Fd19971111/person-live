/** 相册模块的主色，与后端 catalog 中的模块颜色一致。 */
export const ALBUM_COLOR = "#5F8C93";

/** 单张照片大小上限，与后端保持一致。 */
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

/** 把字节数写成 820 B / 1.4 MB。 */
export function fileSizeText(bytes: number) {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
