import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="bg-[#030712] text-zinc-100 min-h-screen p-8 md:p-16">
      <div className="max-w-3xl mx-auto bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-10 backdrop-blur-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-white">Gizlilik Politikası</h1>
        <p className="text-zinc-400 mb-4">Son Güncelleme: 7 Haziran 2026</p>
        
        <div className="space-y-6 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-2">1. Veri Toplama</h2>
            <p>Assistora AI, hizmetlerini sunabilmek adına Instagram ve diğer entegre platformlar üzerinden gerekli kullanıcı verilerini toplar. Bu veriler sadece sunduğumuz yapay zeka müşteri temsilcisi hizmetini iyileştirmek için kullanılır.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">2. Veri Kullanımı</h2>
            <p>Toplanan veriler, hesabınızı yönetmek, Instagram entegrasyonunu sağlamak ve yapay zeka modellerimizi eğiterek size daha iyi cevaplar sunmak amacıyla işlenir.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">3. Veri Güvenliği</h2>
            <p>Kullanıcı verilerinizin güvenliği bizim için en önemli önceliktir. Tüm veriler endüstri standartlarında şifreleme yöntemleri ile korunmaktadır.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-2">4. İletişim</h2>
            <p>Gizlilik politikamızla ilgili herhangi bir sorunuz olursa lütfen bizimle iletişime geçin.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
