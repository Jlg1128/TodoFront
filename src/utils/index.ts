export function getModalWidth(clientWidth: number) {
  if (clientWidth < 640) {
    return '80%';
  } if (clientWidth < 1200) {
    return '300px';
  }
    return '350px';
 }