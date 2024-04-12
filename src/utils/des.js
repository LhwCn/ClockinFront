/*
 * @Description: des加解密
 */
import CryptoJS from 'crypto-js'

export const encryptDes = (message, k) => {
  const key = CryptoJS.enc.Utf8.parse(k)
  const msg = CryptoJS.enc.Utf8.parse(message)
  const encrypted = CryptoJS.DES.encrypt(msg, key, { iv: key, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  const base = CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
  return base
}

export const decryptDes = (message, k) => {
  const key = CryptoJS.enc.Utf8.parse(k)
  const decryptedStr = CryptoJS.DES.decrypt(message, key, { iv: key, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 })
  return CryptoJS.enc.Utf8.stringify(decryptedStr)
}
