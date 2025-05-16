# E-Ticaret Uygulaması

![Uploading image.png…]()


Bu proje, Node.js ve Express.js kullanılarak geliştirilmiş, MySQL veritabanına dayanan tam işlevsel bir e-ticaret platformudur.

## Proje Genel Bakış

Bu uygulama, kullanıcıların ürünleri kategorilere göre görüntüleyebileceği, arama yapabileceği, sepete ürün ekleyebileceği ve siparişlerini yönetebileceği kapsamlı bir e-ticaret çözümüdür.

## Teknoloji Yığını

- **Backend**: Node.js, Express.js
- **Veritabanı**: MySQL
- **Template Engine**: EJS
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Kimlik Doğrulama**: Express-session ve Cookie-Parser
- **Diğer Araçlar**: Dotenv (çevre değişkenleri için)

## Proje Yapısı

```
/ecommercev2/
├── public/              # Statik dosyalar (CSS, JS, resimler)
├── src/                 # Kaynak kodlar
│   ├── config/          # Yapılandırma dosyaları
│   ├── controllers/     # Uygulama mantığı
│   ├── middleware/      # Express middleware'leri
│   ├── models/          # Veri erişim katmanı
│   ├── routes/          # Rota tanımlamaları
│   ├── views/           # EJS şablonları
│   │   ├── partials/    # Yeniden kullanılabilir şablon parçaları
│   │   ├── products/    # Ürün ilgili şablonlar
│   │   └── ...          # Diğer sayfalar
│   ├── app.js           # Ana Express uygulaması
│   └── ...
└── setup_database.sql   # Veritabanı kurulum betiği
```

## Veritabanı Yapısı

Uygulamanın veritabanı yapısı aşağıdaki temel tablolardan oluşmaktadır:

- **Users**: Kullanıcı bilgileri (kimlik bilgileri, iletişim bilgileri)
- **Products**: Ürün bilgileri (isim, açıklama, fiyat, stok durumu)
- **Categories**: Ürün kategorileri
- **ProductCategories**: Ürün-kategori ilişkileri (çoka-çok ilişki)
- **Orders**: Siparişler (toplam tutar, sipariş durumu)
- **OrderDetails**: Sipariş kalemleri (hangi ürünün kaç adet alındığı)
- **Reviews**: Ürün incelemeleri ve puanlandırmalar
- **ShoppingCart**: Kullanıcı alışveriş sepetleri
- **CartItems**: Sepetteki ürünler
- **Payments**: Ödeme bilgileri
- **Shippings**: Kargo bilgileri
- **Admins**: Yönetici kullanıcılar
- **Wishlist**: Kullanıcı istek listeleri
- **Coupons**: İndirim kuponları

## Ana Özellikler

### Kullanıcı Yönetimi
- Kayıt ve giriş sistemi
- Kullanıcı profil yönetimi
- Oturum yönetimi (express-session kullanılarak)

### Ürün Kataloğu
- Ürünleri kategorilere göre listeleme
- Ürün arama
- Ürün detayları görüntüleme
- Fiyata göre filtreleme ve sıralama
- Ürün değerlendirme ve puanlama

### Sepet ve Sipariş İşlemleri
- Sepete ürün ekleme
- Sepet içeriğini görüntüleme ve düzenleme
- Sipariş oluşturma ve ödeme
- Sipariş takibi ve geçmişi

### Kategori Yönetimi
- Kategorilere göre ürün listeleme
- Kategori navigasyonu
- Alt kategoriler

## Uygulama Akışı

1. **Ana Sayfa**: En son eklenen ürünler ve popüler ürünler gösterilir
2. **Ürün Listeleme**: Tüm ürünler veya kategoriye göre filtrelenmiş ürünler
3. **Ürün Detayları**: Seçilen ürünün detaylı bilgileri ve satın alma seçenekleri
4. **Sepet**: Kullanıcının sepetindeki ürünlerin yönetimi
5. **Sipariş**: Sipariş oluşturma ve onaylama süreci
6. **Kullanıcı Profili**: Kullanıcı bilgileri ve sipariş geçmişi

## API Rotaları

### Kullanıcı Rotaları
- `GET /users/login`: Giriş sayfası
- `POST /users/login`: Giriş işlemi
- `GET /users/register`: Kayıt sayfası
- `POST /users/register`: Kayıt işlemi
- `GET /users/logout`: Çıkış işlemi
- `GET /users/profile`: Kullanıcı profili

### Ürün Rotaları
- `GET /products`: Tüm ürünleri listele
- `GET /products/:id`: Belirli bir ürünün detayları
- `GET /products/category/:id`: Kategoriye göre ürünleri göster

### Sipariş Rotaları
- `GET /orders`: Kullanıcının siparişlerini görüntüle
- `GET /orders/:id`: Sipariş detaylarını görüntüle
- `POST /orders/create`: Yeni sipariş oluştur

### İndeks Rotaları
- `GET /`: Ana sayfa
- `GET /search`: Ürün arama
- `GET /about`: Hakkında sayfası
- `GET /contact`: İletişim sayfası
- `POST /contact`: İletişim formu gönderimi

## Kurulum ve Çalıştırma

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullanici/ecommercev2.git
cd ecommercev2
```

2. MySQL veritabanını oluşturun:
```bash
mysql -u root -p < setup_database.sql
```

3. Gerekli paketleri yükleyin:
```bash
cd src
npm install
```

4. Çevre değişkenlerini yapılandırın:
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli değişkenleri ayarlayın
```

5. Uygulamayı çalıştırın:
```bash
node app.js
```

## Çevre Değişkenleri

`.env` dosyasında aşağıdaki değişkenleri yapılandırmanız gerekir:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=şifre
DB_NAME=EcommerceDB
PORT=3000
SESSION_SECRET=gizli_anahtar
```

## Sorun Giderme

- **Session Hataları**: `app.js` dosyasındaki session yapılandırmasını kontrol edin
- **Veritabanı Bağlantı Hataları**: `database.js` yapılandırmasını ve MySQL sunucusunun çalıştığından emin olun
- **Template Hataları**: Değişkenlerin doğru şekilde geçirildiğinden emin olun (özellikle `currentCategory` gibi)

## İleriki Geliştirmeler

- **Admin Paneli**: Ürün ve kategori yönetimi için admin arayüzü
- **Ödeme Entegrasyonu**: Çeşitli ödeme yöntemleri
- **Gelişmiş Arama**: Filtreleme ve sıralama özellikleri
- **Responsive Tasarım**: Mobil cihazlar için optimize edilmiş arayüz
- **Performans Optimizasyonu**: Daha verimli veritabanı sorguları ve önbellek kullanımı
- **Ürün Görüntüleri**: Ürün için birden fazla görüntü desteği
- **İndirim Kuponları**: İndirim kuponu sistemi

## Güvenlik Önlemleri

- Kullanıcı şifreleri bcrypt ile hash'lenerek saklanmaktadır
- SQL enjeksiyon saldırılarına karşı prepared statement'lar kullanılmaktadır
- Session hijacking'e karşı çerezler güvenli şekilde yapılandırılmıştır
- CSRF saldırılarına karşı önlemler alınmıştır

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Sorularınız veya önerileriniz için [email@example.com](mailto:email@example.com) adresine e-posta gönderebilirsiniz.
# ECommerceApp
# EcommerceAppNodejs
