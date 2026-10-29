#!/usr/bin/env node
/**
 * Unify farmer-facing AI strings (no settings/ONNX ops hints) across all lang/*.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LANG_DIR = path.join(__dirname, '../src/app/i18n/lang');

/** @type {Record<string, Record<string, string>>} */
const STR = {
  'zh-TW': {
    deepAnalysisMock: '演示模式下無法提供真實 AI 分析。',
    deepAnalysisNotConfigured: 'AI 服務暫不可用，請稍後再試。',
    aiDisabledBothDesc: 'AI 服務暫不可用，請稍後再試。',
    offlineNoNetwork: '目前無網路，請連接網路後再試。',
    offlineCloudOnlyNoLocal: '識圖分析需要連網，請連接網路後再試。',
    cloudAiNotLoggedInHint: '識圖服務未通過身份驗證。請退出後重新登入，或稍後再試。',
  },
  es: {
    deepAnalysisMock: 'El servicio de IA no está disponible en modo demo.',
    deepAnalysisNotConfigured: 'El servicio de IA no está disponible temporalmente. Inténtelo más tarde.',
    aiDisabledBothDesc: 'El servicio de IA no está disponible temporalmente. Inténtelo más tarde.',
    offlineNoNetwork: 'Sin conexión a internet. Conéctese a la red e inténtelo de nuevo.',
    offlineCloudOnlyNoLocal: 'El análisis por foto requiere internet. Conéctese e inténtelo de nuevo.',
    cloudAiNotLoggedInHint: 'No se pudo verificar su sesión. Cierre sesión, vuelva a entrar o inténtelo más tarde.',
  },
  fr: {
    deepAnalysisMock: 'Le service IA n\'est pas disponible en mode démo.',
    deepAnalysisNotConfigured: 'Le service IA est temporairement indisponible. Veuillez réessayer plus tard.',
    aiDisabledBothDesc: 'Le service IA est temporairement indisponible. Veuillez réessayer plus tard.',
    offlineNoNetwork: 'Pas de connexion internet. Connectez-vous au réseau et réessayez.',
    offlineCloudOnlyNoLocal: 'L\'analyse photo nécessite internet. Connectez-vous et réessayez.',
    cloudAiNotLoggedInHint: 'Session non vérifiée. Déconnectez-vous, reconnectez-vous ou réessayez plus tard.',
  },
  pt: {
    deepAnalysisMock: 'O serviço de IA não está disponível no modo demo.',
    deepAnalysisNotConfigured: 'O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.',
    aiDisabledBothDesc: 'O serviço de IA está temporariamente indisponível. Tente novamente mais tarde.',
    offlineNoNetwork: 'Sem ligação à internet. Ligue-se à rede e tente novamente.',
    offlineCloudOnlyNoLocal: 'A análise por foto precisa de internet. Ligue-se e tente novamente.',
    cloudAiNotLoggedInHint: 'Não foi possível verificar a sessão. Saia, entre novamente ou tente mais tarde.',
  },
  ar: {
    deepAnalysisMock: 'خدمة الذكاء الاصطناعي غير متاحة في وضع العرض.',
    deepAnalysisNotConfigured: 'خدمة الذكاء الاصطناعي غير متاحة مؤقتًا. يرجى المحاولة لاحقًا.',
    aiDisabledBothDesc: 'خدمة الذكاء الاصطناعي غير متاحة مؤقتًا. يرجى المحاولة لاحقًا.',
    offlineNoNetwork: 'لا يوجد اتصال بالإنترنت. اتصل بالشبكة وحاول مرة أخرى.',
    offlineCloudOnlyNoLocal: 'تحليل الصورة يتطلب الإنترنت. اتصل بالشبكة وحاول مرة أخرى.',
    cloudAiNotLoggedInHint: 'تعذّر التحقق من الجلسة. سجّل الخروج ثم الدخول مرة أخرى أو حاول لاحقًا.',
  },
  hi: {
    deepAnalysisMock: 'डेमो मोड में AI सेवा उपलब्ध नहीं है।',
    deepAnalysisNotConfigured: 'AI सेवा अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
    aiDisabledBothDesc: 'AI सेवा अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।',
    offlineNoNetwork: 'इंटरनेट कनेक्शन नहीं है। नेटवर्क से जुड़ें और पुनः प्रयास करें।',
    offlineCloudOnlyNoLocal: 'फोटो विश्लेषण के लिए इंटरनेट जरूरी है। कनेक्ट करें और पुनः प्रयास करें।',
    cloudAiNotLoggedInHint: 'सत्र सत्यापित नहीं हुआ। लॉग आउट करके फिर लॉग इन करें या बाद में प्रयास करें।',
  },
  ru: {
    deepAnalysisMock: 'Сервис ИИ недоступен в демо-режиме.',
    deepAnalysisNotConfigured: 'Сервис ИИ временно недоступен. Попробуйте позже.',
    aiDisabledBothDesc: 'Сервис ИИ временно недоступен. Попробуйте позже.',
    offlineNoNetwork: 'Нет подключения к интернету. Подключитесь к сети и повторите попытку.',
    offlineCloudOnlyNoLocal: 'Анализ фото требует интернет. Подключитесь и повторите попытку.',
    cloudAiNotLoggedInHint: 'Не удалось проверить сессию. Выйдите и войдите снова или попробуйте позже.',
  },
  bn: {
    deepAnalysisMock: 'ডেমো মোডে AI সেবা উপলব্ধ নয়।',
    deepAnalysisNotConfigured: 'AI সেবা সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।',
    aiDisabledBothDesc: 'AI সেবা সাময়িকভাবে অনুপলব্ধ। পরে আবার চেষ্টা করুন।',
    offlineNoNetwork: 'ইন্টারনেট সংযোগ নেই। নেটওয়ার্কে সংযুক্ত হয়ে আবার চেষ্টা করুন।',
    offlineCloudOnlyNoLocal: 'ছবি বিশ্লেষণের জন্য ইন্টারনেট প্রয়োজন। সংযুক্ত হয়ে আবার চেষ্টা করুন।',
    cloudAiNotLoggedInHint: 'সেশন যাচাই হয়নি। লগ আউট করে আবার লগ ইন করুন বা পরে চেষ্টা করুন।',
  },
  ur: {
    deepAnalysisMock: 'ڈیمو موڈ میں AI سروس دستیاب نہیں۔',
    deepAnalysisNotConfigured: 'AI سروس عارضی طور پر دستیاب نہیں۔ بعد میں دوبارہ کوشش کریں۔',
    aiDisabledBothDesc: 'AI سروس عارضی طور پر دستیاب نہیں۔ بعد میں دوبارہ کوشش کریں۔',
    offlineNoNetwork: 'انٹرنیٹ کنکشن نہیں۔ نیٹ ورک سے جڑیں اور دوبارہ کوشش کریں۔',
    offlineCloudOnlyNoLocal: 'تصویر تجزیے کے لیے انٹرنیٹ درکار ہے۔ جڑیں اور دوبارہ کوشش کریں۔',
    cloudAiNotLoggedInHint: 'سیشن کی تصدیق نہیں ہوئی۔ سائن آؤٹ کر کے دوبارہ سائن ان کریں یا بعد میں کوشش کریں۔',
  },
  id: {
    deepAnalysisMock: 'Layanan AI tidak tersedia dalam mode demo.',
    deepAnalysisNotConfigured: 'Layanan AI sementara tidak tersedia. Coba lagi nanti.',
    aiDisabledBothDesc: 'Layanan AI sementara tidak tersedia. Coba lagi nanti.',
    offlineNoNetwork: 'Tidak ada koneksi internet. Sambungkan ke jaringan dan coba lagi.',
    offlineCloudOnlyNoLocal: 'Analisis foto memerlukan internet. Sambungkan dan coba lagi.',
    cloudAiNotLoggedInHint: 'Sesi tidak terverifikasi. Keluar, masuk lagi, atau coba nanti.',
  },
  vi: {
    deepAnalysisMock: 'Dịch vụ AI không khả dụng ở chế độ demo.',
    deepAnalysisNotConfigured: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
    aiDisabledBothDesc: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
    offlineNoNetwork: 'Không có kết nối internet. Hãy kết nối mạng và thử lại.',
    offlineCloudOnlyNoLocal: 'Phân tích ảnh cần internet. Hãy kết nối và thử lại.',
    cloudAiNotLoggedInHint: 'Không xác minh được phiên. Đăng xuất, đăng nhập lại hoặc thử sau.',
  },
  ms: {
    deepAnalysisMock: 'Perkhidmatan AI tidak tersedia dalam mod demo.',
    deepAnalysisNotConfigured: 'Perkhidmatan AI tidak tersedia buat sementara. Sila cuba lagi nanti.',
    aiDisabledBothDesc: 'Perkhidmatan AI tidak tersedia buat sementara. Sila cuba lagi nanti.',
    offlineNoNetwork: 'Tiada sambungan internet. Sambung ke rangkaian dan cuba lagi.',
    offlineCloudOnlyNoLocal: 'Analisis foto memerlukan internet. Sambung dan cuba lagi.',
    cloudAiNotLoggedInHint: 'Sesi tidak disahkan. Log keluar, log masuk semula atau cuba nanti.',
  },
  ja: {
    deepAnalysisMock: 'デモモードではAIサービスを利用できません。',
    deepAnalysisNotConfigured: 'AIサービスは一時的に利用できません。しばらくしてから再度お試しください。',
    aiDisabledBothDesc: 'AIサービスは一時的に利用できません。しばらくしてから再度お試しください。',
    offlineNoNetwork: 'インターネットに接続されていません。ネットワークに接続してから再度お試しください。',
    offlineCloudOnlyNoLocal: '写真分析にはインターネット接続が必要です。接続してから再度お試しください。',
    cloudAiNotLoggedInHint: 'セッションを確認できませんでした。ログアウトして再ログインするか、後でもう一度お試しください。',
  },
  th: {
    deepAnalysisMock: 'บริการ AI ไม่พร้อมใช้งานในโหมดสาธิต',
    deepAnalysisNotConfigured: 'บริการ AI ไม่พร้อมใช้งานชั่วคราว โปรดลองใหม่ภายหลัง',
    aiDisabledBothDesc: 'บริการ AI ไม่พร้อมใช้งานชั่วคราว โปรดลองใหม่ภายหลัง',
    offlineNoNetwork: 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต เชื่อมต่อเครือข่ายแล้วลองอีกครั้ง',
    offlineCloudOnlyNoLocal: 'การวิเคราะห์รูปต้องใช้อินเทอร์เน็ต เชื่อมต่อแล้วลองอีกครั้ง',
    cloudAiNotLoggedInHint: 'ยืนยันเซสชันไม่ได้ ออกจากระบบแล้วเข้าใหม่ หรือลองภายหลัง',
  },
  my: {
    deepAnalysisMock: 'Demo မုဒ်တွင် AI ဝန်ဆောင်မှု မရနိုင်ပါ။',
    deepAnalysisNotConfigured: 'AI ဝန်ဆောင်မှု ယာယီ မရနိုင်ပါ။ နောက်မှ ထပ်ကြိုးစားပါ။',
    aiDisabledBothDesc: 'AI ဝန်ဆောင်မှု ယာယီ မရနိုင်ပါ။ နောက်မှ ထပ်ကြိုးစားပါ။',
    offlineNoNetwork: 'အင်တာနက် မချိတ်ဆက်ရသေးပါ။ ကွန်ရက်ချိတ်ပြီး ထပ်ကြိုးစားပါ။',
    offlineCloudOnlyNoLocal: 'ဓာတ်ပုံခွဲခြမ်းစိတ်ဖြာရန် အင်တာနက် လိုအပ်သည်။ ချိတ်ဆက်ပြီး ထပ်ကြိုးစားပါ။',
    cloudAiNotLoggedInHint: 'session အတည်ပြု မရပါ။ ထွက်ပြီး ပြန်ဝင်ပါ သို့မဟုတ် နောက်မှ ကြိုးစားပါ။',
  },
  tl: {
    deepAnalysisMock: 'Hindi available ang AI service sa demo mode.',
    deepAnalysisNotConfigured: 'Pansamantalang hindi available ang AI service. Subukan muli mamaya.',
    aiDisabledBothDesc: 'Pansamantalang hindi available ang AI service. Subukan muli mamaya.',
    offlineNoNetwork: 'Walang internet. Kumonekta sa network at subukan muli.',
    offlineCloudOnlyNoLocal: 'Kailangan ng internet ang photo analysis. Kumonekta at subukan muli.',
    cloudAiNotLoggedInHint: 'Hindi ma-verify ang session. Mag-sign out, sign in muli, o subukan mamaya.',
  },
  tr: {
    deepAnalysisMock: 'Demo modunda AI hizmeti kullanılamaz.',
    deepAnalysisNotConfigured: 'AI hizmeti geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    aiDisabledBothDesc: 'AI hizmeti geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
    offlineNoNetwork: 'İnternet bağlantısı yok. Ağa bağlanıp tekrar deneyin.',
    offlineCloudOnlyNoLocal: 'Fotoğraf analizi için internet gerekir. Bağlanıp tekrar deneyin.',
    cloudAiNotLoggedInHint: 'Oturum doğrulanamadı. Çıkış yapıp tekrar giriş yapın veya sonra deneyin.',
  },
  fa: {
    deepAnalysisMock: 'سرویس هوش مصنوعی در حالت نمایشی در دسترس نیست.',
    deepAnalysisNotConfigured: 'سرویس هوش مصنوعی موقتاً در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.',
    aiDisabledBothDesc: 'سرویس هوش مصنوعی موقتاً در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.',
    offlineNoNetwork: 'اتصال اینترنت برقرار نیست. به شبکه وصل شوید و دوباره تلاش کنید.',
    offlineCloudOnlyNoLocal: 'تحلیل عکس به اینترنت نیاز دارد. وصل شوید و دوباره تلاش کنید.',
    cloudAiNotLoggedInHint: 'نشست تأیید نشد. خارج شوید و دوباره وارد شوید یا بعداً تلاش کنید.',
  },
};

// en + zh reference (ensure script can refresh if needed)
STR.en = {
  deepAnalysisMock: 'AI service is not available in demo mode.',
  deepAnalysisNotConfigured: 'AI service is temporarily unavailable. Please try again later.',
  aiDisabledBothTitle: 'AI is turned off',
  aiDisabledBothDesc: 'AI is temporarily unavailable. Please try again later.',
  offlineNoAiTitle: 'AI is unavailable',
  offlineNoNetwork: 'No internet connection. Connect to the network and try again.',
  offlineCloudOnlyNoLocal: 'Connect to the internet to use AI analysis.',
  cloudAiDisabled: 'Online cloud AI is disabled; this action is not available.',
  cloudAiNotLoggedInHint:
    'Could not verify your session. Sign out, sign in again, or try again later.',
};
STR.zh = {
  deepAnalysisMock: '演示模式下无法提供真实 AI 分析。',
  deepAnalysisNotConfigured: 'AI 服务暂不可用，请稍后再试。',
  aiDisabledBothDesc: 'AI 服务暂不可用，请稍后再试。',
  offlineNoNetwork: '当前无网络，请连接网络后再试。',
  offlineCloudOnlyNoLocal: '识图分析需要联网，请连接网络后再试。',
  cloudAiNotLoggedInHint:
    '识图服务未通过身份校验。请退出后重新登录，或稍后再试。',
};

/** Banner titles for offline / disabled states */
const TITLES = {
  ar: {
    aiDisabledBothTitle: 'الذكاء الاصطناعي متوقف',
    offlineNoAiTitle: 'الذكاء الاصطناعي غير متاح',
    cloudAiDisabled: 'الذكاء الاصطناعي السحابي غير مفعّل؛ هذا الإجراء غير متاح.',
  },
  hi: {
    aiDisabledBothTitle: 'AI बंद है',
    offlineNoAiTitle: 'AI उपलब्ध नहीं',
    cloudAiDisabled: 'ऑनलाइन क्लाउड AI बंद है; यह क्रिया उपलब्ध नहीं है।',
  },
  ru: {
    aiDisabledBothTitle: 'ИИ отключён',
    offlineNoAiTitle: 'ИИ недоступен',
    cloudAiDisabled: 'Облачный ИИ отключён; это действие недоступно.',
  },
  bn: {
    aiDisabledBothTitle: 'AI বন্ধ',
    offlineNoAiTitle: 'AI উপলব্ধ নয়',
    cloudAiDisabled: 'অনলাইন ক্লাউড AI বন্ধ; এই কাজটি উপলব্ধ নয়।',
  },
  ur: {
    aiDisabledBothTitle: 'AI بند ہے',
    offlineNoAiTitle: 'AI دستیاب نہیں',
    cloudAiDisabled: 'آن لائن کلاؤڈ AI بند ہے؛ یہ عمل دستیاب نہیں۔',
  },
  id: {
    aiDisabledBothTitle: 'AI dimatikan',
    offlineNoAiTitle: 'AI tidak tersedia',
    cloudAiDisabled: 'AI cloud online dimatikan; tindakan ini tidak tersedia.',
  },
  vi: {
    aiDisabledBothTitle: 'AI đã tắt',
    offlineNoAiTitle: 'AI không khả dụng',
    cloudAiDisabled: 'AI cloud trực tuyến đã tắt; thao tác này không khả dụng.',
  },
  ms: {
    aiDisabledBothTitle: 'AI dimatikan',
    offlineNoAiTitle: 'AI tidak tersedia',
    cloudAiDisabled: 'AI awan dalam talian dimatikan; tindakan ini tidak tersedia.',
  },
  ja: {
    aiDisabledBothTitle: 'AIはオフです',
    offlineNoAiTitle: 'AIを利用できません',
    cloudAiDisabled: 'オンラインクラウドAIは無効です。この操作は利用できません。',
  },
  th: {
    aiDisabledBothTitle: 'ปิด AI แล้ว',
    offlineNoAiTitle: 'ใช้ AI ไม่ได้',
    cloudAiDisabled: 'ปิด AI บนคลาวด์ออนไลน์แล้ว การดำเนินการนี้ใช้ไม่ได้',
  },
  my: {
    aiDisabledBothTitle: 'AI ပိတ်ထားသည်',
    offlineNoAiTitle: 'AI မရနိုင်ပါ',
    cloudAiDisabled: 'အွန်လိုင်း cloud AI ပိတ်ထားသည် — ဤလုပ်ဆောင်ချက် မရနိုင်ပါ။',
  },
  tr: {
    aiDisabledBothTitle: 'AI kapalı',
    offlineNoAiTitle: 'AI kullanılamıyor',
    cloudAiDisabled: 'Çevrimiçi bulut AI kapalı; bu işlem kullanılamaz.',
  },
  fa: {
    aiDisabledBothTitle: 'هوش مصنوعی خاموش است',
    offlineNoAiTitle: 'هوش مصنوعی در دسترس نیست',
    cloudAiDisabled: 'هوش مصنوعی ابری آنلاین غیرفعال است؛ این عمل در دسترس نیست.',
  },
  es: {
    aiDisabledBothTitle: 'IA desactivada',
    offlineNoAiTitle: 'IA no disponible',
    cloudAiDisabled: 'La IA en la nube está desactivada; esta acción no está disponible.',
  },
  fr: {
    aiDisabledBothTitle: 'IA désactivée',
    offlineNoAiTitle: 'IA indisponible',
    cloudAiDisabled: "L'IA cloud en ligne est désactivée ; cette action n'est pas disponible.",
  },
  pt: {
    aiDisabledBothTitle: 'IA indisponível',
    offlineNoAiTitle: 'IA indisponível',
    cloudAiDisabled: 'A IA na nuvem está desativada; esta ação não está disponível.',
  },
  tl: {
    aiDisabledBothTitle: 'Naka-off ang AI',
    offlineNoAiTitle: 'Hindi available ang AI',
    cloudAiDisabled: 'Naka-disable ang online cloud AI; hindi available ang aksyong ito.',
  },
};

const INSERT_ORDER = [
  'aiDisabledBothTitle',
  'aiDisabledBothDesc',
  'offlineNoAiTitle',
  'offlineNoNetwork',
  'offlineCloudOnlyNoLocal',
  'cloudAiDisabled',
  'cloudAiNotLoggedInHint',
];

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escSq(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function hasKey(text, key) {
  return (
    text.includes(`"${key}"`) ||
    text.includes(`'${key}'`) ||
    new RegExp(`\\b${key}\\s*:`).test(text)
  );
}

function setKey(text, key, value) {
  const reDq = new RegExp(`"${key}":"(?:[^"\\\\]|\\\\.)*"`, 'g');
  if (reDq.test(text)) {
    return text.replace(reDq, `"${key}":"${esc(value)}"`);
  }
  const reSq = new RegExp(`\\b${key}:\\s*'(?:[^'\\\\]|\\\\.)*'`, 'g');
  if (reSq.test(text)) {
    return text.replace(reSq, `${key}: '${escSq(value)}'`);
  }
  return text;
}

function insertMissingAfterAiLogin(text, keys) {
  const missing = INSERT_ORDER.filter((k) => keys[k] && !hasKey(text, k));
  if (missing.length === 0) return text;

  const minified = missing.map((k) => `"${k}":"${esc(keys[k])}"`).join(',');
  const reMin = /"aiLoginRequired":"(?:[^"\\]|\\.)*"/;
  if (reMin.test(text)) {
    return text.replace(reMin, (m) => `${m},${minified}`);
  }

  const formatted = missing.map((k) => `      ${k}: '${escSq(keys[k])}',`).join('\n');
  const reFmt = /(aiLoginRequired:\s*'(?:[^'\\]|\\.)*',)(\r?\n)/;
  if (reFmt.test(text)) {
    return text.replace(reFmt, `$1\n${formatted}$2`);
  }
  return text;
}

for (const [code, keys] of Object.entries(STR)) {
  const fp = path.join(LANG_DIR, `${code}.ts`);
  if (!fs.existsSync(fp)) {
    console.warn('skip missing', code);
    continue;
  }
  const merged = { ...STR.en, ...TITLES[code], ...keys };
  let text = fs.readFileSync(fp, 'utf8');
  const before = text;
  for (const [k, v] of Object.entries(keys)) {
    text = setKey(text, k, v);
  }
  text = insertMissingAfterAiLogin(text, merged);
  if (text !== before) {
    fs.writeFileSync(fp, text);
    console.log('patched', code);
  } else {
    console.log('unchanged', code);
  }
}

console.log('done');
