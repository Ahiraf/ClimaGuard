// Localized chrome for the "My children" (profile) page. Kept separate from
// uiStrings.ts so that big file stays focused on the emergency path; shared
// concepts (country, language, age, page title) are reused from uiStrings.
// Same 23-language coverage as the rest of the UI, English fallback otherwise.

export type ProfileStrings = {
  backHome: string;
  intro: string;
  syncing: string;
  addChild: string;
  noChildren: string;
  active: string;
  setActive: string;
  edit: string;
  remove: string;
  editTitle: string;
  nameLabel: string;
  healthLabel: string;
  optional: string;
  save: string;
  addBtn: string;
  cancel: string;
  underOne: string;
  years: string;
  checkDangerFor: string;
};

export const PROFILE_STRINGS: Record<string, ProfileStrings> = {
  en: {
    backHome: "Back", intro: "Set up each child once — age, place, and language. The active child personalizes every tool. Saved on your device and synced across devices.",
    syncing: "syncing…", addChild: "Add a child", noChildren: "No children added yet — the app still works. Add a child to make every tool personal.",
    active: "Active", setActive: "Set active", edit: "Edit", remove: "Remove", editTitle: "Edit child",
    nameLabel: "Child's name", healthLabel: "Health problems", optional: "optional", save: "Save", addBtn: "Add child",
    cancel: "Cancel", underOne: "Under 1 year", years: "years", checkDangerFor: "Check danger for",
  },
  bn: {
    backHome: "ফিরে যান", intro: "প্রতিটি শিশুকে একবার যোগ করুন — বয়স, জায়গা ও ভাষা। সক্রিয় শিশু অনুযায়ী সব কিছু দেখানো হয়। আপনার ফোনে জমা থাকে।",
    syncing: "সংরক্ষণ হচ্ছে…", addChild: "শিশু যোগ করুন", noChildren: "এখনো কোনো শিশু যোগ করা হয়নি — অ্যাপ এখনো কাজ করে। শিশু যোগ করলে সব কিছু আপনার শিশুর জন্য হবে।",
    active: "সক্রিয়", setActive: "সক্রিয় করুন", edit: "সম্পাদনা", remove: "মুছুন", editTitle: "শিশু সম্পাদনা",
    nameLabel: "শিশুর নাম", healthLabel: "স্বাস্থ্য সমস্যা", optional: "ঐচ্ছিক", save: "সংরক্ষণ", addBtn: "শিশু যোগ করুন",
    cancel: "বাতিল", underOne: "১ বছরের কম", years: "বছর", checkDangerFor: "বিপদ দেখুন",
  },
  hi: {
    backHome: "वापस", intro: "हर बच्चे को एक बार जोड़ें — उम्र, जगह और भाषा। सक्रिय बच्चे के अनुसार सब कुछ दिखता है। आपके फोन में सुरक्षित रहता है।",
    syncing: "सहेजा जा रहा है…", addChild: "बच्चा जोड़ें", noChildren: "अभी कोई बच्चा नहीं जोड़ा — ऐप फिर भी चलता है। बच्चा जोड़ें ताकि सब कुछ आपके बच्चे के लिए हो।",
    active: "सक्रिय", setActive: "सक्रिय करें", edit: "बदलें", remove: "हटाएँ", editTitle: "बच्चा बदलें",
    nameLabel: "बच्चे का नाम", healthLabel: "स्वास्थ्य समस्या", optional: "वैकल्पिक", save: "सहेजें", addBtn: "बच्चा जोड़ें",
    cancel: "रद्द करें", underOne: "1 साल से कम", years: "साल", checkDangerFor: "खतरा देखें",
  },
  ur: {
    backHome: "واپس", intro: "ہر بچے کو ایک بار شامل کریں — عمر، جگہ اور زبان۔ فعال بچے کے مطابق سب کچھ دکھایا جاتا ہے۔ آپ کے فون میں محفوظ رہتا ہے۔",
    syncing: "محفوظ ہو رہا ہے…", addChild: "بچہ شامل کریں", noChildren: "ابھی کوئی بچہ شامل نہیں — ایپ پھر بھی چلتی ہے۔ بچہ شامل کریں تاکہ سب کچھ آپ کے بچے کے لیے ہو۔",
    active: "فعال", setActive: "فعال کریں", edit: "ترمیم", remove: "ہٹائیں", editTitle: "بچہ ترمیم کریں",
    nameLabel: "بچے کا نام", healthLabel: "صحت کے مسائل", optional: "اختیاری", save: "محفوظ کریں", addBtn: "بچہ شامل کریں",
    cancel: "منسوخ", underOne: "1 سال سے کم", years: "سال", checkDangerFor: "خطرہ دیکھیں",
  },
  ar: {
    backHome: "رجوع", intro: "أضف كل طفل مرة واحدة — العمر والمكان واللغة. يُخصَّص كل شيء حسب الطفل النشط. يُحفظ على جهازك.",
    syncing: "جارٍ الحفظ…", addChild: "أضف طفلاً", noChildren: "لم تُضف أطفالاً بعد — التطبيق يعمل. أضف طفلاً ليصبح كل شيء مخصصًا لطفلك.",
    active: "نشط", setActive: "اجعله نشطًا", edit: "تعديل", remove: "حذف", editTitle: "تعديل الطفل",
    nameLabel: "اسم الطفل", healthLabel: "مشاكل صحية", optional: "اختياري", save: "حفظ", addBtn: "أضف طفلاً",
    cancel: "إلغاء", underOne: "أقل من سنة", years: "سنوات", checkDangerFor: "افحص الخطر لـ",
  },
  fr: {
    backHome: "Retour", intro: "Enregistrez chaque enfant une fois — âge, lieu et langue. L'enfant actif personnalise tout. Enregistré sur votre appareil.",
    syncing: "enregistrement…", addChild: "Ajouter un enfant", noChildren: "Aucun enfant ajouté — l'application fonctionne quand même. Ajoutez un enfant pour tout personnaliser.",
    active: "Actif", setActive: "Rendre actif", edit: "Modifier", remove: "Retirer", editTitle: "Modifier l'enfant",
    nameLabel: "Nom de l'enfant", healthLabel: "Problèmes de santé", optional: "facultatif", save: "Enregistrer", addBtn: "Ajouter l'enfant",
    cancel: "Annuler", underOne: "Moins d'1 an", years: "ans", checkDangerFor: "Vérifier le danger pour",
  },
  es: {
    backHome: "Volver", intro: "Registre cada niño una vez — edad, lugar e idioma. El niño activo personaliza todo. Se guarda en su dispositivo.",
    syncing: "guardando…", addChild: "Agregar un niño", noChildren: "Aún no hay niños — la app funciona igual. Agregue un niño para personalizar todo.",
    active: "Activo", setActive: "Hacer activo", edit: "Editar", remove: "Quitar", editTitle: "Editar niño",
    nameLabel: "Nombre del niño", healthLabel: "Problemas de salud", optional: "opcional", save: "Guardar", addBtn: "Agregar niño",
    cancel: "Cancelar", underOne: "Menos de 1 año", years: "años", checkDangerFor: "Ver peligro para",
  },
  pt: {
    backHome: "Voltar", intro: "Registe cada criança uma vez — idade, lugar e língua. A criança ativa personaliza tudo. Guardado no seu aparelho.",
    syncing: "a guardar…", addChild: "Adicionar criança", noChildren: "Ainda sem crianças — a app funciona à mesma. Adicione uma criança para personalizar tudo.",
    active: "Ativa", setActive: "Tornar ativa", edit: "Editar", remove: "Remover", editTitle: "Editar criança",
    nameLabel: "Nome da criança", healthLabel: "Problemas de saúde", optional: "opcional", save: "Guardar", addBtn: "Adicionar criança",
    cancel: "Cancelar", underOne: "Menos de 1 ano", years: "anos", checkDangerFor: "Ver perigo para",
  },
  sw: {
    backHome: "Rudi", intro: "Sajili kila mtoto mara moja — umri, mahali na lugha. Mtoto aliye hai hubinafsisha kila kitu. Huhifadhiwa kwenye simu yako.",
    syncing: "inahifadhi…", addChild: "Ongeza mtoto", noChildren: "Bado hakuna watoto — programu bado inafanya kazi. Ongeza mtoto ili kila kitu kiwe cha mtoto wako.",
    active: "Hai", setActive: "Fanya hai", edit: "Hariri", remove: "Ondoa", editTitle: "Hariri mtoto",
    nameLabel: "Jina la mtoto", healthLabel: "Matatizo ya afya", optional: "hiari", save: "Hifadhi", addBtn: "Ongeza mtoto",
    cancel: "Ghairi", underOne: "Chini ya mwaka 1", years: "miaka", checkDangerFor: "Angalia hatari kwa",
  },
  ha: {
    backHome: "Koma", intro: "Ƙara kowane yaro sau ɗaya — shekaru, wuri da harshe. Yaro mai aiki yana keɓance komai. Ana ajiye a wayarka.",
    syncing: "ana ajiyewa…", addChild: "Ƙara yaro", noChildren: "Ba a ƙara yara ba tukuna — manhaja tana aiki. Ƙara yaro don komai ya zama na yaronka.",
    active: "Mai aiki", setActive: "Sanya mai aiki", edit: "Gyara", remove: "Cire", editTitle: "Gyara yaro",
    nameLabel: "Sunan yaro", healthLabel: "Matsalolin lafiya", optional: "na zaɓi", save: "Ajiye", addBtn: "Ƙara yaro",
    cancel: "Soke", underOne: "Ƙasa da shekara 1", years: "shekaru", checkDangerFor: "Duba haɗari ga",
  },
  am: {
    backHome: "ተመለስ", intro: "እያንዳንዱን ልጅ አንዴ ያስገቡ — ዕድሜ፣ ቦታ እና ቋንቋ። ንቁ ልጅ ሁሉንም ያስተካክላል። በስልክዎ ላይ ይቀመጣል።",
    syncing: "እየተቀመጠ…", addChild: "ልጅ ጨምር", noChildren: "እስካሁን ልጅ አልተጨመረም — መተግበሪያው ይሰራል። ልጅ ጨምረው ሁሉንም ለልጅዎ ያድርጉ።",
    active: "ንቁ", setActive: "ንቁ አድርግ", edit: "አስተካክል", remove: "አስወግድ", editTitle: "ልጅ አስተካክል",
    nameLabel: "የልጅ ስም", healthLabel: "የጤና ችግሮች", optional: "አማራጭ", save: "አስቀምጥ", addBtn: "ልጅ ጨምር",
    cancel: "ሰርዝ", underOne: "ከ1 ዓመት በታች", years: "ዓመታት", checkDangerFor: "አደጋ ተመልከት ለ",
  },
  so: {
    backHome: "Dib u noqo", intro: "Diiwaan geli ilmo kasta hal mar — da', goob iyo luqad. Ilmaha firfircoon ayaa gaar u sameeya wax kasta. Waxaa lagu keydiyaa taleefankaaga.",
    syncing: "waa la keydinayaa…", addChild: "Ku dar ilmo", noChildren: "Weli ilmo lama darin — barnaamijku waa shaqeeyaa. Ku dar ilmo si wax kastaa u noqdo mid ilmahaaga u gaar ah.",
    active: "Firfircoon", setActive: "Ka dhig firfircoon", edit: "Wax ka beddel", remove: "Ka saar", editTitle: "Wax ka beddel ilmaha",
    nameLabel: "Magaca ilmaha", healthLabel: "Dhibaatooyin caafimaad", optional: "ikhtiyaari", save: "Keydi", addBtn: "Ku dar ilmo",
    cancel: "Jooji", underOne: "Ka yar 1 sano", years: "sano", checkDangerFor: "Hubi khatarta",
  },
  fil: {
    backHome: "Bumalik", intro: "I-set up ang bawat bata minsan — edad, lugar, at wika. Ang aktibong bata ang bumabagay sa lahat. Nakaimbak sa inyong telepono.",
    syncing: "sine-save…", addChild: "Magdagdag ng bata", noChildren: "Wala pang batang naidagdag — gumagana pa rin ang app. Magdagdag ng bata para maging personal ang lahat.",
    active: "Aktibo", setActive: "Gawing aktibo", edit: "I-edit", remove: "Alisin", editTitle: "I-edit ang bata",
    nameLabel: "Pangalan ng bata", healthLabel: "Mga problema sa kalusugan", optional: "opsyonal", save: "I-save", addBtn: "Idagdag ang bata",
    cancel: "Kanselahin", underOne: "Wala pang 1 taon", years: "taon", checkDangerFor: "Tingnan ang panganib para kay",
  },
  id: {
    backHome: "Kembali", intro: "Daftarkan setiap anak sekali — umur, tempat, dan bahasa. Anak aktif menyesuaikan semuanya. Disimpan di ponsel Anda.",
    syncing: "menyimpan…", addChild: "Tambah anak", noChildren: "Belum ada anak — aplikasi tetap berfungsi. Tambah anak agar semuanya sesuai anak Anda.",
    active: "Aktif", setActive: "Jadikan aktif", edit: "Ubah", remove: "Hapus", editTitle: "Ubah anak",
    nameLabel: "Nama anak", healthLabel: "Masalah kesehatan", optional: "opsional", save: "Simpan", addBtn: "Tambah anak",
    cancel: "Batal", underOne: "Di bawah 1 tahun", years: "tahun", checkDangerFor: "Lihat bahaya untuk",
  },
  fa: {
    backHome: "بازگشت", intro: "هر کودک را یک بار ثبت کنید — سن، مکان و زبان. کودک فعال همه چیز را شخصی می‌کند. روی دستگاه شما ذخیره می‌شود.",
    syncing: "در حال ذخیره…", addChild: "افزودن کودک", noChildren: "هنوز کودکی اضافه نشده — برنامه کار می‌کند. کودکی اضافه کنید تا همه چیز مخصوص کودک شما شود.",
    active: "فعال", setActive: "فعال کن", edit: "ویرایش", remove: "حذف", editTitle: "ویرایش کودک",
    nameLabel: "نام کودک", healthLabel: "مشکلات سلامتی", optional: "اختیاری", save: "ذخیره", addBtn: "افزودن کودک",
    cancel: "لغو", underOne: "کمتر از ۱ سال", years: "سال", checkDangerFor: "بررسی خطر برای",
  },
  prs: {
    backHome: "بازگشت", intro: "هر کودک را یک بار ثبت کنید — سن، محل و زبان. کودک فعال همه چیز را شخصی می‌سازد. روی دستگاه شما ذخیره می‌شود.",
    syncing: "در حال ذخیره…", addChild: "افزودن کودک", noChildren: "هنوز کودکی اضافه نشده — برنامه کار می‌کند. کودکی اضافه کنید تا همه چیز مخصوص کودک شما شود.",
    active: "فعال", setActive: "فعال کن", edit: "ویرایش", remove: "حذف", editTitle: "ویرایش کودک",
    nameLabel: "نام کودک", healthLabel: "مشکلات صحی", optional: "اختیاری", save: "ذخیره", addBtn: "افزودن کودک",
    cancel: "لغو", underOne: "کمتر از ۱ سال", years: "سال", checkDangerFor: "بررسی خطر برای",
  },
  ps: {
    backHome: "شاته", intro: "هر ماشوم یو ځل ثبت کړئ — عمر، ځای او ژبه. فعال ماشوم هر څه شخصي کوي. ستاسو په وسیله کې ساتل کیږي.",
    syncing: "ساتل کیږي…", addChild: "ماشوم زیات کړئ", noChildren: "تر اوسه هیڅ ماشوم نه دی زیات شوی — اپلیکیشن کار کوي. ماشوم زیات کړئ چې هر څه ستاسو د ماشوم لپاره شي.",
    active: "فعال", setActive: "فعال یې کړئ", edit: "سمول", remove: "لرې کول", editTitle: "ماشوم سمول",
    nameLabel: "د ماشوم نوم", healthLabel: "روغتیایي ستونزې", optional: "اختیاري", save: "ساتل", addBtn: "ماشوم زیات کړئ",
    cancel: "لغوه", underOne: "له ۱ کال کم", years: "کاله", checkDangerFor: "خطر وګورئ د",
  },
  my: {
    backHome: "ပြန်သွား", intro: "ကလေးတစ်ဦးစီကို တစ်ကြိမ်သတ်မှတ်ပါ — အသက်၊ နေရာနှင့် ဘာသာစကား။ အသုံးပြုနေသောကလေးအလိုက် အားလုံးကို ချိန်ညှိသည်။ သင့်ဖုန်းတွင် သိမ်းသည်။",
    syncing: "သိမ်းနေသည်…", addChild: "ကလေးထည့်ရန်", noChildren: "ကလေးမထည့်ရသေးပါ — အက်ပ်အလုပ်လုပ်နေဆဲ။ ကလေးထည့်ပါ၊ အားလုံးကို သင့်ကလေးအတွက်ဖြစ်စေရန်။",
    active: "အသုံးပြုနေ", setActive: "အသုံးပြုရန်သတ်မှတ်", edit: "ပြင်ရန်", remove: "ဖယ်ရန်", editTitle: "ကလေးပြင်ရန်",
    nameLabel: "ကလေးအမည်", healthLabel: "ကျန်းမာရေးပြဿနာ", optional: "ရွေးချယ်နိုင်", save: "သိမ်းရန်", addBtn: "ကလေးထည့်ရန်",
    cancel: "မလုပ်တော့", underOne: "၁ နှစ်အောက်", years: "နှစ်", checkDangerFor: "အန္တရာယ်ကြည့်ရန်",
  },
  km: {
    backHome: "ត្រឡប់", intro: "បញ្ចូលកូនម្នាក់ៗម្តង — អាយុ ទីកន្លែង និងភាសា។ កូនសកម្មធ្វើឱ្យអ្វីៗសមស្របតាមកូន។ រក្សាទុកក្នុងទូរស័ព្ទរបស់អ្នក។",
    syncing: "កំពុងរក្សាទុក…", addChild: "បន្ថែមកូន", noChildren: "មិនទាន់មានកូនទេ — កម្មវិធីនៅដំណើរការ។ បន្ថែមកូនដើម្បីឱ្យអ្វីៗសមស្របតាមកូនអ្នក។",
    active: "សកម្ម", setActive: "កំណត់ជាសកម្ម", edit: "កែ", remove: "លុប", editTitle: "កែកូន",
    nameLabel: "ឈ្មោះកូន", healthLabel: "បញ្ហាសុខភាព", optional: "ស្រេចចិត្ត", save: "រក្សាទុក", addBtn: "បន្ថែមកូន",
    cancel: "បោះបង់", underOne: "ក្រោម ១ ឆ្នាំ", years: "ឆ្នាំ", checkDangerFor: "ពិនិត្យគ្រោះថ្នាក់សម្រាប់",
  },
  lo: {
    backHome: "ກັບຄືນ", intro: "ລົງທະບຽນລູກແຕ່ລະຄົນເທື່ອດຽວ — ອາຍຸ, ສະຖານທີ່ ແລະ ພາສາ. ລູກທີ່ໃຊ້ຢູ່ຈະປັບທຸກຢ່າງ. ບັນທຶກໄວ້ໃນໂທລະສັບຂອງທ່ານ.",
    syncing: "ກຳລັງບັນທຶກ…", addChild: "ເພີ່ມລູກ", noChildren: "ຍັງບໍ່ມີລູກ — ແອັບຍັງໃຊ້ໄດ້. ເພີ່ມລູກເພື່ອໃຫ້ທຸກຢ່າງເໝາະກັບລູກຂອງທ່ານ.",
    active: "ໃຊ້ຢູ່", setActive: "ຕັ້ງໃຫ້ໃຊ້", edit: "ແກ້ໄຂ", remove: "ລຶບ", editTitle: "ແກ້ໄຂລູກ",
    nameLabel: "ຊື່ລູກ", healthLabel: "ບັນຫາສຸຂະພາບ", optional: "ບໍ່ບັງຄັບ", save: "ບັນທຶກ", addBtn: "ເພີ່ມລູກ",
    cancel: "ຍົກເລີກ", underOne: "ຕ່ຳກວ່າ 1 ປີ", years: "ປີ", checkDangerFor: "ກວດອັນຕະລາຍສຳລັບ",
  },
  ko: {
    backHome: "뒤로", intro: "아이마다 한 번 등록하세요 — 나이, 장소, 언어. 활성 아이에 맞춰 모든 기능이 맞춰집니다. 기기에 저장됩니다.",
    syncing: "저장 중…", addChild: "아이 추가", noChildren: "아직 등록된 아이가 없습니다 — 앱은 그대로 작동합니다. 아이를 추가하면 모든 것이 아이에게 맞춰집니다.",
    active: "활성", setActive: "활성으로 설정", edit: "수정", remove: "삭제", editTitle: "아이 수정",
    nameLabel: "아이 이름", healthLabel: "건강 문제", optional: "선택", save: "저장", addBtn: "아이 추가",
    cancel: "취소", underOne: "1세 미만", years: "세", checkDangerFor: "위험 확인",
  },
  tr: {
    backHome: "Geri", intro: "Her çocuğu bir kez ekleyin — yaş, yer ve dil. Etkin çocuğa göre her şey kişiselleşir. Cihazınıza kaydedilir.",
    syncing: "kaydediliyor…", addChild: "Çocuk ekle", noChildren: "Henüz çocuk eklenmedi — uygulama yine de çalışır. Her şeyi kişiselleştirmek için çocuk ekleyin.",
    active: "Etkin", setActive: "Etkin yap", edit: "Düzenle", remove: "Kaldır", editTitle: "Çocuğu düzenle",
    nameLabel: "Çocuğun adı", healthLabel: "Sağlık sorunları", optional: "isteğe bağlı", save: "Kaydet", addBtn: "Çocuk ekle",
    cancel: "İptal", underOne: "1 yaşından küçük", years: "yaş", checkDangerFor: "Tehlikeyi kontrol et",
  },
  ru: {
    backHome: "Назад", intro: "Добавьте каждого ребёнка один раз — возраст, место и язык. Активный ребёнок настраивает всё. Сохраняется на вашем устройстве.",
    syncing: "сохранение…", addChild: "Добавить ребёнка", noChildren: "Дети ещё не добавлены — приложение работает. Добавьте ребёнка, чтобы всё подстроилось под него.",
    active: "Активный", setActive: "Сделать активным", edit: "Изменить", remove: "Удалить", editTitle: "Изменить ребёнка",
    nameLabel: "Имя ребёнка", healthLabel: "Проблемы со здоровьем", optional: "необязательно", save: "Сохранить", addBtn: "Добавить ребёнка",
    cancel: "Отмена", underOne: "До 1 года", years: "лет", checkDangerFor: "Проверить опасность для",
  },
};

export const getProfileStrings = (code: string): ProfileStrings =>
  PROFILE_STRINGS[code] ?? PROFILE_STRINGS.en;
