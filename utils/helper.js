export function dataToFormData(obj){
  return Object.entries(obj).reduce((prev, [key, value]) => {
    if(typeof value === 'string' && value === ''){
      return prev
    } else {
      prev.append(key, value)
    }
    return prev;
  }, new FormData())
}

export function dataURLtoBlob(dataurl){
  let arr = dataurl.split(','), 
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type:mime });
}