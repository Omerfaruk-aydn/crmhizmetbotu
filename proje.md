Sen çok deneyimli bir senior full-stack yazılım mühendisi, SaaS ürün mimarı, AI engineer, UX/UI designer, database architect, security engineer ve B2B ürün geliştiricisisin.

Benim için production-ready seviyeye yakın, profesyonel, kaliteli, ölçeklenebilir bir “AI Müşteri Temsilcisi Platformu” geliştirmeni istiyorum.

Bu proje basit bir chatbot olmayacak. Gerçek işletmelere satılabilecek, çok müşterili, paneli olan, AI destekli, CRM mantığı olan, randevu/talep toplayan, konuşma geçmişi tutan, işletme bilgi bankasına göre cevap veren profesyonel bir B2B SaaS platformu olacak.

Ürünün adı şimdilik:

“Assistora AI”

Alt slogan:

“İşletmeniz için 7/24 çalışan AI müşteri temsilcisi.”

==================================================
1. PROJENİN AMACI
==================================================

Bu platform; güzellik salonu, klinik, emlakçı, kurs merkezi, restoran, spor salonu, oto servis, butik mağaza ve benzeri işletmeler için geliştirilecek.

Platformun amacı:

- İşletmeye WhatsApp, Instagram DM ve web sitesi üzerinden gelen müşteri mesajlarını 7/24 karşılamak.
- Müşteri mesajlarını yapay zekâ ile anlamak.
- İşletmenin bilgi bankasına göre doğru, kısa, nazik ve profesyonel cevap vermek.
- Fiyat, hizmet, konum, çalışma saati, kampanya, randevu ve talep sorularını yönetmek.
- Müşteriden gerekli bilgileri toplamak.
- Randevu/talep kaydı oluşturmak.
- Müşteriyi CRM’e kaydetmek.
- Müşteriye lead puanı vermek.
- Ciddi müşterileri işletmeye bildirmek.
- Riskli veya belirsiz konularda insan temsilciye aktarmak.
- İşletmeye rapor ve analiz sunmak.

Bu proje sadece demo görünümünde kalmamalı. Gerçek SaaS projesi temeli olmalı.

==================================================
2. VARSAYILAN TEKNOLOJİ STACK’İ
==================================================

Projeyi aşağıdaki teknoloji stack’i ile geliştir:

Frontend:
- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide icons
- React Hook Form
- Zod validation

Backend:
- Next.js Route Handlers veya Server Actions
- TypeScript
- API route yapısı temiz ve modüler olmalı

Database:
- Supabase PostgreSQL
- Row Level Security mantığına uygun tasarım
- Multi-tenant mimari
- Her veride business_id izolasyonu

Authentication:
- Supabase Auth veya uyumlu authentication yapısı
- Role-based access control:
  - super_admin
  - business_owner
  - manager
  - agent
  - viewer

AI:
- AI provider abstraction oluştur.
- İlk provider OpenAI uyumlu olacak şekilde tasarla.
- Daha sonra Claude, Gemini veya başka sağlayıcı eklenebilecek şekilde modüler yap.
- AI cevabı doğrudan serbest şekilde çalışmasın; işletme bilgi bankası, güvenlik kuralları ve intent sınıflandırması üzerinden çalışsın.

Vector Search:
- Başlangıçta basit full-text search ile çalışabilir.
- Mimari pgvector / vector database destekleyecek şekilde hazırlanmalı.
- knowledge_base_items ileride embedding ile aranabilecek şekilde tasarlanmalı.

Deployment:
- Vercel uyumlu frontend/backend
- Supabase database
- Environment variables ile yapılandırma

Kod kalitesi:
- TypeScript strict mode
- Temiz klasör yapısı
- Reusable components
- Validasyon
- Error handling
- Loading states
- Empty states
- Responsive design
- Güvenli API erişimi
- Temiz naming convention
- Production-ready mantık

==================================================
3. GELİŞTİRME YAKLAŞIMI
==================================================

Projeyi tek seferde dağınık yazma.

Önce:
1. Mimariyi çıkar.
2. Klasör yapısını oluştur.
3. Veritabanı şemasını hazırla.
4. Temel authentication ve layout yapısını kur.
5. İşletme panelini oluştur.
6. Bilgi bankası modülünü geliştir.
7. Web chat widget modülünü geliştir.
8. AI cevap motorunu geliştir.
9. CRM ve müşteri kayıt modülünü geliştir.
10. Randevu/talep modülünü geliştir.
11. Konuşmalar ekranını geliştir.
12. İnsan temsilciye aktarma sistemini geliştir.
13. Raporlama ekranını geliştir.
14. Admin panelini geliştir.
15. Test, hata yakalama ve iyileştirme yap.

Her aşamada çalışan, test edilebilir kod üret.

Varsayım yapman gerekiyorsa makul varsayımlar yap ve ilerle. Gereksiz soru sorma. Ancak gerçekten kritik bir karar eksikse en fazla 3 net soru sor.

==================================================
4. ÜRÜNÜN ANA MODÜLLERİ
==================================================

Bu platformda aşağıdaki modüller olacak:

A) Landing Page
B) Authentication
C) Onboarding
D) Business Dashboard
E) Conversations
F) CRM / Customers
G) Knowledge Base
H) Services & Prices
I) Appointments / Requests
J) AI Assistant Engine
K) Human Handoff
L) Lead Scoring
M) Reports & Analytics
N) Web Chat Widget
O) Admin Panel
P) Settings
Q) Integrations
R) Billing hazırlığı
S) Audit Logs
T) Notifications

Her modülü profesyonel SaaS ürünü kalitesinde tasarla.

==================================================
5. LANDING PAGE
==================================================

Ana sayfa modern, premium ve güven veren bir SaaS landing page olmalı.

Landing page bölümleri:

1. Hero section
Başlık:
“İşletmeniz için 7/24 çalışan AI müşteri temsilcisi”

Alt metin:
“WhatsApp, Instagram ve web sitenizden gelen müşteri mesajlarını yapay zekâ ile cevaplayın, randevu/talep toplayın ve müşteri kaçırmayı azaltın.”

CTA:
- “Ücretsiz demo oluştur”
- “Nasıl çalışır?”

2. Problem section
İşletmelerin problemleri:
- Geç cevap yüzünden müşteri kaybı
- Aynı soruların tekrar tekrar sorulması
- Randevu taleplerinin dağınık kalması
- Instagram/WhatsApp mesajlarının kaybolması
- Ciddi müşterilerin ayırt edilememesi

3. Solution section
Assistora AI ne yapar:
- 7/24 cevap verir
- Bilgi bankasına göre konuşur
- Randevu/talep toplar
- CRM’e kayıt eder
- Sıcak müşterileri belirler
- İnsana aktarır
- Rapor sunar

4. Sectors section
Sektör kartları:
- Güzellik salonları
- Klinikler
- Emlakçılar
- Kurs merkezleri
- Restoranlar
- Spor salonları
- Oto servisler
- Butik mağazalar

5. Features section
Özellikler:
- AI müşteri temsilcisi
- Çok kanallı mesajlaşma
- Bilgi bankası
- CRM
- Randevu/talep toplama
- İnsan devri
- Lead scoring
- Raporlama

6. Demo conversation section
Sağda chat demo, solda açıklama.

7. Pricing teaser
Paketler:
- Başlangıç
- Profesyonel
- Kurumsal

8. Final CTA

Tasarım:
- Temiz
- Modern
- Premium
- SaaS tarzı
- Responsive
- Güven veren
- Çok karmaşık değil ama profesyonel

==================================================
6. AUTHENTICATION VE ROLLER
==================================================

Kullanıcı sisteme kayıt olabilir, giriş yapabilir.

Roller:

super_admin:
- Tüm işletmeleri görür.
- Tüm kullanıcıları görür.
- Sistem kullanımını görür.
- Admin paneline erişir.

business_owner:
- Kendi işletmesini yönetir.
- Ekip üyeleri ekler.
- Bilgi bankası, konuşmalar, CRM, raporlar, ayarlar gibi tüm işletme alanlarını yönetir.

manager:
- Konuşmaları, müşterileri, randevuları ve bilgi bankasını yönetebilir.
- Billing ve kritik ayarlara erişemez.

agent:
- Sadece konuşmaları, müşteri kartlarını ve handoff konularını yönetir.

viewer:
- Sadece rapor ve konuşma görüntüler.

Her API request’te user session doğrulanmalı.
Her veri business_id ile izole edilmeli.
Kullanıcı sadece yetkili olduğu business verisini görebilmeli.

==================================================
7. ONBOARDING AKIŞI
==================================================

Yeni işletme sisteme girince onboarding ekranı göster.

Onboarding adımları:

1. İşletme bilgileri
- İşletme adı
- Sektör
- Telefon
- Adres
- Web sitesi
- Instagram kullanıcı adı
- WhatsApp numarası

2. Marka tonu seçimi
Seçenekler:
- Samimi
- Profesyonel
- Kurumsal
- Lüks
- Genç ve enerjik
- Kısa ve net

3. Çalışma saatleri
- Günlere göre saat seçimi
- Kapalı günler

4. Hizmetler
- Hizmet adı
- Açıklama
- Süre
- Fiyat
- Fiyat gösterilsin mi?
- Randevu alınabilir mi?

5. Sık sorulan sorular
- Soru
- Cevap
- Kategori

6. İnsan devri kuralları
- Şikâyet
- Ödeme/iade
- Sağlık/hukuk
- Fiyat bilinmiyor
- Müşteri insan istedi
- AI emin değil

7. Test konuşması
İşletme sahibi botla deneme konuşması yapabilsin.

8. Web chat widget kodu
Sisteme ekleyebileceği script kodu göster.

Onboarding sonunda kullanıcı dashboard’a yönlendirilsin.

==================================================
8. BUSINESS DASHBOARD
==================================================

Dashboard profesyonel görünsün.

Kartlar:
- Bugünkü mesajlar
- Yeni müşteriler
- Randevu/talep sayısı
- Sıcak lead sayısı
- İnsan temsilciye aktarılan konuşmalar
- Ortalama cevap süresi
- AI başarı oranı
- En çok sorulan konu

Grafikler:
- Günlük mesaj trendi
- Kanal bazlı mesajlar
- Lead durumları
- Randevu/talep dönüşümü
- En çok talep edilen hizmetler

Listeler:
- Son konuşmalar
- Sıcak müşteriler
- Bekleyen randevu talepleri
- İnsan devri bekleyen konuşmalar
- Bilgi bankasına eklenmesi önerilen sorular

Empty state:
Eğer veri yoksa kullanıcıya demo konuşması oluşturma butonu göster.

==================================================
9. CONVERSATIONS MODÜLÜ
==================================================

Konuşmalar ekranı 3 kolonlu olsun.

Sol kolon:
- Müşteri listesi
- Kanal ikonu
- Son mesaj
- Lead puanı
- Durum etiketi
- Arama
- Filtreler:
  - Tüm konuşmalar
  - AI aktif
  - İnsan devrinde
  - Sıcak lead
  - Şikâyet
  - Randevu bekliyor
  - Cevapsız

Orta kolon:
- Konuşma geçmişi
- Mesaj balonları
- AI mesajı
- Müşteri mesajı
- İnsan temsilci mesajı
- Sistem notları
- Handoff uyarısı
- Mesaj yazma alanı
- AI önerilen cevap
- “AI’yi durdur”
- “AI’yi tekrar başlat”
- “İnsana aktar”
- “Randevu oluştur”
- “Müşteri kartını güncelle”

Sağ kolon:
- Müşteri kartı
- Ad
- Telefon
- E-posta
- Kaynak kanal
- Lead puanı
- Etiketler
- Durum
- Sonraki aksiyon
- Notlar
- Talep edilen hizmet
- Randevu durumu
- Geçmiş konuşmalar

Özellikler:
- Konuşma arama
- Etiketleme
- Not ekleme
- Personel atama
- Handoff durumu
- AI confidence görünümü
- Intent görünümü
- Lead score görünümü

==================================================
10. CRM / CUSTOMERS MODÜLÜ
==================================================

Müşteri listesi ekranı:

Kolonlar:
- Ad
- Telefon
- Kaynak
- Son iletişim
- Talep edilen hizmet
- Lead puanı
- Durum
- Etiketler
- Atanan personel

Filtreler:
- Kaynak kanal
- Lead sıcaklığı
- Durum
- Tarih
- Hizmet
- Etiket

Müşteri detay ekranı:
- Profil bilgileri
- Konuşma geçmişi
- Randevu/talep geçmişi
- Lead event timeline
- Notlar
- Etiketler
- Atanan personel
- Sonraki aksiyon
- AI özet

AI müşteri özeti:
Sistem konuşma geçmişinden kısa özet çıkarabilsin:
“Bu müşteri lazer epilasyon fiyatı sordu, tüm vücut paketiyle ilgileniyor, telefon verdi ve yarın için randevu talep etti.”

==================================================
11. KNOWLEDGE BASE MODÜLÜ
==================================================

Bilgi bankası ekranı işletmenin AI temsilcisinin beynidir.

İçerikler:
- Genel işletme bilgileri
- Hizmetler
- Fiyatlar
- Kampanyalar
- SSS
- Kurallar
- Yasak cevaplar
- İnsan devri kuralları
- Marka tonu
- KVKK metin linki

Knowledge base item alanları:
- title
- content
- category
- tags
- priority
- is_active
- source_type
- created_by
- updated_at

Kategori örnekleri:
- Genel bilgi
- Hizmet
- Fiyat
- Kampanya
- Randevu
- İptal
- Konum
- Çalışma saati
- Hassas konu
- Yasak cevap
- İnsan devri

Özellikler:
- Yeni bilgi ekle
- Bilgi düzenle
- Bilgi pasif yap
- Toplu içe aktarma hazırlığı
- AI test et
- Bu bilgiyle örnek cevap üret
- Bilgi eksikliği uyarıları

AI bilgi bankasında olmayan konularda cevap uydurmasın.

==================================================
12. SERVICES & PRICES MODÜLÜ
==================================================

Hizmet yönetimi ekranı:

Alanlar:
- Hizmet adı
- Açıklama
- Kategori
- Süre
- Fiyat
- Fiyat aralığı
- Fiyat gizli mi?
- Randevu alınabilir mi?
- Ön görüşme gerekli mi?
- Aktif/pasif

Güzellik salonu örnek hizmetleri:
- Lazer epilasyon
- Cilt bakımı
- Kaş tasarımı
- Manikür
- Pedikür

Klinik örnek hizmetleri:
- Diş taşı temizliği
- Muayene
- Estetik danışmanlık
- Ön görüşme

Emlakçı örnek hizmetleri:
- Kiralık daire
- Satılık daire
- Değerleme
- Portföy başvurusu

AI fiyat sorularında bu tablodan yararlansın.
Fiyat yoksa fiyat uydurmasın.
Fiyat aralığı varsa net şekilde aralık versin.
Fiyat gösterilmemesi gerekiyorsa ön görüşmeye yönlendirsin.

==================================================
13. APPOINTMENTS / REQUESTS MODÜLÜ
==================================================

Başlangıçta takvim entegrasyonu zorunlu değil.
Önce “randevu/talep alma” modeli kur.

Talep alanları:
- business_id
- customer_id
- service_id
- requested_date
- requested_time
- customer_name
- customer_phone
- note
- source_channel
- status
- assigned_to

Durumlar:
- new
- pending_confirmation
- confirmed
- handed_off
- cancelled
- completed
- converted
- lost

Ekranda:
- Takvim görünümü
- Liste görünümü
- Durum filtreleri
- Onayla
- İptal et
- Müşteriyle konuşmaya git
- Not ekle
- Personel ata

AI randevu talebi oluştururken:
1. Hizmeti netleştirir.
2. Tarih ister.
3. Saat ister.
4. Ad soyad ister.
5. Telefon ister.
6. Talep oluşturur.
7. “Randevu talebiniz alınmıştır, işletme ekibi kesin onay için sizinle iletişime geçecektir.” der.

==================================================
14. AI ASSISTANT ENGINE
==================================================

Bu platformun en önemli kısmı AI motorudur.

AI motoru şu adımlarla çalışmalı:

1. Mesaj alınır.
2. Mesaj business_id ile eşleştirilir.
3. Müşteri bulunur veya oluşturulur.
4. Conversation bulunur veya oluşturulur.
5. Mesaj kaydedilir.
6. Intent classification yapılır.
7. Risk analizi yapılır.
8. Knowledge base’den ilgili bilgiler çekilir.
9. AI cevap üretir.
10. Gerekirse action oluşturulur:
   - randevu talebi
   - CRM güncelleme
   - lead score artırma
   - handoff
   - notification
11. Cevap kaydedilir.
12. Cevap müşteriye gönderilir.

AI response JSON formatında dönsün.

Örnek AI response schema:

{
  "reply": "Merhaba, hangi hizmetimiz hakkında fiyat almak istersiniz?",
  "intent": "price_question",
  "confidence": 0.87,
  "risk_level": "low",
  "should_handoff": false,
  "handoff_reason": null,
  "lead_score_delta": 10,
  "detected_entities": {
    "service": null,
    "date": null,
    "time": null,
    "phone": null,
    "name": null
  },
  "next_action": "ask_service_clarification",
  "appointment_request": null,
  "customer_update": {
    "status": "price_asked",
    "tags": ["fiyat_sordu"]
  }
}

AI hiçbir zaman direkt veritabanına yazmasın.
AI sadece structured output üretsin.
Action engine bu çıktıyı doğrulayıp veritabanına yazsın.

==================================================
15. AI SYSTEM PROMPT
==================================================

AI müşteri temsilcisi için aşağıdaki system prompt mantığını uygula:

Sen bir işletmenin profesyonel AI müşteri temsilcisisin.

Görevin:
- Müşteriden gelen mesajları anlamak.
- İşletmenin bilgi bankasına göre cevap vermek.
- Kısa, net, nazik ve profesyonel konuşmak.
- Gerektiğinde randevu/talep toplamak.
- Gerektiğinde insan temsilciye aktarmak.
- Bilmediğin hiçbir bilgiyi uydurmamak.

Kurallar:
1. Sadece işletmenin bilgi bankasındaki bilgilere göre cevap ver.
2. Bilgi bankasında olmayan fiyat, kampanya, müsaitlik veya politika bilgisi uydurma.
3. Müşterinin dilinde cevap ver.
4. Müşteri Türkçe yazarsa Türkçe cevap ver.
5. Müşteri İngilizce yazarsa İngilizce cevap ver.
6. Cevapların kısa, doğal ve profesyonel olsun.
7. Sağlık, hukuk, ödeme, iade, şikâyet gibi hassas konularda dikkatli ol.
8. Tıbbi teşhis koyma.
9. Hukuki tavsiye verme.
10. Kesin sonuç veya garanti verme.
11. Rakip işletmeleri kötüleme.
12. Müşteri sinirliyse sakin ve empatik davran.
13. Müşteri insan temsilci isterse hemen handoff öner.
14. Emin değilsen cevap uydurma, insan temsilciye aktar.
15. Müşteriden gereksiz kişisel bilgi isteme.
16. Randevu/talep için yalnızca gerekli bilgileri topla.
17. Aynı anda çok fazla soru sorma.
18. Müşteriyi bir sonraki adıma yönlendir.
19. Uygunsa randevu veya talep oluşturmayı teklif et.
20. İşletmenin marka tonuna uygun konuş.

Riskli konular:
- Şikâyet
- İade
- Ödeme problemi
- Sağlık sorusu
- Hukuki soru
- Hakaret
- Tehdit
- Fiyat pazarlığı
- Bilgi bankasında olmayan konu
- İnsan temsilci isteği

Bu durumlarda should_handoff true olmalı.

==================================================
16. INTENT CLASSIFICATION
==================================================

Sistem şu intent türlerini desteklesin:

- greeting
- price_question
- service_info
- appointment_request
- reservation_request
- product_stock_question
- location_question
- working_hours_question
- campaign_question
- complaint
- cancellation_request
- refund_request
- human_agent_request
- irrelevant_message
- sensitive_health_question
- sensitive_legal_question
- payment_issue
- unknown

Her intent için action:

greeting:
- Kısa karşılama
- Yardım teklif et

price_question:
- Hizmet net değilse hizmet sor
- Hizmet netse fiyat bilgisini bul
- Fiyat varsa cevapla
- Fiyat yoksa handoff veya ön görüşme öner
- Lead score +10

service_info:
- Bilgi bankasından açıklama yap
- Randevu/talep teklif et

appointment_request:
- Gerekli bilgileri topla
- Talep oluştur
- Lead score +40

location_question:
- Adres ve konum linki ver

working_hours_question:
- Çalışma saatlerini ver

campaign_question:
- Aktif kampanya varsa açıkla
- Yoksa kampanya olmadığını nazikçe belirt veya bilgi için temsilciye yönlendir

complaint:
- Empati kur
- Kısa bilgi iste
- Handoff oluştur
- Öncelik yüksek

refund_request:
- Politika varsa genel bilgi ver
- Kesin söz verme
- Handoff oluştur

human_agent_request:
- Handoff oluştur

unknown:
- Kibarca netleştirme sorusu sor
- Confidence düşükse handoff oluştur

==================================================
17. HUMAN HANDOFF
==================================================

Handoff modülü şu şekilde çalışsın:

Handoff oluşturma nedenleri:
- complaint
- refund_request
- payment_issue
- human_agent_request
- low_confidence
- missing_knowledge
- sensitive_topic
- high_value_lead
- manual_override

Handoff kaydı:
- conversation_id
- customer_id
- business_id
- reason
- priority
- status
- assigned_to
- created_at
- resolved_at

Durumlar:
- open
- assigned
- in_progress
- resolved
- closed

Panelde handoff uyarısı görünmeli:
“Bu konuşma insan temsilciye aktarılmalı.”

İşletme sahibi konuşmaya girince:
- AI otomatik cevap vermeyi durdurabilsin.
- Temsilci manuel cevap yazabilsin.
- Sonra AI tekrar aktif edilebilsin.

==================================================
18. LEAD SCORING
==================================================

Lead scoring sistemi oluştur.

Lead event örnekleri:
- price_question: +10
- service_selected: +20
- phone_provided: +25
- appointment_requested: +40
- urgent_intent: +30
- repeated_interest: +15
- complaint: özel durum
- irrelevant: 0

Lead sıcaklığı:
- 0-30 cold
- 31-60 warm
- 61-100 hot

Müşteri kartında lead score göster.
Konuşma listesinde hot lead badge göster.
Dashboard’da sıcak lead sayısını göster.

AI, hot lead oluştuğunda işletmeye bildirim oluşturmalı:
“Sıcak müşteri: Bu müşteri randevu almaya çok yakın.”

==================================================
19. WEB CHAT WIDGET
==================================================

Web chat widget profesyonel olmalı.

Özellikler:
- Sağ altta chat balonu
- İşletme logosu/başlığı
- Açılış mesajı
- Hızlı seçenek butonları:
  - Fiyat almak istiyorum
  - Randevu almak istiyorum
  - Çalışma saatleri
  - Konum
  - İnsan temsilci
- Mesaj yazma alanı
- Loading indicator
- AI typing indicator
- Mobil uyum
- Marka rengi ayarı
- KVKK aydınlatma linki
- Konuşma ID oluşturma
- Müşteri tekrar geldiğinde konuşmayı devam ettirme hazırlığı

Widget ayrı embed edilebilir olmalı.

Örnek embed kodu:
<script src="https://domain.com/widget.js" data-business-id="BUSINESS_ID"></script>

MVP’de gerçek external script şart değilse, dashboard içinde demo widget yapılabilir. Ama mimari gerçek widget’a uygun olmalı.

==================================================
20. ADMIN PANEL
==================================================

super_admin için admin panel oluştur.

Ekranlar:
- Tüm işletmeler
- Tüm kullanıcılar
- Paketler
- Kullanım metrikleri
- AI kullanım maliyetleri
- Mesaj sayıları
- Sistem logları
- Hatalar
- Entegrasyon durumları
- Subscription hazırlığı

Admin dashboard metrikleri:
- Toplam işletme
- Aktif işletme
- Toplam mesaj
- Bugünkü mesaj
- AI cevap sayısı
- Handoff sayısı
- Aktif abonelikler
- Tahmini MRR
- En çok kullanan işletmeler

==================================================
21. REPORTING MODÜLÜ
==================================================

İşletme raporları:

Günlük:
- Toplam mesaj
- Yeni müşteri
- Randevu/talep
- En çok sorulan konu
- Handoff sayısı

Haftalık:
- Mesaj trendi
- Lead dönüşümü
- Kanal performansı
- En popüler hizmetler
- AI başarı oranı
- Bilgi bankasına eklenmesi gereken sorular

Aylık:
- Toplam müşteri
- Sıcak lead sayısı
- Talep dönüşümü
- Ortalama cevap süresi
- Tahmini kazanılan zaman
- En yoğun gün/saat
- Kaybedilen müşteriler

Rapor ekranında grafikler ve özet kartlar olsun.

==================================================
22. DATABASE SCHEMA
==================================================

Aşağıdaki tabloları oluştur.

businesses:
- id uuid primary key
- name text
- slug text unique
- sector text
- phone text
- whatsapp_number text
- instagram_handle text
- website text
- address text
- location_url text
- timezone text default 'Europe/Istanbul'
- brand_tone text
- primary_color text
- status text
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz nullable

users:
Supabase auth users kullanılabilir.
Ek profile tablosu oluştur:
profiles:
- id uuid primary key references auth.users
- full_name text
- email text
- avatar_url text
- created_at timestamptz

business_users:
- id uuid primary key
- business_id uuid references businesses
- user_id uuid references profiles
- role text
- created_at timestamptz

customers:
- id uuid primary key
- business_id uuid references businesses
- name text nullable
- phone text nullable
- email text nullable
- instagram_id text nullable
- external_id text nullable
- source_channel text
- status text
- lead_score integer default 0
- language text
- notes text
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz nullable

conversations:
- id uuid primary key
- business_id uuid references businesses
- customer_id uuid references customers
- channel text
- status text
- ai_enabled boolean default true
- assigned_to uuid nullable
- last_message_at timestamptz
- created_at timestamptz
- updated_at timestamptz

messages:
- id uuid primary key
- business_id uuid references businesses
- conversation_id uuid references conversations
- customer_id uuid references customers
- sender_type text
- sender_id uuid nullable
- content text
- intent text nullable
- ai_confidence numeric nullable
- metadata jsonb
- created_at timestamptz

knowledge_base_items:
- id uuid primary key
- business_id uuid references businesses
- title text
- content text
- category text
- tags text[]
- priority integer default 0
- is_active boolean default true
- source_type text
- created_by uuid nullable
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz nullable

services:
- id uuid primary key
- business_id uuid references businesses
- name text
- description text
- category text
- duration_minutes integer nullable
- is_bookable boolean default true
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz

service_prices:
- id uuid primary key
- business_id uuid references businesses
- service_id uuid references services
- price numeric nullable
- price_min numeric nullable
- price_max numeric nullable
- currency text default 'TRY'
- display_price boolean default true
- note text nullable
- created_at timestamptz
- updated_at timestamptz

appointments:
- id uuid primary key
- business_id uuid references businesses
- customer_id uuid references customers
- conversation_id uuid references conversations
- service_id uuid references services nullable
- requested_date date nullable
- requested_time time nullable
- customer_name text nullable
- customer_phone text nullable
- note text nullable
- source_channel text
- status text
- assigned_to uuid nullable
- created_at timestamptz
- updated_at timestamptz

lead_events:
- id uuid primary key
- business_id uuid references businesses
- customer_id uuid references customers
- conversation_id uuid references conversations nullable
- event_type text
- score_delta integer
- description text
- created_at timestamptz

handoffs:
- id uuid primary key
- business_id uuid references businesses
- conversation_id uuid references conversations
- customer_id uuid references customers
- reason text
- priority text
- status text
- assigned_to uuid nullable
- created_at timestamptz
- resolved_at timestamptz nullable

tags:
- id uuid primary key
- business_id uuid references businesses
- name text
- color text
- created_at timestamptz

customer_tags:
- id uuid primary key
- business_id uuid references businesses
- customer_id uuid references customers
- tag_id uuid references tags
- created_at timestamptz

ai_logs:
- id uuid primary key
- business_id uuid references businesses
- conversation_id uuid references conversations
- message_id uuid references messages nullable
- provider text
- model text
- prompt_tokens integer nullable
- completion_tokens integer nullable
- intent text nullable
- confidence numeric nullable
- risk_level text nullable
- raw_response jsonb
- error text nullable
- created_at timestamptz

ai_feedback:
- id uuid primary key
- business_id uuid references businesses
- message_id uuid references messages
- feedback_type text
- comment text nullable
- created_by uuid nullable
- created_at timestamptz

integrations:
- id uuid primary key
- business_id uuid references businesses
- provider text
- status text
- config jsonb
- created_at timestamptz
- updated_at timestamptz

notifications:
- id uuid primary key
- business_id uuid references businesses
- user_id uuid nullable
- type text
- title text
- body text
- status text
- metadata jsonb
- created_at timestamptz
- read_at timestamptz nullable

audit_logs:
- id uuid primary key
- business_id uuid nullable
- user_id uuid nullable
- action text
- entity_type text
- entity_id uuid nullable
- metadata jsonb
- created_at timestamptz

usage_logs:
- id uuid primary key
- business_id uuid references businesses
- usage_type text
- quantity integer
- metadata jsonb
- created_at timestamptz

subscriptions:
- id uuid primary key
- business_id uuid references businesses
- plan text
- status text
- current_period_start timestamptz
- current_period_end timestamptz
- created_at timestamptz
- updated_at timestamptz

İndeksler:
- Her tabloda business_id index
- conversations business_id + last_message_at
- messages conversation_id + created_at
- customers business_id + phone
- customers business_id + lead_score
- appointments business_id + status
- handoffs business_id + status
- knowledge_base_items business_id + category
- audit_logs business_id + created_at

RLS:
- Kullanıcı sadece bağlı olduğu business_id verilerini görebilmeli.
- super_admin özel policy ile tüm veriyi görebilir.
- Soft delete desteklenmeli.

==================================================
23. API ENDPOINTS
==================================================

Aşağıdaki endpointleri oluştur veya tasarla:

Auth:
- GET /api/me
- POST /api/onboarding

Businesses:
- GET /api/businesses/current
- PATCH /api/businesses/current

Dashboard:
- GET /api/dashboard/overview

Conversations:
- GET /api/conversations
- GET /api/conversations/:id
- POST /api/conversations/:id/messages
- POST /api/conversations/:id/handoff
- POST /api/conversations/:id/ai-toggle

Customers:
- GET /api/customers
- GET /api/customers/:id
- PATCH /api/customers/:id
- POST /api/customers/:id/tags

Knowledge Base:
- GET /api/knowledge-base
- POST /api/knowledge-base
- PATCH /api/knowledge-base/:id
- DELETE /api/knowledge-base/:id
- POST /api/knowledge-base/test

Services:
- GET /api/services
- POST /api/services
- PATCH /api/services/:id
- DELETE /api/services/:id

Appointments:
- GET /api/appointments
- POST /api/appointments
- PATCH /api/appointments/:id

AI:
- POST /api/ai/respond
- POST /api/ai/test-response
- POST /api/ai/feedback

Widget:
- POST /api/widget/message
- GET /api/widget/config/:businessId

Admin:
- GET /api/admin/overview
- GET /api/admin/businesses
- GET /api/admin/usage

Her endpoint:
- Auth kontrolü yapsın.
- business_id izolasyonu sağlasın.
- Zod ile input validation yapsın.
- Hata durumlarında standart JSON error dönsün.

==================================================
24. SECURITY
==================================================

Güvenlik gereksinimleri:

- Authentication zorunlu.
- Role-based authorization.
- business_id izolasyonu.
- RLS uyumlu veritabanı tasarımı.
- API validation.
- Rate limiting hazırlığı.
- Webhook secret doğrulama hazırlığı.
- Kullanıcı girdisi sanitize edilmeli.
- AI prompt injection riskine karşı knowledge base ve system prompt ayrımı yapılmalı.
- AI’ye gelen müşteri mesajı doğrudan sistem kurallarını değiştirememeli.
- Kişisel veriler gereksiz yere AI loglarında tutulmamalı.
- Hassas veriler mümkünse maskelenmeli.
- Audit log tutulmalı.
- Delete işlemleri soft delete olmalı.
- KVKK için veri silme/dışa aktarma altyapısı düşünülmeli.

KVKK hukuki metinlerini örnek olarak koyabilirsin ama gerçek kullanımda avukat kontrolü gerektiğini not olarak belirt.

==================================================
25. UI/UX TASARIM KALİTESİ
==================================================

Tasarım kalitesi çok yüksek olsun.

Tasarım dili:
- Premium SaaS
- Temiz
- Minimal
- Hızlı
- Modern
- Güven veren
- Responsive
- Dashboard odaklı

Renk önerisi:
- Ana renk: koyu lacivert veya mor/mavi gradient
- Arka plan: açık gri / beyaz
- Kartlar: beyaz
- Border: soft gray
- Başarı: yeşil
- Uyarı: amber
- Tehlike: kırmızı
- AI vurgusu: mor veya mavi

Component kalitesi:
- Card
- Badge
- Table
- Tabs
- Dialog
- Sheet
- Dropdown
- Command menu
- Skeleton loading
- Empty state
- Toast notification

Her ekranda:
- Loading state
- Error state
- Empty state
- Responsive state
- Yetki yoksa access denied state

==================================================
26. MVP KAPSAMI
==================================================

İlk MVP’de mutlaka yap:

1. Landing page
2. Auth
3. Onboarding
4. Business dashboard
5. Knowledge base CRUD
6. Services CRUD
7. Customers CRM
8. Conversations screen
9. Demo web chat widget
10. AI response endpoint
11. Appointment/request creation
12. Human handoff
13. Lead scoring
14. Basic reports
15. Admin overview
16. Settings

MVP’de şimdilik yapma:
- Gerçek WhatsApp entegrasyonu
- Gerçek Instagram entegrasyonu
- Payment entegrasyonu
- Voice AI
- Çok gelişmiş kampanya sistemi
- Çok şubeli kurumsal yapı
- Tam otomatik takvim entegrasyonu

Ama mimari bu özellikler eklenebilir şekilde kurulsun.

==================================================
27. DEMO DATA
==================================================

Geliştirme sırasında demo işletme oluştur:

İşletme:
Bella Güzellik Salonu

Sektör:
Güzellik salonu

Konum:
Kadıköy / İstanbul

Çalışma saatleri:
10:00 - 20:00

Hizmetler:
- Lazer epilasyon
- Cilt bakımı
- Kaş tasarımı
- Manikür
- Pedikür

Örnek fiyatlar:
- Cilt bakımı: 1200 TL
- Kaş tasarımı: 500 TL
- Manikür: 450 TL
- Pedikür: 550 TL
- Lazer epilasyon bölgeye göre değişir

SSS:
Soru: Nerede bulunuyorsunuz?
Cevap: Kadıköy İstanbul’da hizmet veriyoruz. Konum linkimizi paylaşabiliriz.

Soru: Randevusuz gelebilir miyim?
Cevap: Müsaitliğe göre yardımcı olabiliriz ancak randevu almanızı öneririz.

Soru: Çalışma saatleriniz nedir?
Cevap: Her gün 10:00 - 20:00 arasında hizmet veriyoruz.

Soru: Lazer epilasyon kaç seans sürer?
Cevap: Kişiye göre değişebilir. En doğru bilgi için uzman görüşmesi önerilir.

Yasak cevaplar:
- Kesin sonuç garantisi verme.
- Tıbbi teşhis koyma.
- Bilinmeyen fiyatı uydurma.
- Sağlık iddiasında bulunma.

Demo konuşmalar:
1. Müşteri fiyat sorar.
2. Müşteri randevu ister.
3. Müşteri konum sorar.
4. Müşteri kampanya sorar.
5. Müşteri hassas sağlık sorusu sorar.
6. Müşteri şikâyet eder.
7. Müşteri insan temsilci ister.

==================================================
28. ACCEPTANCE CRITERIA
==================================================

Proje şu kriterleri karşılamalı:

- Kullanıcı kayıt/giriş yapabilmeli.
- İşletme onboarding tamamlayabilmeli.
- İşletme bilgi bankası oluşturabilmeli.
- Hizmet/fiyat ekleyebilmeli.
- Dashboard temel metrikleri göstermeli.
- Web chat üzerinden mesaj gönderilebilmeli.
- AI cevap üretebilmeli.
- AI bilgi bankasına göre cevap vermeli.
- Bilmediği konularda uydurmamalı.
- Randevu talebi oluşturabilmeli.
- Müşteri CRM’e kaydedilmeli.
- Konuşma geçmişi tutulmalı.
- Lead score artmalı.
- İnsan devri oluşturulabilmeli.
- Rapor ekranı temel istatistikleri göstermeli.
- Admin panel temel işletme ve kullanım verilerini göstermeli.
- UI responsive olmalı.
- Kod TypeScript hatasız olmalı.
- Veritabanı multi-tenant mantığına uygun olmalı.
- API inputları validate edilmeli.

==================================================
29. GELİŞTİRME ÇIKTILARI
==================================================

Benden önce şunları üret:

1. Proje mimarisi özeti
2. Klasör yapısı
3. Veritabanı SQL migration dosyaları
4. Environment variables listesi
5. Ana component listesi
6. API route listesi
7. Geliştirme sırası
8. Sonra kodu oluşturmaya başla

Kod oluştururken:
- Eksik dosya bırakma.
- Placeholder yerine çalışan temel mantık yaz.
- Mock gerekiyorsa açıkça belirt.
- Kritik alanlarda TODO bırakma.
- Gerekli yerlerde comment ekle.
- Hataları yakala.
- Kullanıcı deneyimini iyi yap.
- Her formda validation olsun.
- Her listede empty state olsun.

==================================================
30. DOSYA YAPISI ÖNERİSİ
==================================================

Aşağıdaki gibi bir yapı kullan:

src/
  app/
    page.tsx
    login/
    register/
    onboarding/
    dashboard/
      page.tsx
      conversations/
      customers/
      knowledge-base/
      services/
      appointments/
      reports/
      settings/
    admin/
    api/
      ai/
      widget/
      conversations/
      customers/
      knowledge-base/
      services/
      appointments/
      dashboard/
  components/
    ui/
    layout/
    dashboard/
    conversations/
    customers/
    knowledge-base/
    widget/
    landing/
  lib/
    supabase/
    ai/
    auth/
    validators/
    utils/
    permissions/
  server/
    actions/
    services/
    repositories/
  types/
  hooks/
  styles/

supabase/
  migrations/
  seed.sql

==================================================
31. AI RESPONSE ENGINE DETAYI
==================================================

AI motorunu modüler yaz:

lib/ai/
- provider.ts
- openai-provider.ts
- prompts.ts
- intent-classifier.ts
- knowledge-retriever.ts
- response-generator.ts
- safety.ts
- schemas.ts

Fonksiyonlar:

classifyIntent(message, context)
retrieveKnowledge(businessId, message)
generateAIResponse({message, business, customer, conversation, knowledge})
validateAIResponse(response)
executeAIActions(response)

AI provider değiştirilebilir olsun.

==================================================
32. ÖNEMLİ DAVRANIŞ
==================================================

Bu projeyi geliştirirken şunu unutma:

Bu sistemin gerçek değeri “AI cevap veriyor” değil.

Gerçek değer:
- Müşteri kaçırmayı azaltması
- Randevu/talep toplaması
- CRM’e kayıt yapması
- Sıcak müşteriyi bulması
- İşletme sahibine zaman kazandırması
- Mesajları tek panelde toplaması
- Eksik bilgileri raporlaması

Bu yüzden ürün deneyimini bu değeri gösterecek şekilde tasarla.

Dashboard, raporlar ve konuşma ekranı işletme sahibine şu hissi vermeli:

“Bu sistem benim yerime müşterilerle ilgileniyor ve bana satış fırsatlarını getiriyor.”

==================================================
33. SON TALİMAT
==================================================

Şimdi bu projeyi profesyonel şekilde geliştirmeye başla.

İlk yanıtında:
1. Kısa mimari özet ver.
2. Klasör yapısını ver.
3. Veritabanı şemasını nasıl kuracağını açıkla.
4. MVP geliştirme sırasını ver.
5. Sonra uygulama kodlarını üretmeye başla.

Lütfen yüzeysel cevap verme.
Bu projeyi gerçek bir SaaS ürünü gibi ele al.
Kaliteli, ölçeklenebilir, temiz kodlu, profesyonel ve satılabilir bir temel oluştur.