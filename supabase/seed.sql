-- Seed data for Bella Güzellik Salonu (Business ID: c0a80101-0000-0000-0000-000000000001)

-- 1. Create Business
insert into public.businesses (id, name, slug, sector, phone, whatsapp_number, instagram_handle, website, address, location_url, brand_tone, primary_color)
values (
    'c0a80101-0000-0000-0000-000000000001',
    'Bella Güzellik Salonu',
    'bella-guzellik-salonu',
    'Güzellik salonu',
    '+902161234567',
    '+905321234567',
    'bellaguzellik',
    'https://bellaguzellik.com',
    'Caferağa Mah. Moda Cad. No:12 D:3 Kadıköy / İstanbul',
    'https://maps.google.com/?q=Moda+Kadikoy+Istanbul',
    'Professional',
    '#ec4899' -- Rose/Pink theme for beauty salon
) on conflict (id) do nothing;

-- 2. Services & Prices
-- Cilt bakımı
insert into public.services (id, business_id, name, description, category, duration_minutes, is_bookable, is_active)
values (
    'c0a80101-0000-0000-0000-000000000011',
    'c0a80101-0000-0000-0000-000000000001',
    'Cilt Bakımı',
    'Derin gözenek temizliği, peeling, tonik, nemlendirici maske ve masaj içeren komple cilt yenileme seansı.',
    'Cilt Bakımı',
    60,
    true,
    true
) on conflict (id) do nothing;

insert into public.service_prices (business_id, service_id, price, currency, display_price)
values (
    'c0a80101-0000-0000-0000-000000000001',
    'c0a80101-0000-0000-0000-000000000011',
    1200.00,
    'TRY',
    true
);

-- Kaş tasarımı
insert into public.services (id, business_id, name, description, category, duration_minutes, is_bookable, is_active)
values (
    'c0a80101-0000-0000-0000-000000000012',
    'c0a80101-0000-0000-0000-000000000001',
    'Kaş Tasarımı',
    'Yüz hatlarınıza en uygun kaş şekillendirme ve alım işlemi.',
    'Kaş & Kirpik',
    30,
    true,
    true
) on conflict (id) do nothing;

insert into public.service_prices (business_id, service_id, price, currency, display_price)
values (
    'c0a80101-0000-0000-0000-000000000001',
    'c0a80101-0000-0000-0000-000000000012',
    500.00,
    'TRY',
    true
);

-- Manikür
insert into public.services (id, business_id, name, description, category, duration_minutes, is_bookable, is_active)
values (
    'c0a80101-0000-0000-0000-000000000013',
    'c0a80101-0000-0000-0000-000000000001',
    'Manikür',
    'Tırnak şekillendirme, el banyosu, tırnak eti temizliği, el masajı ve oje uygulaması.',
    'El & Ayak Bakımı',
    30,
    true,
    true
) on conflict (id) do nothing;

insert into public.service_prices (business_id, service_id, price, currency, display_price)
values (
    'c0a80101-0000-0000-0000-000000000001',
    'c0a80101-0000-0000-0000-000000000013',
    450.00,
    'TRY',
    true
);

-- Pedikür
insert into public.services (id, business_id, name, description, category, duration_minutes, is_bookable, is_active)
values (
    'c0a80101-0000-0000-0000-000000000014',
    'c0a80101-0000-0000-0000-000000000001',
    'Pedikür',
    'Tırnak kesimi ve şekillendirmesi, ayak banyosu, topuk bakımı, tırnak eti temizliği, masaj ve oje uygulaması.',
    'El & Ayak Bakımı',
    45,
    true,
    true
) on conflict (id) do nothing;

insert into public.service_prices (business_id, service_id, price, currency, display_price)
values (
    'c0a80101-0000-0000-0000-000000000001',
    'c0a80101-0000-0000-0000-000000000014',
    550.00,
    'TRY',
    true
);

-- Lazer epilasyon
insert type_exists as (
    select 1 from pg_type where typname = 'services'
);
insert into public.services (id, business_id, name, description, category, duration_minutes, is_bookable, is_active)
values (
    'c0a80101-0000-0000-0000-000000000015',
    'c0a80101-0000-0000-0000-000000000001',
    'Lazer Epilasyon',
    'Buz başlıklı acısız kalıcı kıl kökü tahribat uygulaması. Fiyatlar seans ve uygulama yapılacak bölgeye göre değişmektedir.',
    'Epilasyon',
    90,
    true,
    true
) on conflict (id) do nothing;

insert into public.service_prices (business_id, service_id, price_min, price_max, currency, display_price, note)
values (
    'c0a80101-0000-0000-0000-000000000001',
    'c0a80101-0000-0000-0000-000000000015',
    1000.00,
    5000.00,
    'TRY',
    true,
    'Fiyat seans ve bölgeye göre değişiklik göstermektedir. Detaylı bilgi için ön görüşme önerilir.'
);

-- 3. Knowledge Base Q&A
insert into public.knowledge_base_items (business_id, title, content, category, tags, priority)
values 
(
    'c0a80101-0000-0000-0000-000000000001',
    'Konum ve Ulaşım',
    'Bella Güzellik Salonu, İstanbul Kadıköy Moda''da hizmet vermektedir. Açık adresimiz: Caferağa Mah. Moda Cad. No:12 D:3 Kadıköy / İstanbul. Kadıköy Boğa heykelinden Moda yönüne yürürken sol kolda kalmaktadır. Yol tarifi ve harita linkimiz: https://maps.google.com/?q=Moda+Kadikoy+Istanbul',
    'Konum',
    array['konum', 'adres', 'nerede', 'yol tarifi'],
    10
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Randevu Politikası',
    'Müşterilerimize daha iyi hizmet sunabilmek için randevu ile çalışıyoruz. Randevusuz gelen müşterilerimize müsaitliğe göre yardımcı olmaya çalışıyoruz, ancak gecikme ve beklemeleri önlemek için önceden randevu oluşturmanızı tavsiye ederiz. Randevu günü en az 15 dakika önce salonda olmanız önerilir.',
    'Randevu',
    array['randevu', 'randevusuz', 'politika', 'rezervasyon'],
    8
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Çalışma Saatleri',
    'Bella Güzellik Salonu olarak haftanın her günü kesintisiz hizmet vermekteyiz. Çalışma saatlerimiz sabah 10:00 ile akşam 20:00 arasındadır. Resmi tatillerde çalışma durumumuz için lütfen önceden iletişime geçiniz.',
    'Çalışma Saati',
    array['saat', 'çalışma saatleri', 'açılış', 'kapanış', 'pazar'],
    9
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Lazer Epilasyon Seans Bilgisi',
    'Lazer epilasyon uygulamalarımız buz başlıklı acısız cihazlar ile uzmanlarımız tarafından gerçekleştirilmektedir. Seans sayıları kişinin kıl yapısı, cilt tipi ve hormonal durumuna göre 6 ila 8 seans arasında değişiklik gösterebilir. En doğru seans planlaması ve fiyatlandırma için ücretsiz ön muayene / cilt analizi görüşmesi yapmanızı öneririz.',
    'Hizmet',
    array['lazer', 'epilasyon', 'seans', 'kaç seans', 'buz lazer'],
    7
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Kampanyalar',
    'Şu anda aktif olan kampanyamız: "Cilt Bakımı ve Manikür alan müşterilerimize Kaş Tasarımı %50 İndirimli!". Ayrıca ilk kez gelen müşterilerimize özel tüm işlemlerde geçerli %10 hoş geldin indirimi uygulamaktayız. Kampanyalarımız diğer indirimlerle birleştirilemez.',
    'Kampanya',
    array['kampanya', 'indirim', 'fırsat', 'ucuz'],
    6
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Tıbbi Sorumluluk ve Sağlık Kısıtlamaları',
    'Yasal kurallar gereği salonumuzda tıbbi teşhis ve cerrahi tedavi uygulamaları yapılmamaktadır. Yapılan işlemler tamamen kozmetik ve güzellik amaçlıdır. Cilt hastalığı, aktif enfeksiyonu olanlar, hamileliğin ilk 3 ayında olanlar veya kanser tedavisi görenler için bazı işlemlerin yapılması sakıncalı olabilir. İşlemler öncesinde varsa sağlık durumunuzla ilgili uzmanlarımızı bilgilendirmeniz rica olunur.',
    'Hassas Konu',
    array['sağlık', 'tıbbi', 'hamilelik', 'tedavi', 'alerji'],
    10
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'İptal ve Değişiklik Kuralları',
    'Randevularınızı iptal etmek ya da tarih/saat değişikliği yapmak istemeniz durumunda, diğer müşterilerimizin mağdur olmaması adına randevu saatinizden en az 4 saat önce bize bildirmenizi rica ederiz. 3 kez üst üste haber vermeksizin randevusuna gelmeyen müşterilerimizin sonraki taleplerinde ön ödeme istenebilir.',
    'Randevu',
    array['iptal', 'değişiklik', 'erteleme', 'randevu iptal'],
    5
);

-- 4. Rules & Safety Constraints
insert into public.knowledge_base_items (business_id, title, content, category, priority, is_active)
values
(
    'c0a80101-0000-0000-0000-000000000001',
    'Kural: Tıbbi Teşhis Yasaktır',
    'Müşterilerin cilt hastalıkları, kıl dönmeleri, lekeler veya diğer vücut problemleriyle ilgili sorduğu sorulara tıbbi teşhis koyarak cevap vermek kesinlikle yasaktır. "Şu krem geçer", "bu hastalık" gibi tıbbi yargılarda bulunulamaz. Cevaplarda her zaman "Cildinizi uzmanımızın yakından görmesi gerekir, dilerseniz bir ön analiz randevusu oluşturalım" denilerek randevuya yönlendirilmelidir.',
    'Yasalar ve Güvenlik',
    100,
    true
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Kural: Kesin Sonuç Garantisi Yasaktır',
    'Lazer epilasyon, leke tedavisi veya cilt bakımı gibi kişiden kişiye sonuçları farklılık gösteren işlemler için asla "%100 biter", "kesin çözüm", "kıllarınız tamamen yok olur" gibi garantiler verilemez. Her bireyin hormonal ve biyolojik yapısının farklı olduğu nazikçe açıklanarak, "yüksek oranda memnuniyet aldığımız ve kılları belirgin şekilde azaltan bir yöntemdir" şeklinde açıklama yapılmalıdır.',
    'Yasalar ve Güvenlik',
    100,
    true
),
(
    'c0a80101-0000-0000-0000-000000000001',
    'Kural: Bilinmeyen Fiyatları Uydurmak Yasaktır',
    'Eğer müşteri listede bulunmayan bir hizmetin fiyatını sorarsa (örneğin saç kesimi, protez tırnak, mikroblading vb.), kesinlikle bir fiyat uydurulmamalıdır. "Listemizde belirtilen hizmetler dışında bir işlem sormaktasınız. Sizin için güncel fiyat bilgisi ve detayları öğrenmek üzere sizi insan temsilcimize yönlendiriyorum" diyerek el-devri (handoff) tetiklenmelidir.',
    'Yasalar ve Güvenlik',
    100,
    true
);

-- 5. Default tags
insert into public.tags (id, business_id, name, color)
values 
('c0a80101-0000-0000-0000-000000000201', 'c0a80101-0000-0000-0000-000000000001', 'Yeni Mesaj', '#3b82f6'),
('c0a80101-0000-0000-0000-000000000202', 'c0a80101-0000-0000-0000-000000000001', 'Fiyat Sordu', '#f59e0b'),
('c0a80101-0000-0000-0000-000000000203', 'c0a80101-0000-0000-0000-000000000001', 'Randevu İstiyor', '#10b981'),
('c0a80101-0000-0000-0000-000000000204', 'c0a80101-0000-0000-0000-000000000001', 'Şikayet / Destek', '#ef4444'),
('c0a80101-0000-0000-0000-000000000205', 'c0a80101-0000-0000-0000-000000000001', 'VIP Müşteri', '#8b5cf6')
on conflict (id) do nothing;
