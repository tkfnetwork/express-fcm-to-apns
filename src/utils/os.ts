export const isOS = (platform: NodeJS.Platform) => process.platform === platform;
export const isMac = () => isOS('darwin');
