#!/usr/bin/env node
/**
 * Insert profile app-role i18n keys into all src/app/i18n/lang/*.ts (skip if present).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANG_DIR = path.join(__dirname, '../src/app/i18n/lang');

/** @type {Record<string, Record<string, string>>} */
const APP_ROLE = {
  'zh-TW': {
    appRoleLabel: '帳號類型',
    appRoleFarmer: '農民',
    appRoleStore: '商店',
    appRoleHintFirst:
      '請選擇一次。儲存後無法在應用內自行修改，如需變更請聯繫維運。',
    appRoleLockedHint:
      '帳號類型已確定，無法在應用內修改。如需變更請聯繫維運。',
    appRoleRequired: '請選擇農民或商店後再儲存。',
  },
  es: {
    appRoleLabel: 'Tipo de cuenta',
    appRoleFarmer: 'Agricultor',
    appRoleStore: 'Tienda',
    appRoleHintFirst:
      'Elíjalo una sola vez. Tras guardar no podrá cambiarlo en la app; contacte soporte si necesita ayuda.',
    appRoleLockedHint:
      'El tipo de cuenta ya está fijado y no se puede cambiar en la app. Contacte soporte para cambios.',
    appRoleRequired: 'Elija Agricultor o Tienda antes de guardar.',
  },
  fr: {
    appRoleLabel: 'Type de compte',
    appRoleFarmer: 'Agriculteur',
    appRoleStore: 'Magasin',
    appRoleHintFirst:
      'Choisissez une seule fois. Après l’enregistrement, vous ne pourrez plus modifier dans l’app ; contactez le support si besoin.',
    appRoleLockedHint:
      'Le type de compte est définitif et ne peut pas être modifié dans l’app. Contactez le support pour un changement.',
    appRoleRequired: 'Choisissez Agriculteur ou Magasin avant d’enregistrer.',
  },
  pt: {
    appRoleLabel: 'Tipo de conta',
    appRoleFarmer: 'Agricultor',
    appRoleStore: 'Loja',
    appRoleHintFirst:
      'Escolha uma vez. Depois de guardar, não pode alterar na app — contacte o suporte se precisar.',
    appRoleLockedHint:
      'O tipo de conta está definido e não pode ser alterado na app. Contacte o suporte para mudanças.',
    appRoleRequired: 'Escolha Agricultor ou Loja antes de guardar.',
  },
  ar: {
    appRoleLabel: 'نوع الحساب',
    appRoleFarmer: 'مزارع',
    appRoleStore: 'متجر',
    appRoleHintFirst:
      'اختر مرة واحدة. بعد الحفظ لا يمكنك التغيير في التطبيق؛ تواصل مع الدعم عند الحاجة.',
    appRoleLockedHint:
      'نوع الحساب محدد ولا يمكن تغييره في التطبيق. تواصل مع الدعم للتعديل.',
    appRoleRequired: 'اختر مزارع أو متجر قبل الحفظ.',
  },
  hi: {
    appRoleLabel: 'खाता प्रकार',
    appRoleFarmer: 'किसान',
    appRoleStore: 'दुकान',
    appRoleHintFirst:
      'एक बार चुनें। सहेजने के बाद ऐप में बदल नहीं सकते; जरूरत हो तो सहायता से संपर्क करें।',
    appRoleLockedHint:
      'खाता प्रकार तय है और ऐप में बदला नहीं जा सकता। बदलाव के लिए सहायता से संपर्क करें।',
    appRoleRequired: 'सहेजने से पहले किसान या दुकान चुनें।',
  },
  ru: {
    appRoleLabel: 'Тип аккаунта',
    appRoleFarmer: 'Фермер',
    appRoleStore: 'Магазин',
    appRoleHintFirst:
      'Выберите один раз. После сохранения нельзя изменить в приложении; обратитесь в поддержку при необходимости.',
    appRoleLockedHint:
      'Тип аккаунта зафиксирован и не меняется в приложении. Для изменения обратитесь в поддержку.',
    appRoleRequired: 'Выберите «Фермер» или «Магазин» перед сохранением.',
  },
  bn: {
    appRoleLabel: 'অ্যাকাউন্টের ধরন',
    appRoleFarmer: 'কৃষক',
    appRoleStore: 'দোকান',
    appRoleHintFirst:
      'একবার বেছে নিন। সংরক্ষণের পর অ্যাপে পরিবর্তন করা যাবে না; প্রয়োজনে সাপোর্টে যোগাযোগ করুন।',
    appRoleLockedHint:
      'অ্যাকাউন্টের ধরন নির্ধারিত; অ্যাপে পরিবর্তন করা যাবে না। পরিবর্তনের জন্য সাপোর্টে যোগাযোগ করুন।',
    appRoleRequired: 'সংরক্ষণের আগে কৃষক বা দোকান বেছে নিন।',
  },
  ur: {
    appRoleLabel: 'اکاؤنٹ کی قسم',
    appRoleFarmer: 'کسان',
    appRoleStore: 'دکان',
    appRoleHintFirst:
      'ایک بار منتخب کریں۔ محفوظ کرنے کے بعد ایپ میں تبدیل نہیں کر سکتے؛ ضرورت ہو تو سپورٹ سے رابطہ کریں۔',
    appRoleLockedHint:
      'اکاؤنٹ کی قسم طے ہے اور ایپ میں تبدیل نہیں ہو سکتی۔ تبدیلی کے لیے سپورٹ سے رابطہ کریں۔',
    appRoleRequired: 'محفوظ کرنے سے پہلے کسان یا دکان منتخب کریں۔',
  },
  id: {
    appRoleLabel: 'Jenis akun',
    appRoleFarmer: 'Petani',
    appRoleStore: 'Toko',
    appRoleHintFirst:
      'Pilih sekali. Setelah disimpan tidak bisa diubah di aplikasi; hubungi dukungan jika perlu.',
    appRoleLockedHint:
      'Jenis akun sudah ditetapkan dan tidak bisa diubah di aplikasi. Hubungi dukungan untuk perubahan.',
    appRoleRequired: 'Pilih Petani atau Toko sebelum menyimpan.',
  },
  vi: {
    appRoleLabel: 'Loại tài khoản',
    appRoleFarmer: 'Nông dân',
    appRoleStore: 'Cửa hàng',
    appRoleHintFirst:
      'Chỉ chọn một lần. Sau khi lưu không thể đổi trong ứng dụng; liên hệ hỗ trợ nếu cần.',
    appRoleLockedHint:
      'Loại tài khoản đã cố định và không thể đổi trong ứng dụng. Liên hệ hỗ trợ để thay đổi.',
    appRoleRequired: 'Chọn Nông dân hoặc Cửa hàng trước khi lưu.',
  },
  ms: {
    appRoleLabel: 'Jenis akaun',
    appRoleFarmer: 'Petani',
    appRoleStore: 'Kedai',
    appRoleHintFirst:
      'Pilih sekali. Selepas simpan tidak boleh ubah dalam aplikasi; hubungi sokongan jika perlu.',
    appRoleLockedHint:
      'Jenis akaun telah ditetapkan dan tidak boleh diubah dalam aplikasi. Hubungi sokongan untuk perubahan.',
    appRoleRequired: 'Pilih Petani atau Kedai sebelum menyimpan.',
  },
  ja: {
    appRoleLabel: 'アカウント種別',
    appRoleFarmer: '農家',
    appRoleStore: '店舗',
    appRoleHintFirst:
      '一度だけ選択してください。保存後はアプリ内で変更できません。必要ならサポートへご連絡ください。',
    appRoleLockedHint:
      'アカウント種別は確定しており、アプリ内では変更できません。変更はサポートへご連絡ください。',
    appRoleRequired: '保存する前に農家または店舗を選択してください。',
  },
  th: {
    appRoleLabel: 'ประเภทบัญชี',
    appRoleFarmer: 'เกษตรกร',
    appRoleStore: 'ร้านค้า',
    appRoleHintFirst:
      'เลือกครั้งเดียว หลังบันทึกแล้วแก้ในแอปไม่ได้ ติดต่อฝ่ายสนับสนุนหากจำเป็น',
    appRoleLockedHint:
      'ประเภทบัญชีถูกกำหนดแล้วและแก้ในแอปไม่ได้ ติดต่อฝ่ายสนับสนุนเพื่อเปลี่ยน',
    appRoleRequired: 'เลือกเกษตรกรหรือร้านค้าก่อนบันทึก',
  },
  my: {
    appRoleLabel: 'အကောင့် အမျိုးအစား',
    appRoleFarmer: 'လယ်သမား',
    appRoleStore: 'ဆိုင်',
    appRoleHintFirst:
      'တစ်ကြိမ်သာ ရွေးပါ။ သိမ်းပြီးနောက် အက်ပ်ထဲတွင် မပြောင်းနိုင်ပါ — လိုအပ်ပါက ပံ့ပိုးကူညီမှုကို ဆက်သွယ်ပါ။',
    appRoleLockedHint:
      'အကောင့် အမျိုးအစား သတ်မှတ်ပြီးဖြစ်သည်။ အက်ပ်ထဲတွင် မပြောင်းနိုင်ပါ။ ပြောင်းလဲရန် ပံ့ပိုးကူညီမှုကို ဆက်သွယ်ပါ။',
    appRoleRequired: 'သိမ်းမီ လယ်သမား သို့မဟုတ် ဆိုင် ရွေးပါ။',
  },
  tl: {
    appRoleLabel: 'Uri ng account',
    appRoleFarmer: 'Magsasaka',
    appRoleStore: 'Tindahan',
    appRoleHintFirst:
      'Pumili ng isang beses. Pagkatapos i-save, hindi na mababago sa app; makipag-ugnayan sa suporta kung kailangan.',
    appRoleLockedHint:
      'Nakatakda na ang uri ng account at hindi mababago sa app. Makipag-ugnayan sa suporta para baguhin.',
    appRoleRequired: 'Pumili ng Magsasaka o Tindahan bago i-save.',
  },
  tr: {
    appRoleLabel: 'Hesap türü',
    appRoleFarmer: 'Çiftçi',
    appRoleStore: 'Mağaza',
    appRoleHintFirst:
      'Bir kez seçin. Kaydettikten sonra uygulamada değiştiremezsiniz; gerekirse destekle iletişime geçin.',
    appRoleLockedHint:
      'Hesap türü belirlendi ve uygulamada değiştirilemez. Değişiklik için destekle iletişime geçin.',
    appRoleRequired: 'Kaydetmeden önce Çiftçi veya Mağaza seçin.',
  },
  fa: {
    appRoleLabel: 'نوع حساب',
    appRoleFarmer: 'کشاورز',
    appRoleStore: 'فروشگاه',
    appRoleHintFirst:
      'فقط یک بار انتخاب کنید. پس از ذخیره در برنامه قابل تغییر نیست؛ در صورت نیاز با پشتیبانی تماس بگیرید.',
    appRoleLockedHint:
      'نوع حساب مشخص شده و در برنامه قابل تغییر نیست. برای تغییر با پشتیبانی تماس بگیرید.',
    appRoleRequired: 'قبل از ذخیره، کشاورز یا فروشگاه را انتخاب کنید.',
  },
};

function jsonStr(s) {
  return JSON.stringify(s).slice(1, -1);
}

function blockForMinified(keys) {
  return Object.entries(keys)
    .map(([k, v]) => `"${k}":"${jsonStr(v)}"`)
    .join(',');
}

function blockForFormatted(keys, indent) {
  return Object.entries(keys)
    .map(([k, v]) => {
      const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `${indent}${k}: '${escaped}',`;
    })
    .join('\n');
}

for (const [code, keys] of Object.entries(APP_ROLE)) {
  const fp = path.join(LANG_DIR, `${code}.ts`);
  let text = fs.readFileSync(fp, 'utf8');
  if (text.includes('appRoleLabel')) {
    console.log('skip (already has appRole)', code);
    continue;
  }

  if (text.includes('const t: Translations = {"common"')) {
    const needle = '"completeProfileFirst":"';
    const idx = text.indexOf(needle);
    if (idx === -1) throw new Error(`no completeProfileFirst in ${code}`);
    const valStart = idx + needle.length;
    const valEnd = text.indexOf('"', valStart);
    const after = valEnd + 2;
    const insert = `,${blockForMinified(keys)}`;
    text = text.slice(0, after) + insert + text.slice(after);
  } else {
    const re =
      /(completeProfileFirst:\s*\n?\s*'[^']*',?\s*\n)(\s*pickupAddressLabel:)/;
    const m = text.match(re);
    if (!m) {
      const re2 =
        /(completeProfileFirst: '[^']*',\n)(\s*pickupAddressLabel:)/;
      const m2 = text.match(re2);
      if (!m2) throw new Error(`no formatted completeProfileFirst in ${code}`);
      const indent = '      ';
      text = text.replace(
        m2[0],
        `${m2[1]}${blockForFormatted(keys, indent)}\n${m2[2]}`,
      );
    } else {
      const indent = m[2].match(/^(\s*)/)?.[1] || '      ';
      text = text.replace(
        re,
        `$1${blockForFormatted(keys, indent)}\n$2`,
      );
    }
  }

  fs.writeFileSync(fp, text);
  console.log('patched', code);
}

console.log('done');
