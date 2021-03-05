import md5 from 'blueimp-md5';

const key = 'jlgexpress';

function md5Deep(str: string) {
  return md5(str, key);
}
export default md5Deep;
