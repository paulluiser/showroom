export function resolveCharacters(text,progress,frame) {
 const symbols='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 return Array.from(text,(char,index)=>{
  if(/\s/.test(char)||progress>=1||index/text.length<progress*1.2-.12)return char;
  return symbols[(index*13+frame*7)%symbols.length];
 }).join('');
}
