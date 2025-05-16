// src/controllers/user.controller.js
const User = require('../models/user.model');

// Kullanıcı kaydı
exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Basit doğrulama
        if (!username || !email || !password) {
            return res.render('register', {
                error: 'Tüm alanlar doldurulmalıdır',
                values: { username, email }
            });
        }

        if (password !== confirmPassword) {
            return res.render('register', {
                error: 'Şifreler eşleşmiyor',
                values: { username, email }
            });
        }

        // Email zaten kayıtlı mı kontrol et
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render('register', {
                error: 'Bu email adresi zaten kullanılıyor',
                values: { username, email }
            });
        }

        // Yeni kullanıcı oluştur
        await User.create({ username, email, password });

        // Kayıt başarılı, giriş sayfasına yönlendir
        res.redirect('/users/login?success=true');
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.render('register', {
            error: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.',
            values: { username: req.body.username, email: req.body.email }
        });
    }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basit doğrulama
        if (!email || !password) {
            return res.render('login', {
                error: 'Email ve şifre gereklidir',
                values: { email }
            });
        }

        // Kullanıcıyı doğrula
        const user = await User.authenticate(email, password);
        if (!user) {
            return res.render('login', {
                error: 'Geçersiz email veya şifre',
                values: { email }
            });
        }

        // Kullanıcı bilgilerini session'a kaydet
        req.session.user = {
            id: user.UserID,
            username: user.UserName,
            email: user.Email
        };

        // Ana sayfaya yönlendir
        res.redirect('/');
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.render('login', {
            error: 'Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.',
            values: { email: req.body.email }
        });
    }
};

// Kullanıcı çıkışı
exports.logout = (req, res) => {
    // Oturumu sonlandır
    req.session.destroy((err) => {
        if (err) {
            console.error('Oturum kapatma hatası:', err);
        }
        res.redirect('/');
    });
};

// Kullanıcı profil sayfası
exports.profile = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Kullanıcı bilgilerini getir
        const user = await User.findById(userId);
        if (!user) {
            return res.redirect('/users/login');
        }

        res.render('profile', { user });
    } catch (error) {
        console.error('Profil hatası:', error);
        res.redirect('/');
    }
};

// Kullanıcı bilgilerini güncelleme
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { username, email } = req.body;

        // Kullanıcı bilgilerini güncelle
        const success = await User.update(userId, { username, email });

        if (success) {
            // Session bilgilerini de güncelle
            req.session.user.username = username;
            req.session.user.email = email;

            res.render('profile', {
                user: { UserID: userId, UserName: username, Email: email },
                success: 'Profil bilgileriniz güncellendi!'
            });
        } else {
            res.render('profile', {
                user: { UserID: userId, UserName: username, Email: email },
                error: 'Profil güncellenirken bir hata oluştu.'
            });
        }
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.render('profile', {
            user: {
                UserID: req.session.user.id,
                UserName: req.session.user.username,
                Email: req.session.user.email
            },
            error: 'Profil güncellenirken bir hata oluştu.'
        });
    }
};
