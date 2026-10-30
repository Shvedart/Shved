'use strict';

/* ============================== иконки ============================== */

const ICONS = {
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none"><path d="M21.428 7.463C22.581 10.019 21.953 13.04 19.883 14.904L12.01 21.992V22L12.006 21.996L12 22V21.992L4.12 14.903C2.047 13.04 1.419 10.018 2.57 7.461C4.239 3.761 8.979 2.843 11.869 5.608C11.913 5.65 11.956 5.692 11.999 5.736C12.042 5.692 12.085 5.65 12.129 5.608C15.019 2.844 19.76 3.762 21.428 7.463Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  heartFilled: `<svg viewBox="0 0 24 24"><path d="M21.428 7.463C22.581 10.019 21.953 13.04 19.883 14.904L12.01 21.992V22L12.006 21.996L12 22V21.992L4.12 14.903C2.047 13.04 1.419 10.018 2.57 7.461C4.239 3.761 8.979 2.843 11.869 5.608C11.913 5.65 11.956 5.692 11.999 5.736C12.042 5.692 12.085 5.65 12.129 5.608C15.019 2.844 19.76 3.762 21.428 7.463Z" fill="currentColor"/></svg>`,
  crown: `<svg viewBox="0 0 16 16" fill="#333"><path d="M8.00065 2.0013L12.6012 12.668C12.3643 12.8753 12.0553 12.998 11.7233 12.998H8.00065H4.27669C3.67202 12.9979 3.14325 12.591 2.98828 12.0065L1 4.50781L5.71224 7.29753L5.7155 7.29883L7.99935 2.0013L8 2L8.00065 2.0013Z"/><path d="M13.0117 12.0065C12.9418 12.2702 12.795 12.4969 12.6003 12.6673L10.2852 7.29818L15 4.50781L13.0117 12.0065Z"/></svg>`,
  check: `<svg class="check" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3a5 5 0 0 0-5 5v3.2c0 .6-.2 1.1-.6 1.6L5 15h14l-1.4-2.2a2.6 2.6 0 0 1-.6-1.6V8a5 5 0 0 0-5-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.5 18a2.6 2.6 0 0 0 5 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  coin: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#333" opacity="0.12"/><path d="M12 6.5v11M9 9.2c0-1 1.1-1.8 3-1.8s3 .8 3 1.8c0 2.4-6 1.2-6 3.7 0 1 1.1 1.9 3 1.9s3-.8 3-1.9" stroke="#333" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  percent: `<svg viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="2.6" stroke="#333" stroke-width="2"/><circle cx="17" cy="17" r="2.6" stroke="#333" stroke-width="2"/><path d="M18 6L6 18" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>`,
  bigCheck: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* ============================== данные ============================== */

const UNTIL_TEXT = 'На покупки онлайн до 6 ноября';

const CATEGORIES = [
  {
    id: 'food', label: 'Еда', type: 'list', nextLabel: 'Одежда',
    items: [
      { id: 'food-gotovaya-eda-v-samokate-v-gorode-20', percent: '20%', name: 'Готовая еда в Самокате в Городе', icon: 'https://ms-static-images.t-static.ru/partner-5405-image280-79f9494b.png', until: 'На одну покупку онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-c14c0afb0c654eb286e0b16e531ab025.png', description: 'Доставка из магазинов' },
      { id: 'food-lenta-dostavka-do-35', percent: 'до 35%', name: 'Лента Доставка', icon: 'https://ms-static-images.t-static.ru/partner-9663-image280-39f63a9e.png', until: 'На одну покупку онлайн от 1 500 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-41357af878564e0fa4cecd60021d94c8.png', description: 'Сервис доставки продуктов' },
      { id: 'food-yandeks-lavka-12', percent: '12%', name: 'Яндекс Лавка', icon: 'https://ms-static-images.t-static.ru/partner-11589-image280-26eb9606.png', until: 'На одну покупку онлайн от 1 000 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-d09ad658d287407c95154cb949ecd93a.png', description: 'Онлайн-магазин с доставкой' },
      { id: 'food-vkusvill-300', percent: '300 ₽', name: 'ВкусВилл', icon: 'https://ms-static-images.t-static.ru/partner-5613-image280-ef90c02e.png', until: 'На одну покупку онлайн от 1 500 ₽', offerType: 'скидка', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-f8aee6e9a15b455ba6a2b6f734b52e02.png', description: 'Скидка по промокоду на доставку продуктов для здорового питания' },
      { id: 'food-pyaterochka-dostavka-do-53', percent: 'до 53%', name: 'Пятёрочка Доставка', icon: 'https://ms-static-images.t-static.ru/partner-15121-image280-43810688.png', until: 'На одну покупку онлайн от 800 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-d9b15e9bac7b456e89a2da48c1ab267b.png', description: 'Сервис доставки продуктов из магазинов' },
      { id: 'food-perekrestok-do-80', percent: 'до 80%', name: 'Перекрёсток', icon: 'https://ms-static-images.t-static.ru/partner-5897-image280-23b389f7.png', until: 'На одну покупку онлайн от 1 000 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-3d492417e0bf41f2926068def7059fa0.png', description: 'Доставка из Перекрёстка от 30 минут' },
      { id: 'food-magnit-dostavka-do-32', percent: 'до 32%', name: 'Магнит Доставка', icon: 'https://ms-static-images.t-static.ru/partner-14857-image280-2dce523a.png', until: 'На одну покупку онлайн от 1 000 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-8d317687aa1240c8ba0199c73b659f7b.png', description: 'Сервис доставки продуктов' },
      { id: 'food-metro-online-15', percent: '15%', name: 'METRO Online', icon: 'https://ms-static-images.t-static.ru/partner-14563-image280-4f043d05.png', until: 'На одну покупку онлайн от 5 000 ₽', offerType: 'скидка', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-c4104459ae1e462f967ac8d742e8bebd.png', description: 'Гипермаркеты с доставкой' },
      { id: 'food-kuper-400', percent: '400 ₽', name: 'Купер', icon: 'https://ms-static-images.t-static.ru/partner-7494-image280-cece06bc.png', until: 'На одну покупку онлайн от 1 000 ₽', offerType: 'скидка', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-61ea279fdee54231817679749187e7c3.png', description: 'Сервис доставки из магазинов и ресторанов' },
      { id: 'food-ashan-do-20', percent: 'до 20%', name: 'Ашан', icon: 'https://ms-static-images.t-static.ru/merchant-image280-merchant_4833.png', until: 'На одну покупку онлайн от 3 000 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-32a24d7af820408f9d3083ee61423ac9.png', description: 'Доставка продуктов из Ашан' },
      { id: 'food-drip-pakety-tasty-coffee-5', percent: '5%', name: 'Дрип-пакеты Tasty Coffee', icon: 'https://ms-static-images.t-static.ru/partner-image280-36ce1818769a4b7f96b5d50821836ddd.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-fb764b902e75403ea2b13667f3bf29ec.png', description: 'Кофе' },
      { id: 'food-gotovaya-eda-v-pyaterochke-v-gorode-20', percent: '20%', name: 'Готовая еда в Пятёрочке в Городе', icon: 'https://ms-static-images.t-static.ru/partner-image280-9cd642ac2f2e4e7d93a08ea37be93e71.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-2e34bdaa6eca483c8c0dfd0a913303c7.png', description: 'Готовая еда' },
      { id: 'food-gotovaya-eda-v-perekrestke-v-gorode-30', percent: '30%', name: 'Готовая еда в Перекрёстке в Городе', icon: 'https://ms-static-images.t-static.ru/partner-image280-744412472715474b90f57e7a0ca3b7c9.png', until: 'На одну покупку онлайн', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-8645d9d4352b43bebd40c3acd4b22775.png', description: 'Готовая еда' },
      { id: 'food-vkusvill-v-gorode-18', percent: '18%', name: 'ВкусВилл в Городе', icon: 'https://ms-static-images.t-static.ru/partner-image280-c3376a9fb2714e938307c0eec2eaed60.png', until: 'На одну покупку от 1 500 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-9705677e07974cf7b34856e8a2a5d7ee.png', description: 'Магазины продуктов для здорового питания' },
      { id: 'food-tovary-magnit-v-gorode-10', percent: '10%', name: 'Товары «Магнит» в Городе', icon: 'https://ms-static-images.t-static.ru/partner-image280-b8afbd1205c54befa16542aebe460e0b.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-16a3bcd7323847e2a412434d90ae4b10.png', description: 'Продукты' },
    ],
  },
  {
    id: 'clothes', label: 'Одежда', type: 'list', nextLabel: 'Электроника',
    items: [
      { id: 'clothes-lamoda-20', percent: '20%', name: 'Lamoda', icon: 'https://ms-static-images.t-static.ru/partner-image280-03d259e7907440edb337f76a0a164016.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-b9c0cbe3077c4c66bfc0fd617f413af8.png', description: 'Маркетплейс одежды, обуви, товаров для дома и красоты' },
      { id: 'clothes-no-one-15', percent: '15%', name: 'NO ONE', icon: 'https://ms-static-images.t-static.ru/merchant-image280-merchant_4493.png', until: 'На одну покупку онлайн', offerType: 'скидка', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-c9d5b03bd30447248d5e3dea63e51281.png', description: 'Одежда, обувь и аксессуары' },
      { id: 'clothes-detskiy-mir-7', percent: '7%', name: 'Детский мир', icon: 'https://ms-static-images.t-static.ru/partner-10903-image280-883ef19b.png', until: 'На одну покупку онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-37c36c1e2d4a4378a89943b4cc9a8001.png', description: 'Товары для детей' },
      { id: 'clothes-sportmaster-10', percent: '10%', name: 'Спортмастер', icon: 'https://ms-static-images.t-static.ru/partner-10172-image280-9cdc1142.png', until: 'На одну покупку', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-62b5b70dfc924bbd91a06cf43d8505e4.png', description: 'Спортивные товары' },
      { id: 'clothes-odezhda-i-obuv-v-shopinge-30', percent: '30%', name: 'Одежда и обувь в Шопинге', icon: 'https://ms-static-images.t-static.ru/partner-image280-3b7db1b4d2654c36a2ff4f3a0779bcee.png', until: 'На одну покупку', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-9181b071c3f64fa5a1c49396c126eef3.png', description: 'Одежда и обувь' },
      { id: 'clothes-t-bank-shop-3', percent: '3%', name: 'Т-Банк Шоп', icon: 'https://ms-static-images.t-static.ru/partner-image280-064bf70a1403445fa5d89eb64dee209a.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'До 31 января', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-017be060510d475ab20b590b9b206d9a.png', description: 'Онлайн-магазин одежды и аксессуаров от Т-Банка' },
      { id: 'clothes-gloria-jeans-10', percent: '10%', name: 'Gloria Jeans', icon: 'https://ms-static-images.t-static.ru/partner-15133-image280-d766bd3d.png', until: 'На одну покупку онлайн', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/offer-image1252-d8cdab0d35704e19808d848c32b1b821.png', description: 'Одежда, обувь и аксессуары' },
      { id: 'clothes-tom-tailor-10', percent: '10%', name: 'Tom Tailor', icon: 'https://ms-static-images.t-static.ru/partner-image280-66233bea6df34ce59735835d52a4081e.png', until: 'На покупки на кассе', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-22758b4180a14c33ae31dc4af4f288af.png', description: 'Мужская, женская и детская одежда' },
      { id: 'clothes-cave-15', percent: '15%', name: 'Cave', icon: 'https://ms-static-images.t-static.ru/partner-image280-1c1701d486d4491fa52af1202c753bb5.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'До 13 февраля', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-96a15b0750534725949aab59c53a48a8.png', description: 'Мужская одежда' },
      { id: 'clothes-playtoday-10', percent: '10%', name: 'PlayToday', icon: 'https://ms-static-images.t-static.ru/partner-image280-5b546f8dc5e44008b65c6278e4b423a2.png', until: 'На одну покупку онлайн от 3 000 ₽', offerType: 'скидка', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-92917f38f6d3471ea34622e6ce1e4628.png', description: 'Семейная одежда и обувь' },
      { id: 'clothes-km20-10', percent: '10%', name: 'KM20', icon: 'https://ms-static-images.t-static.ru/partner-image280-6cd1980954584a8896b1767ef44c7873.png', until: '', offerType: 'кэшбэк', expiration: 'До 10 июня', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/offer-image1252-2fc2d1e7902944dbbc0d67616fe4af09.png', description: 'Шопинг и рестораны' },
    ],
  },
  {
    id: 'electronics', label: 'Электроника', type: 'list', nextLabel: 'Товары с кешбэком',
    items: [
      { id: 'electronics-sitilink-5', percent: '5%', name: 'Ситилинк', icon: 'https://ms-static-images.t-static.ru/partner-5703-image280-992774a3.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-db5c248a22894688b05646133476b2a5.png', description: 'Магазин электроники и бытовой техники' },
      { id: 'electronics-m-video-v-shopinge-10', percent: '10%', name: 'М.Видео в Шопинге', icon: 'https://ms-static-images.t-static.ru/partner-image280-45f6829ab80b492dbde2751a7cfe140b.png', until: '', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-b788766712504276b0384c2899b2119d.png', description: 'Шопинг в Т-Банке' },
      { id: 'electronics-restore-3', percent: '3%', name: 'restore:', icon: 'https://ms-static-images.t-static.ru/partner-355-image280-acf03bad.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-7bea9204976b4fd29e4c3fa842720273.png', description: 'Магазин техники и электроники' },
      { id: 'electronics-megamarket-20', percent: '20%', name: 'Мегамаркет', icon: 'https://ms-static-images.t-static.ru/partner-image280-2fde6c084b244617b5ce3c2884adf716.png', until: 'На одну покупку онлайн', offerType: 'скидка', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-78c651c4abda413bbcf1a6a3d9779532.png', description: 'Маркетплейс' },
      { id: 'electronics-tehnika-i-elektronika-v-shopinge-20', percent: '20%', name: 'Техника и Электроника в Шопинге', icon: 'https://ms-static-images.t-static.ru/partner-image280-f65b9d3d6a07467bacb639d7aabc454f.png', until: 'На одну покупку', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-1cbe660bab4b480dbfd55cbd0ecae5c0.png', description: 'Бытовая техника' },
      { id: 'electronics-tefal-12', percent: '12%', name: 'Tefal', icon: 'https://ms-static-images.t-static.ru/partner-image280-3c1ab099aa444be1ae1b775ffe2bee27.png', until: 'На три покупки онлайн', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-e80a75085de640ad87f486727c08d7da.png', description: 'Бытовая техника и посуда' },
      { id: 'electronics-bilayn-5', percent: '5%', name: 'Билайн', icon: 'https://ms-static-images.t-static.ru/partner-image280-4e099d6ca45747c6bed5060c33578c9b.png', until: 'На две покупки онлайн от 1 000 ₽', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-2f0e1a0ff31e497c84ba5fec966331d9.png', description: 'Бытовая техника и электроника' },
      { id: 'electronics-galaxystore-5', percent: '5%', name: 'galaxystore', icon: 'https://ms-static-images.t-static.ru/partner-image280-14612c1ca39342038f1dd7af9010194e.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-68eb2e565f5342ffb6594b52fdf9a069.png', description: 'Электроника и техника' },
      { id: 'electronics-megafon-4', percent: '4%', name: 'МегаФон', icon: 'https://ms-static-images.t-static.ru/partner-4344-image280-d565bc34.png', until: 'На две покупки онлайн', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-57c8367fbf0b452d90cf5b7bad41d127.png', description: 'Интернет-магазин электроники' },
      { id: 'electronics-dl-audio-25', percent: '25%', name: 'DL Audio', icon: 'https://ms-static-images.t-static.ru/partner-image280-8009f43962d74ef79657baad35469fcb.png', until: 'На покупки от 500 ₽', offerType: 'кэшбэк', expiration: 'До 23 марта', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-e1cf09eba51444d18f5bc017fe4a5f1f.png', description: 'Аудиотехника и акустика' },
    ],
  },
  {
    id: 'goods', label: 'Товары с кешбэком', type: 'grid', nextLabel: null,
    items: [
      { id: 'product-blade-deep-chill-v-pyaterochke-50', percent: '50%', name: 'BLADE Deep Chill в Пятёрочке', icon: 'https://ms-static-images.t-static.ru/partner-13008-image280-b7b23f14.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-95aedc3620fe4a2e8377d3be3342c84b.png', until: '', offerType: 'кэшбэк', expiration: 'До 8 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-9f614a3d9f79467ea7b6d1bbb09adb42.png', description: 'Дезодоранты' },
      { id: 'product-haus-herz-v-fix-price-15', percent: '15%', name: 'Haus Herz в Fix Price', icon: 'https://ms-static-images.t-static.ru/partner-image280-5578570c05554d04937c3990ac10061b.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-015857387ae849f59baafcad0a3a5fdc.png', until: '', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-7d19f432f5a04afd843fbbc6302a17ed.png', description: 'Бытовая химия' },
      { id: 'product-gls-pharmaceuticals-15', percent: '15%', name: 'GLS Pharmaceuticals', icon: 'https://ms-static-images.t-static.ru/partner-image280-4423975b62344cba85ca00857f8e42b8.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-5a442e85f64f46399b77b3aa7b76baa4.png', until: '', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-f92de464e45f4b7899530b4e85351eff.png', description: 'БАДы' },
      { id: 'product-kuhonnaya-mashina-ot-kenwood-3-000', percent: '3 000 ₽', name: 'Кухонная машина от Kenwood', icon: 'https://ms-static-images.t-static.ru/partner-13739-image280-b5a6e767.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-4123eb315b974809b6c3c8be92af1650.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-5076162bee774f758aa2a4679a959bd5.png', description: 'Кухонные машины' },
      { id: 'product-tvorozhnye-syrki-savushkin-90', percent: '90%', name: 'Творожные сырки «Савушкин»', icon: 'https://ms-static-images.t-static.ru/partner-image280-88b662255662465aa75d4f7c6ed78c7b.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-5670dd774bef48829a1e3bcd5ce67955.png', until: '', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-d8d8074959c7491a8114b25698fb892a.png', description: 'Творожные сырки' },
      { id: 'product-kofemashiny-delonghi-5-000', percent: '5 000 ₽', name: 'Кофемашины Delonghi', icon: 'https://ms-static-images.t-static.ru/partner-13740-image280-438e7823.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-9b551778ec0c4d0884cbcadd778190d8.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-79ca04d1107c4b0b9f5b8b06e94e49dd.png', description: 'Кофемашины' },
      { id: 'product-kofe-v-drip-paketah-lebo-40', percent: '40%', name: 'Кофе в дрип-пакетах LEBO', icon: 'https://ms-static-images.t-static.ru/partner-image280-d11f68112eca411ebca2ad5a0f6b1bbf.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-109de695a9f447b2995d8d8faca4a9a2.png', until: '', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-f118cac8145b4cd3a0624fc2956e74b4.png', description: 'Кофе в дрип-пакетах' },
      { id: 'product-planto-banan-v-pyaterochke-40', percent: '40%', name: 'Planto «Банан» в Пятёрочке', icon: 'https://ms-static-images.t-static.ru/partner-image280-3e356b4eeae74e34946ac74fb4fde9d2.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-291ed1782ef94136b2fb4fc9d9f940b9.png', until: 'На одну покупку', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-31116500a7c94a7c95ee47a9d7df7c15.png', description: 'Растительные напитки' },
      { id: 'product-ararat-25', percent: '25%', name: 'Арарат', icon: 'https://ms-static-images.t-static.ru/partner-image280-77fd237f76094700af670a68f4ce8dc8.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-5da4427aaae84c849255315066047675.png', until: 'На покупки на кассе', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-690c840f3a664b1d94451bba70e4f946.png', description: 'Напитки' },
    ],
  },
];

const PICKER_MAX = 4;
const PICKER_CATEGORIES = [
  { name: 'Жд билеты', icon: 'assets/icons/picker/0.png', percent: 15 },
  { name: 'Аптеки', icon: 'assets/icons/picker/1.png', percent: 10 },
  { name: 'Ремонт и стройка', icon: 'assets/icons/picker/2.png', percent: 12 },
  { name: 'Ювелирные украшения', icon: 'assets/icons/picker/3.png', percent: 8 },
  { name: 'Шопинг', icon: 'assets/icons/picker/4.png', percent: 10 },
  { name: 'Путешествия', icon: 'assets/icons/picker/5.png', percent: 20 },
  { name: 'Общественный транспорт', icon: 'assets/icons/picker/6.png', percent: 15 },
  { name: 'АЗС и авто', icon: 'assets/icons/picker/7.png', percent: 10 },
  { name: 'Рестораны', icon: 'assets/icons/picker/8.png', percent: 12 },
  { name: 'Красота', icon: 'assets/icons/picker/9.png', percent: 15 },
  { name: 'Дом и мебель', icon: 'assets/icons/picker/10.png', percent: 10 },
  { name: 'Одежда и обувь', icon: 'assets/icons/picker/11.png', percent: 10 },
  { name: 'Продукты', icon: 'assets/icons/picker/12.png', percent: 5 },
  { name: 'Автосервис', icon: 'assets/icons/picker/13.png', percent: 10 },
  { name: 'Развлечения', icon: 'assets/icons/picker/14.png', percent: 20 },
  { name: 'Детские товары', icon: 'assets/icons/picker/15.png', percent: 15 },
];
const OCT_AVATARS = ['assets/icons/avatars/0.png', 'assets/icons/avatars/1.png', 'assets/icons/avatars/2.png', 'assets/icons/avatars/3.png'];

/* ============================== утилиты ============================== */

function haptic(pattern) {
  try { if ('vibrate' in navigator) navigator.vibrate(pattern); } catch (e) { /* no-op */ }
}

function esc(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function triggerAnim(el) {
  if (!el) return;
  el.classList.remove('anim-in');
  void el.offsetWidth;
  el.classList.add('anim-in');
}

/* ============================== состояние ============================== */

const state = {
  step: 0,
  likes: [new Set(), new Set(), new Set(), new Set()],
  novemberChosen: false,
};

let pickerSelected = new Set();
let cashbackRoot = null;
let navHeartOfferCtx = null;
let cashbackNavbarUpdate = null;

function resetState() {
  state.step = 0;
  state.likes = [new Set(), new Set(), new Set(), new Set()];
  state.novemberChosen = false;
}

function totalLikedCount() {
  return state.likes.reduce((a, s) => a + s.size, 0);
}

/* ============================== стек экранов (push/pop как в iOS) ============================== */

const stackEl = document.getElementById('stack');
const screens = [];

function syncGlobalNavbarVisibility() {
  const navbar = document.getElementById('globalNavbar');
  if (!navbar) return;
  const top = screens[screens.length - 1];
  const show = top && (top.el.classList.contains('screen-cashback') || top.el.classList.contains('screen-offer'));
  navbar.style.display = show ? '' : 'none';
}

function pushScreen(el) {
  const prev = screens[screens.length - 1];
  el.style.transition = 'none';
  el.style.transform = 'translateX(100%)';
  stackEl.appendChild(el);
  void el.offsetWidth;
  el.style.transition = '';
  if (prev) prev.el.classList.add('behind');

  requestAnimationFrame(() => {
    if (prev) prev.el.style.transform = 'translateX(-25%)';
    el.style.transform = 'translateX(0)';
  });

  screens.push({ el });
  syncGlobalNavbarVisibility();
}

function popScreen() {
  if (screens.length <= 1) return;
  const top = screens.pop();
  const newTop = screens[screens.length - 1];
  syncGlobalNavbarVisibility();

  requestAnimationFrame(() => {
    top.el.style.transform = 'translateX(100%)';
    newTop.el.style.transform = 'translateX(0)';
    newTop.el.classList.remove('behind');
  });

  const cleanup = (e) => {
    if (e.target !== top.el || e.propertyName !== 'transform') return;
    top.el.removeEventListener('transitionend', cleanup);
    top.el.remove();
  };
  top.el.addEventListener('transitionend', cleanup);
}

function popToRoot() {
  if (screens.length <= 1) return;
  while (screens.length > 2) {
    const mid = screens.splice(1, 1)[0];
    mid.el.remove();
  }
  const top = screens.pop();
  const bottom = screens[0];
  syncGlobalNavbarVisibility();

  requestAnimationFrame(() => {
    top.el.style.transform = 'translateX(100%)';
    bottom.el.style.transform = 'translateX(0)';
    bottom.el.classList.remove('behind');
  });

  const cleanup = (e) => {
    if (e.target !== top.el || e.propertyName !== 'transform') return;
    top.el.removeEventListener('transitionend', cleanup);
    top.el.remove();
  };
  top.el.addEventListener('transitionend', cleanup);
}

/* ============================== старт-экран ============================== */

function buildStartScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-start';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="start-badge">${ICONS.percent}</div>
    <button class="btn-start" id="startBtn">Кэшбэки и бонусы</button>
  `;
  el.querySelector('#startBtn').addEventListener('click', () => {
    haptic(10);
    openCashbackScreen();
  });
  return el;
}

/* ============================== экран категорий кэшбэка ============================== */

function buildCashbackScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-cashback';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="scroll" id="cbScroll">
      <div class="navbar-spacer"></div>
      <div class="tiles-row">
        <div class="tile" id="tileNovember">
          <div class="tile-top">
            <div class="tile-label">Повышенный кэшбэк в ноябре</div>
            <div class="tile-badge" id="novBadge">1</div>
          </div>
          <button class="tile-pick-btn" id="novPickBtn">Выбрать</button>
        </div>
        <div class="tile">
          <div class="tile-label">Повышенный кэшбэк в октябре</div>
          <div class="avatars" id="octAvatars"></div>
        </div>
      </div>
      <div class="headline-block">
        <div class="headline">Сохраните,<br>что нравится</div>
        <div class="headline-sub">Все предложения уже действуют</div>
      </div>
      <div class="chips-sticky-wrap"><div class="chips-row" id="chipsRow"></div></div>
      <div class="offers-wrap" id="offersWrap"></div>
      <div class="scroll-bottom-spacer"></div>
    </div>
    <div class="bottom-fixed">
      <button class="btn-primary" id="nextBtn"></button>
      <div class="bottom-caption">${ICONS.heartFilled}<span class="bottom-caption-text-wrap" id="bottomCaptionWrap"><span class="bottom-caption-text" id="bottomCaptionText">Можно выбрать без ограничений</span></span></div>
    </div>
  `;
  return el;
}

function renderNovTile(root) {
  const badge = root.querySelector('#novBadge');
  const btn = root.querySelector('#novPickBtn');
  if (state.novemberChosen) {
    badge.classList.add('hidden');
    btn.textContent = 'Изменить';
  } else {
    badge.classList.remove('hidden');
    btn.textContent = 'Выбрать';
  }
}

function buildOctAvatars(root) {
  const wrap = root.querySelector('#octAvatars');
  wrap.innerHTML = OCT_AVATARS.map((src, i) =>
    `<img class="avatar" style="z-index:${4 - i}" src="${src}" alt="">`
  ).join('');
}

function offerListItemHTML(stepIndex, i, it) {
  return `
    <div class="offer-item">
      <div class="offer-item-main">
        <img class="offer-icon" src="${it.icon}" alt="" loading="lazy">
        <div class="offer-info">
          <div class="offer-top-line">
            <span class="offer-percent">${esc(it.percent)}</span>
            <span class="offer-dot">•</span>
            <span class="offer-name">${esc(it.name)}</span>
          </div>
          <div class="offer-until">${it.urgency === 'горящий' && it.expiration ? `<span class="offer-urgent">${esc(it.expiration)}</span> · ` : ''}${esc(it.until || UNTIL_TEXT)}</div>
        </div>
      </div>
      <button class="heart-btn" data-idx="${i}" aria-label="Нравится">${ICONS.heart}</button>
    </div>
  `;
}

function offerCardHTML(stepIndex, i, it) {
  return `
    <div class="offer-card">
      <div class="offer-card-image">
        <img src="${it.photo || it.icon}" alt="" loading="lazy">
        <button class="heart-btn" data-idx="${i}" aria-label="Нравится">${ICONS.heart}</button>
      </div>
      <div class="offer-card-info">
        <div class="offer-card-price-row">
          <span class="offer-card-cashback-label">Кэшбэк</span>
          <span class="cashback-pill-wrap">
            <span class="cashback-pill">
              <span class="cashback-pill-icon">${ICONS.crown}</span>
              <span class="cashback-pill-label">${esc(it.percent)}</span>
            </span>
          </span>
        </div>
        <div class="offer-card-name">${esc(it.name)}</div>
      </div>
    </div>
  `;
}

function renderOffers(root, stepIndex, animate) {
  const wrap = root.querySelector('#offersWrap');
  const cat = CATEGORIES[stepIndex];

  if (cat.type === 'list') {
    wrap.innerHTML = `<div class="offer-list">${cat.items.map((it, i) => offerListItemHTML(stepIndex, i, it)).join('')}</div>`;
  } else {
    wrap.innerHTML = `<div class="offer-grid">${cat.items.map((it, i) => offerCardHTML(stepIndex, i, it)).join('')}</div>`;
  }

  wrap.querySelectorAll('.heart-btn').forEach((btn) => {
    const idx = parseInt(btn.dataset.idx, 10);
    if (state.likes[stepIndex].has(idx)) btn.classList.add('liked');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(root, stepIndex, idx, btn);
    });
  });

  wrap.querySelectorAll('.offer-item, .offer-card').forEach((el, i) => {
    el.addEventListener('click', () => openOfferScreen(stepIndex, i));
  });

  if (animate) triggerAnim(wrap);
}

function setOfferLiked(stepIndex, idx, liked) {
  const set = state.likes[stepIndex];
  if (liked) set.add(idx); else set.delete(idx);

  if (cashbackRoot) {
    const rowBtn = cashbackRoot.querySelector(`#offersWrap .heart-btn[data-idx="${idx}"]`);
    if (rowBtn) rowBtn.classList.toggle('liked', liked);
  }
  if (navHeartOfferCtx && navHeartOfferCtx.stepIndex === stepIndex && navHeartOfferCtx.idx === idx) {
    document.getElementById('navHeart').classList.toggle('liked', liked);
  }
}

function toggleLike(root, stepIndex, idx, btn) {
  const wasLiked = state.likes[stepIndex].has(idx);
  setOfferLiked(stepIndex, idx, !wasLiked);
  if (wasLiked) {
    haptic(8);
  } else {
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    haptic([10, 20, 10]);
    flashNavHeart();
  }
}

let navHeartFlashTimer = null;

function flashNavHeart() {
  if (navHeartOfferCtx) return;
  const navHeart = document.getElementById('navHeart');
  clearTimeout(navHeartFlashTimer);
  navHeart.classList.remove('pulse');
  void navHeart.offsetWidth;
  navHeart.classList.add('liked', 'pulse');
  navHeartFlashTimer = setTimeout(() => {
    navHeart.classList.remove('liked', 'pulse');
  }, 1000);
}

function jitterHearts(root) {
  const hearts = root.querySelectorAll('#offersWrap .heart-btn');
  hearts.forEach((h, i) => {
    setTimeout(() => {
      h.classList.remove('jitter');
      void h.offsetWidth;
      h.classList.add('jitter');
      setTimeout(() => h.classList.remove('jitter'), 1000);
    }, i * 140);
  });
}

function buildChipsRow(root) {
  const row = root.querySelector('#chipsRow');
  row.innerHTML = CATEGORIES.map((c, i) =>
    `<button class="chip${i === state.step ? ' active' : ''}" data-step="${i}">${esc(c.label)}</button>`
  ).join('');
  row.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      haptic(8);
      const idx = parseInt(chip.dataset.step, 10);
      if (idx === state.step) return;
      state.step = idx;
      advanceToStep(root);
    });
  });
}

function updateChipsActive(root) {
  root.querySelectorAll('.chip').forEach((c) => {
    c.classList.toggle('active', parseInt(c.dataset.step, 10) === state.step);
  });
}

function scrollActiveChipIntoView(root) {
  const active = root.querySelector('.chip.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function updateProgress(root) {
  document.getElementById('progressFill').style.width = (((state.step + 1) / CATEGORIES.length) * 100) + '%';
}

function updateNextBtn(root) {
  const btn = root.querySelector('#nextBtn');
  const cat = CATEGORIES[state.step];
  btn.textContent = cat.nextLabel ? ('Дальше ' + cat.nextLabel) : 'Забрать награду';
}

const STEP_CAPTIONS = [
  'Можно выбрать без ограничений',
  'Отличное начало, двигаемся дальше',
  'Ещё немного — ты почти у цели',
  'Совсем чуть-чуть — подарок уже твой',
];

function updateBottomCaption(root, animate) {
  const wrap = root.querySelector('#bottomCaptionWrap');
  const newText = STEP_CAPTIONS[state.step] || STEP_CAPTIONS[STEP_CAPTIONS.length - 1];
  const existing = wrap.querySelectorAll('.bottom-caption-text');
  const old = existing[existing.length - 1];

  if (!animate || !old) {
    wrap.innerHTML = `<span class="bottom-caption-text" id="bottomCaptionText">${esc(newText)}</span>`;
    wrap.style.width = '';
    return;
  }
  if (old.textContent === newText) return;

  // drop any stale, already-finished exit spans left over from a previous transition
  for (let i = 0; i < existing.length - 1; i++) existing[i].remove();

  const probe = document.createElement('span');
  probe.className = 'bottom-caption-text';
  probe.style.visibility = 'hidden';
  probe.style.position = 'absolute';
  probe.textContent = newText;
  wrap.appendChild(probe);
  wrap.style.width = Math.max(old.offsetWidth, probe.offsetWidth) + 'px';
  probe.remove();

  old.removeAttribute('id');
  old.classList.remove('slide-in-up');
  old.classList.add('slide-out-up');
  old.addEventListener('animationend', () => old.remove(), { once: true });

  const next = document.createElement('span');
  next.className = 'bottom-caption-text slide-in-up';
  next.id = 'bottomCaptionText';
  next.textContent = newText;
  wrap.appendChild(next);
}

function staticOffsetTopWithin(el, ancestor) {
  // offsetTop reflects the current *stuck* position once a sticky element
  // has engaged, not its original static one — disable sticky for the
  // measurement so the result is stable regardless of current scroll.
  const prevPosition = el.style.position;
  el.style.position = 'static';
  let top = 0;
  let node = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  el.style.position = prevPosition;
  return top;
}

function snapScrollToChips(root) {
  const scrollEl = root.querySelector('#cbScroll');
  const chipsWrap = root.querySelector('.chips-sticky-wrap');
  const navbar = document.getElementById('globalNavbar');
  const target = Math.max(0, staticOffsetTopWithin(chipsWrap, scrollEl) - navbar.offsetHeight);
  scrollEl.scrollTo({ top: target, behavior: 'smooth' });
}

function advanceToStep(root) {
  updateProgress(root);
  updateChipsActive(root);
  scrollActiveChipIntoView(root);
  renderOffers(root, state.step, true);
  updateNextBtn(root);
  updateBottomCaption(root, true);
  snapScrollToChips(root);
}

function onNextClick(root) {
  const likedCount = state.likes[state.step].size;

  if (likedCount === 0 && CATEGORIES[state.step].id === 'food') {
    haptic([15, 40, 15]);
    jitterHearts(root);
    return;
  }

  haptic(10);
  if (state.step < CATEGORIES.length - 1) {
    state.step++;
    advanceToStep(root);
  } else {
    openSuccessScreen();
  }
}

function bindNavbarScroll(scrollEl, stuckTestFn) {
  const navbar = document.getElementById('globalNavbar');
  function update() {
    navbar.classList.toggle('solid', stuckTestFn());
  }
  scrollEl.addEventListener('scroll', update, { passive: true });
  update();
  return update;
}

function setupNavbarScrollBg(root) {
  const scrollEl = root.querySelector('#cbScroll');
  const navbar = document.getElementById('globalNavbar');
  const chipsWrap = root.querySelector('.chips-sticky-wrap');
  cashbackNavbarUpdate = bindNavbarScroll(scrollEl, () =>
    chipsWrap.getBoundingClientRect().top <= navbar.getBoundingClientRect().bottom
  );
}

function mountCashbackScreen(root) {
  cashbackRoot = root;

  buildChipsRow(root);
  renderNovTile(root);
  buildOctAvatars(root);
  updateProgress(root);
  updateNextBtn(root);
  updateBottomCaption(root);
  renderOffers(root, state.step, false);
  setupNavbarScrollBg(root);

  root.querySelectorAll('.tile').forEach((t, i) => {
    setTimeout(() => t.classList.add('anim-in'), i * 40);
  });
  setTimeout(() => root.querySelector('.headline-block').classList.add('anim-in'), 110);
  setTimeout(() => root.querySelector('.chips-row').classList.add('anim-in'), 190);
  setTimeout(() => root.querySelector('#offersWrap').classList.add('anim-in'), 260);

  setTimeout(() => jitterHearts(root), 2000);

  root.querySelector('#novPickBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    haptic(10);
    openPickerScreen();
  });
  root.querySelector('#nextBtn').addEventListener('click', () => onNextClick(root));
}

function openCashbackScreen() {
  resetState();
  const el = buildCashbackScreen();
  pushScreen(el);
  mountCashbackScreen(el);
}

/* ============================== экран оффера ============================== */

const OFFER_STEPS = [
  { title: 'Описание акции, рассказывает о предложении', sub: 'Акция действует на покупки в точках, отмеченных на карте' },
  { title: 'Оплатите покупку любой картой Т-Банка', sub: 'Нельзя оплатить по QR-коду и через СБП' },
  { title: 'Получите до N бонусов', sub: 'Кэшбэк придёт в дату следующей выписки' },
];

const OFFER_BULLETS = [
  'Спецпредложение действует на покупки только в точках, отмеченных на карте',
  'Не суммируется с другими акциями партнёра в разделе «Кэшбэк и бонусы»',
  'Акция суммируется с программой лояльности партнёра. Для получения дополнительных бонусов отсканируйте карту лояльности',
];

function buildOfferScreen(stepIndex, idx) {
  const it = CATEGORIES[stepIndex].items[idx];
  const typeLabel = it.offerType ? it.offerType[0].toUpperCase() + it.offerType.slice(1) : 'Кэшбэк';
  const percentValue = it.percent || it.badge || '';
  const el = document.createElement('div');
  el.className = 'screen screen-offer';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="scroll offer-scroll" id="offerScroll">
      <div class="offer-hero">
        <img class="offer-hero-img" src="${it.background || it.icon}" alt="">
        <div class="offer-hero-fade"></div>
        <div class="offer-hero-text">
          <div class="offer-hero-heading">
            <div class="offer-hero-title">${esc(it.name)}</div>
            <div class="offer-hero-cashback">${esc(typeLabel)} ${esc(percentValue)}</div>
          </div>
          ${it.until ? `<div class="offer-hero-line">${esc(it.until)}</div>` : ''}
          ${it.expiration ? `<div class="offer-hero-line">${esc(it.expiration)}</div>` : ''}
        </div>
      </div>
      <div class="offer-body">
        <div class="offer-card-block">
          <div class="offer-card-block-title">Как получить кэшбэк</div>
          ${OFFER_STEPS.map((s, i) => `
            <div class="offer-step">
              <div class="offer-step-num">${i + 1}</div>
              <div class="offer-step-text">
                <div class="offer-step-title">${esc(s.title)}</div>
                <div class="offer-step-sub">${esc(s.sub)}</div>
              </div>
            </div>
          `).join('')}
          <div class="offer-note">Акция не распространяется на покупки через сторонние сервисы доставки</div>
        </div>
        <div class="offer-card-block offer-bullets-block">
          <div class="offer-card-block-title">Что ещё нужно знать</div>
          ${OFFER_BULLETS.map((b) => `
            <div class="offer-bullet">
              <span class="offer-bullet-dot-wrap"><span class="offer-bullet-dot"></span></span>
              <span class="offer-bullet-text">${esc(b)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="scroll-bottom-spacer"></div>
    </div>
    <div class="bottom-fixed">
      <button class="btn-primary" id="offerCta">К покупкам.</button>
    </div>
  `;
  return el;
}

function mountOfferScreen(root, stepIndex, idx) {
  const navbar = document.getElementById('globalNavbar');
  const navHeart = document.getElementById('navHeart');

  navbar.classList.add('hide-progress');
  navHeartOfferCtx = { stepIndex, idx };
  navHeart.innerHTML = ICONS.heart;
  navHeart.classList.remove('pop');
  navHeart.classList.toggle('liked', state.likes[stepIndex].has(idx));

  const scrollEl = root.querySelector('#offerScroll');
  const hero = root.querySelector('.offer-hero');
  bindNavbarScroll(scrollEl, () => scrollEl.scrollTop >= hero.offsetHeight - 60);

  root.querySelector('#offerCta').addEventListener('click', () => haptic(10));

  triggerAnim(root.querySelector('.offer-body'));
}

function openOfferScreen(stepIndex, idx) {
  const el = buildOfferScreen(stepIndex, idx);
  pushScreen(el);
  mountOfferScreen(el, stepIndex, idx);
}

function closeOfferScreen() {
  navHeartOfferCtx = null;
  const navbar = document.getElementById('globalNavbar');
  navbar.classList.remove('hide-progress');
  const navHeart = document.getElementById('navHeart');
  navHeart.classList.remove('liked', 'pop', 'pulse');
  navHeart.innerHTML = ICONS.heartFilled;
  if (cashbackNavbarUpdate) cashbackNavbarUpdate();
  popScreen();
}

/* ============================== экран выбора кэшбэка на ноябрь ============================== */

function buildPickerScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-picker';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="picker-header">
      <button class="glass-pill" id="pickBack" aria-label="Назад">${ICONS.chevronLeft}</button>
      <div class="picker-header-title">Кэшбэк на ноябрь</div>
    </div>
    <div class="picker-scroll">
      <div class="picker-title">Выбери категории<br>с доп. кэшбэком</div>
      <div class="picker-sub">Можно выбрать до ${PICKER_MAX} категорий — кэшбэк по ним будет повышен весь ноябрь</div>
      <div class="picker-list" id="pickerGrid"></div>
    </div>
    <div class="bottom-fixed">
      <button class="btn-primary" id="pickerDone">Выбрать</button>
    </div>
  `;
  return el;
}

function updatePickerDoneState(root) {
  root.querySelector('#pickerDone').classList.toggle('disabled', pickerSelected.size === 0);
}

function updatePickerCap(root) {
  const atMax = pickerSelected.size >= PICKER_MAX;
  root.querySelectorAll('.picker-list-item').forEach((item) => {
    const i = parseInt(item.dataset.i, 10);
    item.classList.toggle('disabled', atMax && !pickerSelected.has(i));
  });
}

function mountPickerScreen(root) {
  const grid = root.querySelector('#pickerGrid');
  grid.innerHTML = PICKER_CATEGORIES.map((cat, i) => `
    <button class="picker-list-item" data-i="${i}">
      <img class="picker-item-icon" src="${cat.icon}" alt="" loading="lazy">
      <span class="picker-item-label"><b>${cat.percent}%</b> ${esc(cat.name)}</span>
      <span class="picker-checkbox">${ICONS.check}</span>
    </button>
  `).join('');

  grid.querySelectorAll('.picker-list-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('disabled')) return;
      const i = parseInt(item.dataset.i, 10);
      if (pickerSelected.has(i)) {
        pickerSelected.delete(i);
        item.classList.remove('selected');
        haptic(8);
      } else {
        if (pickerSelected.size >= PICKER_MAX) return;
        pickerSelected.add(i);
        item.classList.add('selected');
        haptic([10, 20, 10]);
      }
      updatePickerCap(root);
      updatePickerDoneState(root);
    });
  });

  updatePickerCap(root);
  updatePickerDoneState(root);

  root.querySelector('#pickBack').addEventListener('click', () => {
    haptic(8);
    popScreen();
  });

  root.querySelector('#pickerDone').addEventListener('click', () => {
    if (pickerSelected.size === 0) return;
    haptic([10, 30, 10]);
    state.novemberChosen = true;
    if (cashbackRoot) renderNovTile(cashbackRoot);
    popScreen();
  });
}

function openPickerScreen() {
  pickerSelected = new Set();
  const el = buildPickerScreen();
  pushScreen(el);
  mountPickerScreen(el);
}

/* ============================== success-экран ============================== */

function buildSuccessScreen() {
  const reminderNeeded = !state.novemberChosen;
  const el = document.createElement('div');
  el.className = 'screen screen-success';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="success-scroll">
      <div class="success-ring">${ICONS.bigCheck}</div>
      <div class="success-title">Готово!</div>
      <div class="success-points">${ICONS.coin}<span>+500 баллов кэшбэка</span></div>
      <div class="success-sub">Баллы уже зачислены на счёт. Выбранные категории можно поменять в любой момент.</div>
      ${reminderNeeded ? `
      <div class="reminder-card">
        <div class="reminder-title">${ICONS.bell}<span>Не забудь про ноябрь</span></div>
        <div class="reminder-text">Ты ещё не выбрал повышенный кэшбэк на ноябрь — успей сделать это, пока категории доступны.</div>
        <button class="reminder-btn" id="reminderBtn">Выбрать сейчас</button>
      </div>` : ''}
    </div>
    <div class="success-bottom">
      <button class="btn-primary" id="successDone">Готово</button>
    </div>
  `;
  return el;
}

function mountSuccessScreen(root) {
  haptic([10, 50, 10, 50, 20]);

  const reminderBtn = root.querySelector('#reminderBtn');
  if (reminderBtn) {
    reminderBtn.addEventListener('click', () => {
      haptic(10);
      openPickerScreen();
    });
  }

  root.querySelector('#successDone').addEventListener('click', () => {
    haptic(10);
    popToRoot();
  });
}

function openSuccessScreen() {
  const el = buildSuccessScreen();
  pushScreen(el);
  mountSuccessScreen(el);
}

/* ============================== глобальный апп-бар ============================== */

function buildGlobalNavbar() {
  const el = document.createElement('div');
  el.className = 'navbar';
  el.id = 'globalNavbar';
  el.style.display = 'none';
  el.innerHTML = `
    <button class="glass-pill nav-back" id="gnbBack" aria-label="Назад">${ICONS.chevronLeft}</button>
    <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
    <button class="glass-pill nav-heart" id="navHeart" aria-label="Избранное">${ICONS.heartFilled}</button>
  `;
  document.getElementById('app').appendChild(el);

  el.querySelector('#gnbBack').addEventListener('click', () => {
    haptic(8);
    const top = screens[screens.length - 1];
    if (top && top.el.classList.contains('screen-offer')) {
      closeOfferScreen();
    } else {
      popScreen();
    }
  });

  el.querySelector('#navHeart').addEventListener('click', () => {
    if (navHeartOfferCtx) {
      const { stepIndex, idx } = navHeartOfferCtx;
      const wasLiked = state.likes[stepIndex].has(idx);
      setOfferLiked(stepIndex, idx, !wasLiked);
      const navHeart = document.getElementById('navHeart');
      if (!wasLiked) {
        haptic([10, 20, 10]);
        navHeart.classList.remove('pop');
        void navHeart.offsetWidth;
        navHeart.classList.add('pop');
      } else {
        haptic(8);
      }
    } else {
      haptic(8);
    }
  });
}

/* ============================== инициализация ============================== */

function init() {
  buildGlobalNavbar();
  const start = buildStartScreen();
  stackEl.appendChild(start);
  screens.push({ el: start });
}

init();
