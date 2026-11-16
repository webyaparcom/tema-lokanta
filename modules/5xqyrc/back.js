/* iletisim-kartlari-3 — İletişim Bilgi Paneli (1 Kas 2026, T1-B varyant).
   Yer tutucular: ik3title ik3desc ik3saat ik3liste. phone/email boşsa webmakerdata.setting; saatler = desing.saatler[] = [{gun{tr,en,ar}, saat}].
   Ortak yardımcılar: esc t guvenliHref gorselYol evet sayi metinleriYaz (desing metinleri kaçışlı). */
var D = json.desing || {};
var L = json.lang || "tr";

/* HTML kaçışı — html'e giden her değer bundan geçer */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
/* Dil seçimi: aktif dil → tr → en → ilk anahtar (motorun wmPickLang'i) */
function t(v) { return wmPickLang(v, L); }
/* Bağlantı: dış/mailto/tel/# aynen; iç sayfa adı → dil önekli yol; javascript: vb. reddedilir */
function guvenliHref(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s) || s.charAt(0) === "/") { return s; }
  return wxLangInternalHref(s);
}
/* Görsel yolu: "/" ve http(s) aynen; yalın ad → /img/<ad>; tehlikeli şema → "" */
function gorselYol(v) {
  var s = String(v == null ? "" : v).trim();
  if (!s) { return ""; }
  if (/^\s*(javascript|vbscript|file|data):/i.test(s)) { return ""; }
  if (s.charAt(0) === "/" || /^https?:\/\//i.test(s)) { return s; }
  return "/img/" + s;
}
function evet(v, d) {
  if (v === undefined || v === null || v === "") { return d; }
  return !(v === false || v === "false" || v === 0 || v === "0");
}
function sayi(v, d, mn, mx) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) { n = d; }
  return Math.min(mx, Math.max(mn, n));
}
/* desing'deki düz metin / {tr,en,ar} değerlerini {{anahtar}} yerine KAÇIŞLI yazar.
   Motor aynı yer tutucuyu ham yazardı; back.js önce davrandığı için kaçışsız değer html'e ulaşmaz. */
function metinleriYaz() {
  var k;
  for (k in D) {
    if (!Object.prototype.hasOwnProperty.call(D, k)) { continue; }
    var v = D[k];
    if (v == null) { continue; }
    var dilli = typeof v === "object" && !Array.isArray(v) && (typeof v.tr === "string" || typeof v.en === "string");
    if (typeof v === "object" && !dilli) { continue; }
    var deger = esc(t(v));
    var desen = new RegExp("\\{\\{" + String(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\}\\}", "g");
    html = html.replace(desen, function () { return deger; });
  }
}

var ik3Set = (webmakerdata && webmakerdata.setting) || {};
var ik3Phone = t(D.phone).trim() || (typeof ik3Set.phone === "string" ? ik3Set.phone.trim() : "");
var ik3Email = t(D.email).trim() || (typeof ik3Set.email === "string" ? ik3Set.email.trim() : "");
var ik3Wa = String(D.whatsapp || "").replace(/\D/g, "");
var ik3Adres = t(D.address).trim();
var ik3Maps = guvenliHref(D.mapsUrl);
if (!ik3Maps && ik3Adres) { ik3Maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ik3Adres); }
var ik3Yeni = t(D.newTab);
var ik3Kopya = t(D.copyLabel);

/* satır: etiket, değer, ltr?, eylem bağlantısı, eylem metni, dış?, ikon */
function ik3Satir(ikon, etiket, deger, ltr, href, eylem, dis) {
  return '<div class="modulex-ik3-satir">' +
    '<dt class="modulex-ik3-dt"><span class="material-symbols-outlined" aria-hidden="true">' + ikon + "</span>" + esc(etiket) + "</dt>" +
    '<dd class="modulex-ik3-dd"><span class="modulex-ik3-deger"' + (ltr ? ' dir="ltr"' : "") + ">" + esc(deger) + "</span>" +
    '<span class="modulex-ik3-eylemler">' +
    (href ? '<a class="modulex-ik3-eylem" href="' + esc(href) + '"' + (dis ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + esc(eylem) +
      (dis ? '<span class="modulex-ik3-sr"> (' + esc(ik3Yeni) + ")</span>" : "") + "</a>" : "") +
    (ik3Kopya ? '<button type="button" class="modulex-ik3-kopya" data-ik3-kopya="' + esc(deger) + '" aria-label="' + esc(ik3Kopya + ": " + etiket) + '" hidden>' +
      '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span></button>' : "") +
    "</span></dd></div>";
}

var ik3Rows = "";
if (ik3Phone) { ik3Rows += ik3Satir("call", t(D.phoneLabel), ik3Phone, true, "tel:" + ik3Phone.replace(/[^+\d]/g, ""), t(D.callAction), false); }
if (ik3Wa) { ik3Rows += ik3Satir("chat", t(D.waLabel), "+" + ik3Wa, true, "https://wa.me/" + ik3Wa, t(D.waAction), true); }
if (ik3Email) { ik3Rows += ik3Satir("mail", t(D.mailLabel), ik3Email, true, "mailto:" + ik3Email, t(D.mailAction), false); }
if (ik3Adres) { ik3Rows += ik3Satir("location_on", t(D.addressLabel), ik3Adres, false, ik3Maps, t(D.mapAction), true); }

var ik3Saatler = Array.isArray(D.saatler) ? D.saatler : [];
var ik3Tablo = "";
var ik3i;
for (ik3i = 0; ik3i < ik3Saatler.length; ik3i++) {
  var s = ik3Saatler[ik3i] || {};
  var gun = t(s.gun);
  var saat = t(s.saat);
  if (gun || saat) { ik3Tablo += '<tr><th scope="row">' + esc(gun) + '</th><td dir="ltr">' + esc(saat) + "</td></tr>"; }
}
if (ik3Tablo) {
  ik3Tablo = '<div class="modulex-ik3-saat"><h3 class="modulex-ik3-saath">' + esc(t(D.hoursTitle)) + "</h3>" +
    '<table class="modulex-ik3-tablo"><tbody>' + ik3Tablo + "</tbody></table></div>";
}

var ik3Liste = ik3Rows ? '<dl class="modulex-ik3-dl">' + ik3Rows + "</dl>" : '<p class="modulex-ik3-bos">' + esc(t(D.emptyText)) + "</p>";

html = html.replace(/\{\{ik3title\}\}/g, function () { return t(D.title) ? '<h2 class="modulex-ik3-title">' + esc(t(D.title)) + "</h2>" : ""; });
html = html.replace(/\{\{ik3desc\}\}/g, function () { return t(D.description) ? '<p class="modulex-ik3-desc">' + esc(t(D.description)) + "</p>" : ""; });
html = html.replace(/\{\{ik3saat\}\}/g, function () { return ik3Tablo; });
html = html.replace(/\{\{ik3liste\}\}/g, function () { return ik3Liste; });
metinleriYaz();
