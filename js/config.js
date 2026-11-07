/* ==========================================================================
 * TaqwaLife - Konfigurasi Firebase
 * Berisi kunci/konfigurasi Firebase dan inisialisasi layanan (Auth, Firestore, Messaging).
 * Jika Firebase tidak termuat, aplikasi otomatis berjalan dalam mode lokal.
 * ========================================================================== */

// Konfigurasi proyek Firebase (kunci ini memang publik; keamanan data diatur lewat Firestore Rules).
const FB = {
    apiKey: "AIzaSyCsKwj3TSQzuBGmB4Y__T8L8C1Ga9rFlZs",
    authDomain: "taqwalife-a50d4.firebaseapp.com",
    projectId: "taqwalife-a50d4",
    messagingSenderId: "181591738096",
    appId: "1:181591738096:web:6ec6bde49cb166c81ca435"
};
// Kunci publik Web Push (Firebase Console > Project settings > Cloud Messaging).
const VAPID = "BAzmmmBcSR_d0BFYImv0_QDdGNCvywryi2VGGHUpMOMn1aO79QDT84LB4esS1zqz4laVDifmEwlTS5xHR4UOfK8"; /* Kunci web push: Firebase Console > Project settings > Cloud Messaging > Web Push certificates */
// true bila Firebase sudah dikonfigurasi dan library-nya berhasil dimuat.
const CFG = typeof firebase !== 'undefined' && FB.apiKey !== "ISI_API_KEY";
// Objek layanan login Firebase (null = mode lokal).
let auth = null, db = null, msg = null;
if (CFG) {
    firebase.initializeApp(FB);
    auth = firebase.auth();
    db = firebase.firestore();
    try {
        if (firebase.messaging.isSupported())
            msg = firebase.messaging();
    } catch (e) {
    }
}
