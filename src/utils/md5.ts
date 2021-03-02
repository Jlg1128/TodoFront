import md5 from 'blueimp-md5';

function md5Deep(str: string) {
  const key = 'jlgexpress';
  return md5(str, key);
}
export default md5Deep;
