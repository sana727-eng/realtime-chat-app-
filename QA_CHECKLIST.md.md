**\*\*Test Senaryosu 1**: Kayıt ve Otomatik Giriş

Adımlar

* Yeni kullanıcı kaydı oluştur.
* Kayıt işlemini tamamla.



Beklenen Sonuç

* Kullanıcı otomatik olarak oturum açar.
* Sohbet uygulaması ana ekranına yönlendirilir.





Sonuç

Başarılı.

\----------------------



**\*\*\*Test Senaryosu 2**: Oda Oluşturma ve Mesaj Kalıcılığı

Adımlar

* Yeni bir oda oluştur.
* Odaya mesaj gönder.
* Sayfayı yenile.





Beklenen Sonuç

* Oda mevcut kalır.
* Gönderilen mesajlar MongoDB'den yeniden yüklenir.





Sonuç

Başarılı.

MongoDB kalıcılığı doğrulandı.

\--------------------

**\*\*Test Senaryosu 3**: Çıkış Yapma

Adımlar



* Oturumu kapat.
* Giriş ekranına dönüldüğünü doğrula.
* Sayfayı yenile.



Beklenen Sonuç

* Kullanıcı giriş ekranında kalır.
* Oturum sessiz şekilde yeniden açılmaz.



Sonuç

Başarılı.

\--------------------

**\*\*Test Senaryosu 4**: Yeniden Giriş

Adımlar

* Aynı kullanıcıyla yeniden giriş yap.



Beklenen Sonuç

* Daha önce oluşturulan odalar görünür.
* Mesaj geçmişi korunur.



Sonuç

Başarılı.

\--------------------

\*\***Test Senaryosu 5**: Gerçek Zamanlı Mesajlaşma

Adımlar

* Aynı odaya birden fazla kullanıcı bağlan.
* Kullanıcılardan biri mesaj göndersin.



Beklenen Sonuç

* Mesaj tüm kullanıcılara anlık olarak ulaşır.



Sonuç

Başarılı.



\--------------------



**\*\*Test Senaryosu 6**: Yazıyor Göstergesi

Adımlar

* Aynı anda birden fazla kullanıcı yazmaya başlasın.



Beklenen Sonuç

* Yazıyor göstergesi doğru kullanıcı adlarını ve sayısını gösterir.



Sonuç

Başarılı.



\--------------------

\*\***Test Senaryosu 7**: Çevrimiçi Durumu (Presence)

Adımlar

* Kullanıcıların giriş ve çıkış yapmasını simüle et.



Beklenen Sonuç

* Çevrimiçi göstergeleri tüm kullanıcılar için doğru görünür.



Sonuç

Başarılı.



\--------------------

\*\***Test Senaryosu 8**: DM ve Grup Odası İzolasyonu

Adımlar

* Özel mesaj (DM) başlat.
* Grup odalarında mesaj alışverişi yap.



Beklenen Sonuç

* DM mesajları yalnızca ilgili kullanıcılar tarafından görülür.
* Grup odalarına mesaj sızıntısı olmaz.



Sonuç

Başarılı.

\--------------------



*\*Yeniden Bağlanma ve Ağ Senaryoları\**



**\*\*Test Senaryosu 9**: Sunucu Yeniden Başlatma

Adımlar

* Sunucuyu yeniden başlat.
* Bağlı istemcinin davranışını gözlemle.



Beklenen Sonuç

* İstemci otomatik olarak yeniden bağlanır.
* Aktif oda yeniden katılım işlemi gerçekleştirir.



Sonuç

Başarılı.

\--------------------



\*\* **Test Senaryosu 10**: Bağlantı Kopması

Adımlar

* Ağ bağlantısını geçici olarak kes.
* Bağlantıyı tekrar sağla.



Beklenen Sonuç

* Bağlantı kesildiğinde kırmızı uyarı bandı görünür.
* Yeniden bağlanınca uyarı kaybolur.



Sonuç

Başarılı.







\#########################################################

\## Hata Kayıtları



1\. ESLint Yanlış Dizinde Başlatıldı

Bulunduğu Gün: Day 1



Sorun: ESLint yapılandırması yanlış klasöre oluşturuldu.



Kök Neden:eslint --init komutu /server dizini yerine proje kök dizininde çalıştırıldı.



Çözüm: Kurulum sihirbazı /server klasörü içerisinde tekrar çalıştırıldı ve yapılandırma dosyası doğru konuma oluşturuldu.



Durum: ✅ Çözüldü



2\. Sunucu Çökmesi: EADDRINUSE

Bulunduğu Gün: Day 3



Sorun: Sunucu başlatılırken EADDRINUSE hatası alındı.



Kök Neden: Önceki geliştirme oturumlarından kalan Node.js süreçleri 5000 portunu kullanmaya devam ediyordu. Ayrıca farklı VS Code terminal sekmelerinde çalışan birden fazla nodemon örneği bulunuyordu.



Çözüm:netstat -ano | findstr :5000 ve taskkill komutlarıyla eski süreçler sonlandırıldı. Bundan sonra sunucuların Ctrl + C ile kapatılması standart hale getirildi.



Durum: ✅ Çözüldü





3\. Socket Kimlik Doğrulaması Başarısız: cookie.parse is not a function

Bulunduğu Gün: Day 3



Sorun: Socket bağlantıları sırasında kimlik doğrulama başarısız oluyordu.



Kök Neden: Projede farklı sürümlere sahip birden fazla cookie paketi bulunuyordu (üst seviyede 2.0.1, alt bağımlılıklarda 0.7.2). Bu durum export yapısında çakışmaya neden oldu.



Çözüm:cookie paketine bağımlılık kaldırıldı ve socket handshake işlemleri için özel bir cookie ayrıştırma fonksiyonu yazıldı.



Durum: ✅ Çözüldü





4\. Odaya Katılınca Mesaj Geçmişi Yüklenmiyor

Bulunduğu Gün: Day 7



Sorun: Kullanıcı odaya katıldığında geçmiş mesajlar görüntülenmiyordu.



Kök Neden:handleJoin içerisinde kullanılan fetchRoomMessages fonksiyonu Rooms.jsx dosyasına import edilmemişti.



Çözüm: Eksik import satırı ../api/messages üzerinden eklendi.



Durum: ✅ Çözüldü



5\. Kullanıcının Kendi Çevrimiçi Durumu Yanlış Görünüyor

Bulunduğu Gün: Day 11



Sorun: Kullanıcı bazen kendi çevrimiçi durumunu göremiyordu.



Kök Neden:presence:online olayı socket.broadcast.emit ile gönderiliyordu ve bu yöntem gönderen istemciyi hariç tutuyordu. İlk durum yüklemesiyle yaşanan zamanlama yarışı nedeniyle kullanıcının ID'si çevrimiçi listesine eklenmeyebiliyordu.



Çözüm: İstemci, bağlantı kurulduğunda kendi kullanıcı ID'sini çevrimiçi listeye doğrudan ekleyecek şekilde güncellendi.



Durum: ✅ Çözüldü



\*\*\*\*\*\*\*\*\*\*



6\. Yazıyor Göstergesi Bağlantı Koptuktan Sonra Kaybolmuyor

Bulunduğu Gün: Day 11



Sorun: Kullanıcı sekmeyi kapattığında yazıyor göstergesi diğer kullanıcılar için kalıcı olarak görünüyordu.



Kök Neden: Sekme kapanırken typing:stop olayı gönderilmiyordu.



Çözüm: Sunucu tarafında her socket'in son yazdığı oda takip edilmeye başlandı ve bağlantı kesildiğinde ilgili odaya otomatik typing:stop olayı gönderildi.



Durum: ✅ Çözüldü



\*\*\*\*\*\*\*\*\*\*



7\. Day 12 Tasarım Refaktörü Sonrası Beyaz/Siyah Boş Sayfa

Bulunduğu Gün: Day 12



Sorun: Uygulama açıldığında tamamen boş ekran görüntüleniyordu.



Kök Nedenler:



JSX içinde kullanılan logout fonksiyonu useAuth() içerisinden alınmamıştı.

Rooms bileşeninin prop yapısı güncellenmemişti.

App.jsx ve Rooms.jsx arasında prop uyumsuzluğu oluşmuştu.

Çözüm:



Eksik destructuring düzeltildi.

Rooms bileşeninin parametreleri güncellendi.

user, logout ve connected değerleri merkezi olarak App.jsx üzerinden geçirildi.

Tekrarlanan useAuth() çağrısı ve header kodu kaldırıldı.

Durum: ✅ Çözüldü



\*\*\*\*\*\*\*



8\. Uzun Oda İsmi Yatay Kaydırma Oluşturuyor

Bulunduğu Gün: Day 12



Sorun: Çok uzun oda isimleri sidebar'da yatay kaydırma çubuğu oluşturuyordu.



Kök Neden: Uzun ve boşluksuz metinler için kırpma veya taşma kuralları tanımlanmamıştı.



Çözüm: Aşağıdaki CSS kuralları eklendi:



overflow: hidden;

text-overflow: ellipsis;

Durum: ✅ Çözüldü



\*\*\*\*\*\*\*



9\. Kullanıcının Kendi Mesajları Karşı Tarafın Mesajı Gibi Görünüyor

Bulunduğu Gün: Day 13



Sorun: Mesaj balonlarının rengi ve konumu hatalı görüntüleniyordu.



Kök Neden:/api/auth/me endpoint'i Mongoose dokümanını (user.\_id) döndürürken login/register endpointleri normalize edilmiş { id, username, email } yapısını döndürüyordu.



Sayfa yenilendiğinde user.id tanımsız kalıyor ve şu kontrol başarısız oluyordu:



msg.senderId === user.id

Çözüm:getMe endpoint'i login/register ile aynı normalize edilmiş kullanıcı formatını döndürecek şekilde güncellendi.



Durum: ✅ Çözüldü



\*\*\*\*\*\*\*



10\. Uzun Mesajlar Sohbet Balonundan Taşıyor

Bulunduğu Gün: Day 14



Sorun: Tek parça uzun metinler sohbet balonunun genişliğini aşıyordu.



Kök Neden:.message-bubble için kelime kırma kuralı tanımlanmamıştı.



Çözüm: Uzun metinleri sarmak için uygun overflow-wrap kuralı eklendi.



Durum: ✅ Çözüldü





11\. Kısa Kelimeler Harf Harf Bölünmeye Başladı

Bulunduğu Gün: Day 14



Tür: Regresyon (#10 düzeltmesinden sonra)



Sorun: Normal uzunluktaki kelimeler satır içinde harf harf bölünüyordu.



Kök Neden:overflow-wrap: anywhere ile flex düzeninin birleşmesi, tarayıcının minimum genişliği yanlış hesaplamasına neden oldu.



Çözüm:



display: inline-block;

width: fit-content;

word-break: normal;

overflow-wrap: break-word;

Böylece:



Normal kelimeler tek satırda kaldı.

Sadece gerçekten çok uzun ve bölünemeyen metinler gerektiğinde satır kırdı.

Durum: ✅ Çözüldü





12\. Rate Limiter Sessizce Çalışmayı Durdurdu

Bulunduğu Gün: Day 16



Tür: Regresyon



Sorun: Mesaj gönderim limiti uygulanmıyordu.



Kök Neden: Okundu bilgisi (read receipts) eklenirken message:send işleyicisinden isRateLimited() kontrolü çıkarılmıştı.



Çözüm: Rate limit kontrolü tekrar handler'ın başlangıcına eklendi.



Durum: ✅ Çözüldü





13\. Kayıt İşlemi Her Zaman Hata Veriyor

Bulunduğu Gün: Day 17



Sorun: Kayıt formu gönderildiğinde ağ isteği bile oluşmadan hata alınıyordu.



Kök Nedenler:



Yanlış fonksiyon adı:

const { Register } = useAuth();

Context yalnızca register fonksiyonunu sağlıyordu.



Parametre sırası hatalıydı:

Register(email, password, username)

Beklenen kullanım:



register(username, email, password)

submitting state'i tanımlanmış ancak işlem sırasında hiçbir zaman true yapılmıyordu.

Çözüm:



Fonksiyon adı düzeltildi.

Parametre sırası düzeltildi.

Submit durumu yönetimi güncellendi.

Durum: ✅ Çözüldü





14\. İkinci Oda Oluşturulurken 500 Internal Server Error

Bulunduğu Gün: Day 17



Sorun: İlk oda oluşturulduktan sonra ikinci oda oluşturulurken sunucu hatası alınıyordu.



Kök Neden:Room modelindeki alan:



dmKey: {

&#x20; default: null,

&#x20; unique: true,

&#x20; sparse: true

}

sparse indeks yalnızca alanın hiç bulunmadığı kayıtları hariç tutar. Ancak default: null kullanımı nedeniyle tüm normal odalarda dmKey: null oluşuyor ve ikinci kayıt eklenirken MongoDB:



E11000 duplicate key error

hatası veriyordu.



Çözüm:default: null kaldırıldı. Böylece normal odalarda alan tamamen undefined kaldı ve sparse indeks doğru çalıştı.



Ek olarak MongoDB Atlas üzerinde mevcut dmKey: null kayıtları için tek seferlik bir veri temizliği gerçekleştirildi.



Durum: ✅ Çözüldü











