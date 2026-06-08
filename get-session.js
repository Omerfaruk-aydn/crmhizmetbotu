const { IgApiClient, IgLoginTwoFactorRequiredError } = require('instagram-private-api');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function run() {
  console.log('====================================================');
  console.log('       INSTAGRAM OTURUM KODU (SESSION) OLUŞTURUCU    ');
  console.log('====================================================');
  console.log('Bu araç, kendi bilgisayarınızın (güvenilir ev/ofis IP) üzerinden');
  console.log('Instagram\'a giriş yaparak Vercel sunucularının takılmayacağı');
  console.log('hazır bir oturum kodu (session JSON) üretir.\n');

  const username = await ask('Instagram Kullanıcı Adı: ');
  const password = await ask('Instagram Şifresi: ');

  if (!username || !password) {
    console.error('\nHata: Kullanıcı adı ve şifre zorunludur!');
    rl.close();
    return;
  }

  console.log('\nGiriş yapılıyor, lütfen bekleyin...');
  const ig = new IgApiClient();
  ig.state.generateDevice(username);

  try {
    await ig.simulate.preLoginFlow();
    let loginResponse = null;

    try {
      loginResponse = await ig.account.login(username, password);
    } catch (loginErr) {
      // Check if 2FA is required
      if (loginErr instanceof IgLoginTwoFactorRequiredError || (loginErr.response && loginErr.response.body && loginErr.response.body.two_factor_info)) {
        console.log('\n[!] İki Aşamalı Doğrulama (2FA) Algılandı.');
        const twoFactorInfo = loginErr.response.body.two_factor_info;
        const twoFactorIdentifier = twoFactorInfo.two_factor_identifier;
        
        console.log(`Doğrulama yöntemi: ${twoFactorInfo.obfuscated_phone_number ? 'SMS (' + twoFactorInfo.obfuscated_phone_number + ')' : 'Authenticator Uygulaması'}`);
        
        const code = await ask('\nLütfen 6 haneli doğrulama kodunu girin: ');
        if (!code) {
          console.error('Hata: Doğrulama kodu boş olamaz.');
          rl.close();
          return;
        }

        console.log('\nDoğrulama koduyla giriş yapılıyor...');
        loginResponse = await ig.account.twoFactorLogin({
          username,
          verificationCode: code,
          twoFactorIdentifier: twoFactorIdentifier,
          trustThisDevice: '1',
        });
      } else {
        throw loginErr;
      }
    }

    // Simulate post-login flow in background
    process.nextTick(async () => {
      try {
        await ig.simulate.postLoginFlow();
      } catch (e) {}
    });

    const serializedState = await ig.state.serialize();
    const sessionJson = JSON.stringify(serializedState);

    console.log('\n================ GİRİŞ BAŞARILI ================');
    console.log('Aşağıdaki JSON kodunun TAMAMINI kopyalayın ve paneldeki');
    console.log('"Oturum Kodu (Session JSON)" alanına yapıştırın:\n');
    console.log(sessionJson);
    console.log('\n================================================\n');

  } catch (err) {
    console.error('\nHata: Giriş başarısız oldu.');
    console.error(err.message || err);
    console.log('\nİpucu:');
    console.log('1. Şifrenizin doğruluğundan emin olun.');
    console.log('2. Instagram uygulamasından giriş denemesini onaylayın ("Bendim" butonuna basın).');
    console.log('3. İki aşamalı doğrulamayı (2FA) geçici olarak kapatıp tekrar deneyebilirsiniz.');
  } finally {
    rl.close();
  }
}

run();
