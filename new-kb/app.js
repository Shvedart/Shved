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
  pin: `<svg viewBox="0 0 16 16" fill="none"><path d="M8.94167 7.60833C9.20278 7.34722 9.33333 7.03333 9.33333 6.66667C9.33333 6.3 9.20278 5.98611 8.94167 5.725C8.68056 5.46389 8.36667 5.33333 8 5.33333C7.63333 5.33333 7.31944 5.46389 7.05833 5.725C6.79722 5.98611 6.66667 6.3 6.66667 6.66667C6.66667 7.03333 6.79722 7.34722 7.05833 7.60833C7.31944 7.86944 7.63333 8 8 8C8.36667 8 8.68056 7.86944 8.94167 7.60833ZM8 14.6667C6.21111 13.1444 4.875 11.7306 3.99167 10.425C3.10833 9.11944 2.66667 7.91111 2.66667 6.8C2.66667 5.13333 3.20278 3.80556 4.275 2.81667C5.34722 1.82778 6.58889 1.33333 8 1.33333C9.41111 1.33333 10.6528 1.82778 11.725 2.81667C12.7972 3.80556 13.3333 5.13333 13.3333 6.8C13.3333 7.91111 12.8917 9.11944 12.0083 10.425C11.125 11.7306 9.78889 13.1444 8 14.6667Z" fill="#333"/></svg>`,
  gift: `<svg viewBox="0 0 16 16" fill="none"><path d="M2.667 7.333h10.666v5.334a1 1 0 01-1 1H3.667a1 1 0 01-1-1V7.333z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M2 5.333a1 1 0 011-1h10a1 1 0 011 1v1.334a.667.667 0 01-.667.666H2.667A.667.667 0 012 6.667V5.333z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 4.333V13.667M8 4.333C8 4.333 5.833 1 4.333 2.2 2.833 3.4 5 4.333 8 4.333zM8 4.333C8 4.333 10.167 1 11.667 2.2 13.167 3.4 11 4.333 8 4.333z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
};

/* ============================== данные ============================== */

const UNTIL_TEXT = 'На покупки онлайн до 6 ноября';

const CATEGORIES = [
  {
    id: 'food', label: 'Еда', type: 'list', nextLabel: 'Любимые бренды', moreNote: 'И ещё 100 предложений покажем в ленте',
    headline: 'Настройте<br>кэшбэк под себя', headlineSub: 'Сохраняйте то, что пригодится',
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
    id: 'brands', label: 'Любимые бренды', type: 'list', nextLabel: 'Кэшбэк на районе', moreNote: 'И ещё больше 1000 предложений покажем в ленте',
    headline: 'Магазины,<br>где вы покупаете', headlineSub: 'Проверяйте кэшбэк перед покупкой',
    items: [
      { id: 'clothes-lamoda-20', percent: '20%', name: 'Lamoda', icon: 'https://ms-static-images.t-static.ru/partner-image280-03d259e7907440edb337f76a0a164016.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-b9c0cbe3077c4c66bfc0fd617f413af8.png', description: 'Маркетплейс одежды, обуви, товаров для дома и красоты' },
      { id: 'clothes-sportmaster-10', percent: '10%', name: 'Спортмастер', icon: 'https://ms-static-images.t-static.ru/partner-10172-image280-9cdc1142.png', until: 'На одну покупку', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-62b5b70dfc924bbd91a06cf43d8505e4.png', description: 'Спортивные товары' },
      { id: 'electronics-sitilink-5', percent: '5%', name: 'Ситилинк', icon: 'https://ms-static-images.t-static.ru/partner-5703-image280-992774a3.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-db5c248a22894688b05646133476b2a5.png', description: 'Магазин электроники и бытовой техники' },
      { id: 'electronics-m-video-v-shopinge-10', percent: '10%', name: 'М.Видео в Шопинге', icon: 'https://ms-static-images.t-static.ru/partner-image280-45f6829ab80b492dbde2751a7cfe140b.png', until: '', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-b788766712504276b0384c2899b2119d.png', description: 'Шопинг в Т-Банке' },
      { id: 'electronics-restore-3', percent: '3%', name: 'restore:', icon: 'https://ms-static-images.t-static.ru/partner-355-image280-acf03bad.png', until: 'На покупки онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-7bea9204976b4fd29e4c3fa842720273.png', description: 'Магазин техники и электроники' },
      { id: 'clothes-detskiy-mir-7', percent: '7%', name: 'Детский мир', icon: 'https://ms-static-images.t-static.ru/partner-10903-image280-883ef19b.png', until: 'На одну покупку онлайн', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-37c36c1e2d4a4378a89943b4cc9a8001.png', description: 'Товары для детей' },
    ],
  },
  {
    id: 'district', label: 'Кэшбэк на районе', type: 'list', nextLabel: null,
    headline: 'Бонусы<br>прямо у дома', headlineSub: 'Кофейни, салоны и магазины рядом',
    nearbyStreet: 'Турмалиновская ул',
    chainLabel: 'Кэшбэк в Пятёрочек',
    chainStreet: 'ул. Ленина, 14',
    chainAvatar: 'assets/district/pyaterochka-avatar.png',
    items: [
      { id: 'district-cut-barbershop-20', group: 'nearby', percent: '20%', name: 'Cut Barbershop', icon: 'assets/district/barbershop-icon.png', until: 'пр-кт Михаила Нагибина, 12А', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'assets/district/barbershop-icon.png', description: 'Барбершоп' },
      { id: 'district-surf-coffee-20', group: 'nearby', percent: '20%', name: 'Кофейня Surf Coffee', icon: 'assets/district/surfcoffee-icon.png', until: 'пр-кт Михаила Нагибина, 13', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'assets/district/surfcoffee-icon.png', description: 'Кофейня' },
      { id: 'product-blade-deep-chill-v-pyaterochke-50', group: 'chain', percent: '50%', name: 'BLADE Deep Chill в Пятёрочке', icon: 'https://ms-static-images.t-static.ru/partner-13008-image280-b7b23f14.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-95aedc3620fe4a2e8377d3be3342c84b.png', until: '', offerType: 'кэшбэк', expiration: 'До 8 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-9f614a3d9f79467ea7b6d1bbb09adb42.png', description: 'Дезодоранты' },
      { id: 'product-haus-herz-v-fix-price-15', group: 'chain', percent: '15%', name: 'Haus Herz в Fix Price', icon: 'https://ms-static-images.t-static.ru/partner-image280-5578570c05554d04937c3990ac10061b.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-015857387ae849f59baafcad0a3a5fdc.png', until: '', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-7d19f432f5a04afd843fbbc6302a17ed.png', description: 'Бытовая химия' },
      { id: 'product-gls-pharmaceuticals-15', group: 'chain', percent: '15%', name: 'GLS Pharmaceuticals', icon: 'https://ms-static-images.t-static.ru/partner-image280-4423975b62344cba85ca00857f8e42b8.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-5a442e85f64f46399b77b3aa7b76baa4.png', until: '', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-f92de464e45f4b7899530b4e85351eff.png', description: 'БАДы' },
      { id: 'district-gold-bier-chizhik', group: 'chain', percent: 'до 50%', name: 'GOLD в Чижике', icon: 'assets/district/gold-bier.png', photo: 'assets/district/gold-bier.png', until: 'На покупки на кассе', offerType: 'кэшбэк', expiration: 'До 6 ноября', urgency: 'стандартный', background: 'assets/district/gold-bier.png', description: 'Напиток' },
      { id: 'product-tvorozhnye-syrki-savushkin-90', group: 'chain', percent: '90%', name: 'Творожные сырки «Савушкин»', icon: 'https://ms-static-images.t-static.ru/partner-image280-88b662255662465aa75d4f7c6ed78c7b.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-5670dd774bef48829a1e3bcd5ce67955.png', until: '', offerType: 'кэшбэк', expiration: 'До 30 ноября', urgency: 'стандартный', background: 'https://ms-static-images.t-static.ru/partner-image1252-d8d8074959c7491a8114b25698fb892a.png', description: 'Творожные сырки' },
      { id: 'product-kofe-v-drip-paketah-lebo-40', group: 'chain', percent: '40%', name: 'Кофе в дрип-пакетах LEBO', icon: 'https://ms-static-images.t-static.ru/partner-image280-d11f68112eca411ebca2ad5a0f6b1bbf.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-109de695a9f447b2995d8d8faca4a9a2.png', until: '', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-f118cac8145b4cd3a0624fc2956e74b4.png', description: 'Кофе в дрип-пакетах' },
      { id: 'product-planto-banan-v-pyaterochke-40', group: 'chain', percent: '40%', name: 'Planto «Банан» в Пятёрочке', icon: 'https://ms-static-images.t-static.ru/partner-image280-3e356b4eeae74e34946ac74fb4fde9d2.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-291ed1782ef94136b2fb4fc9d9f940b9.png', until: 'На одну покупку', offerType: 'кэшбэк', expiration: 'Последний день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-31116500a7c94a7c95ee47a9d7df7c15.png', description: 'Растительные напитки' },
      { id: 'product-ararat-25', group: 'chain', percent: '25%', name: 'Арарат', icon: 'https://ms-static-images.t-static.ru/partner-image280-77fd237f76094700af670a68f4ce8dc8.png', photo: 'https://ms-static-images.t-static.ru/partner-image780-5da4427aaae84c849255315066047675.png', until: 'На покупки на кассе', offerType: 'кэшбэк', expiration: '1 день', urgency: 'горящий', background: 'https://ms-static-images.t-static.ru/partner-image1252-690c840f3a664b1d94451bba70e4f946.png', description: 'Напитки' },
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

const CASHBACK_OF_DAY = {
  title: 'Кэшбэк дня',
  sub: 'Самое выгодное сегодня',
  avatars: [
    'https://ms-static-images.t-static.ru/partner-15121-image280-43810688.png',
    'https://ms-static-images.t-static.ru/partner-9663-image280-39f63a9e.png',
    'https://ms-static-images.t-static.ru/partner-image280-45f6829ab80b492dbde2751a7cfe140b.png',
  ],
  giftLabel: 'До подарка',
  giftMeta: 'Ещё 4 дня',
  steps: 5,
};

const DISTRICT_CASHBACK = {
  title: 'Кэшбэк<br>на районе',
  sub: 'Выгода рядом с вами',
  avatars: [
    'assets/cod/district-avatar-1.png',
    'assets/cod/district-avatar-2.png',
    'assets/cod/district-avatar-3.png',
  ],
};

/* ============================== утилиты ============================== */

function haptic(pattern) {
  try {
    if ('vibrate' in navigator) { navigator.vibrate(pattern); return; }
  } catch (e) { /* no-op */ }
  // iOS 18+ / Safari 18+: нет Vibration API, но нативный <input switch>
  // вызывает системный Taptic Engine при тапе через связанный label.
  try {
    const trigger = document.getElementById('hapticTrigger');
    if (trigger) trigger.click();
  } catch (e) { /* no-op */ }
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

function freshLikes() {
  return CATEGORIES.map(() => new Set());
}

const state = {
  step: 0,
  likes: freshLikes(),
  novemberChosen: false,
  novemberCategories: [],
  successMode: false,
};

let pickerSelected = new Set();
let cashbackRoot = null;
let navHeartOfferCtx = null;
let cashbackNavbarUpdate = null;
let favoritesRoot = null;
let favoritesFilterStep = null;
let favoritesNavbarUpdate = null;
let codProgressTimer = null;

function resetState() {
  state.step = 0;
  state.likes = freshLikes();
  state.novemberChosen = false;
  state.novemberCategories = [];
  state.successMode = false;
}

function totalLikedCount() {
  return state.likes.reduce((a, s) => a + s.size, 0);
}

function pluralizeRu(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

/* ============================== стек экранов (push/pop как в iOS) ============================== */

const stackEl = document.getElementById('stack');
const screens = [];

function syncGlobalNavbarVisibility() {
  const navbar = document.getElementById('globalNavbar');
  if (!navbar) return;
  const top = screens[screens.length - 1];
  const show = top && (top.el.classList.contains('screen-cashback') || top.el.classList.contains('screen-offer') || top.el.classList.contains('screen-favorites'));
  navbar.style.visibility = show ? 'visible' : 'hidden';
  navbar.style.pointerEvents = show ? '' : 'none';
}

/* will-change ставим только на время самой анимации и снимаем сразу после —
   если оставить его включённым постоянно, WebKit на реальных iOS-устройствах
   иногда "подвисает" с устаревшим hit-test прямоугольником у промотированного
   слоя, и тапы по экрану/навбару начинают попадать мимо визуальных элементов. */
function animateScreenTransform(el, value) {
  el.style.willChange = 'transform';
  const onEnd = (e) => {
    if (e.target !== el || e.propertyName !== 'transform') return;
    el.removeEventListener('transitionend', onEnd);
    el.style.willChange = 'auto';
  };
  el.addEventListener('transitionend', onEnd);
  el.style.transform = value;
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
    if (prev) animateScreenTransform(prev.el, 'translateX(-25%)');
    animateScreenTransform(el, 'translateX(0)');
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
    animateScreenTransform(top.el, 'translateX(100%)');
    animateScreenTransform(newTop.el, 'translateX(0)');
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
    animateScreenTransform(top.el, 'translateX(100%)');
    animateScreenTransform(bottom.el, 'translateX(0)');
    bottom.el.classList.remove('behind');
  });

  const cleanup = (e) => {
    if (e.target !== top.el || e.propertyName !== 'transform') return;
    top.el.removeEventListener('transitionend', cleanup);
    top.el.remove();
  };
  top.el.addEventListener('transitionend', cleanup);
}

/* ---------- свайп "назад" от левого края экрана (как в iOS) ---------- */

(function setupSwipeBack() {
  const EDGE = 24; // зона начала жеста от левого края, px
  const COMMIT_RATIO = 0.33; // после какой доли ширины экрана свайп считается завершённым

  let active = false;
  let decided = false;
  let startX = 0, startY = 0, lastX = 0, width = 0;
  let topEl = null, prevEl = null;

  stackEl.addEventListener('touchstart', (e) => {
    if (screens.length <= 1) return;
    const t = e.touches[0];
    if (t.clientX > EDGE) return;
    const top = screens[screens.length - 1];
    const prev = screens[screens.length - 2];
    topEl = top.el;
    prevEl = prev ? prev.el : null;
    startX = lastX = t.clientX;
    startY = t.clientY;
    width = topEl.offsetWidth;
    active = true;
    decided = false;
  }, { passive: true });

  stackEl.addEventListener('touchmove', (e) => {
    if (!active) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (!decided) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { active = false; return; }
      decided = true;
      topEl.style.transition = 'none';
      topEl.style.borderRadius = '55px 0 0 55px';
      if (prevEl) prevEl.style.transition = 'none';
    }
    lastX = t.clientX;
    const clamped = Math.max(0, Math.min(dx, width));
    topEl.style.transform = `translateX(${clamped}px)`;
    if (prevEl) {
      const progress = clamped / width;
      prevEl.style.transform = `translateX(${-25 + 25 * progress}%)`;
    }
  }, { passive: true });

  function finish() {
    if (!active) return;
    active = false;
    if (!decided) return;
    const dx = Math.max(0, Math.min(lastX - startX, width));
    topEl.style.transition = '';
    if (prevEl) prevEl.style.transition = '';
    if (dx > width * COMMIT_RATIO) {
      const backBtn = document.getElementById('gnbBack');
      if (backBtn) backBtn.click();
    } else {
      topEl.style.borderRadius = '0';
      animateScreenTransform(topEl, 'translateX(0)');
      if (prevEl) animateScreenTransform(prevEl, 'translateX(-25%)');
    }
    topEl = null;
    prevEl = null;
  }

  stackEl.addEventListener('touchend', finish);
  stackEl.addEventListener('touchcancel', finish);
})();

/* ============================== старт-экран ============================== */

function buildStartScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-start';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="scroll start-scroll">
      <div class="start-safe-spacer"></div>
      <div class="start-notif-bar">
        <span class="start-notif-icon"><img src="assets/start/icon-bell.svg" alt=""></span>
        <span>Все уведомления</span>
      </div>
      <div class="start-main">
        <div class="start-header">
          <img class="start-avatar" src="assets/start/avatar.png" alt="">
          <div class="start-search">
            <span class="start-search-icon"><img src="assets/start/icon-search.svg" alt=""></span>
            <span class="start-search-text">Поиск</span>
          </div>
          <button class="start-gift-btn" aria-label="Подарки"><img src="assets/start/icon-gift.svg" alt=""></button>
        </div>
        <div class="start-dots"><span class="active"></span><span></span><span></span></div>
        <div class="start-balance-wrap">
          <div class="start-crown-pill"><img src="assets/start/icon-crown.svg" alt=""><span>2 450 ₽</span></div>
          <div class="start-balance">12 424 ₽</div>
        </div>
        <div class="start-card-area">
          <div class="start-card-black"></div>
          <div class="start-actions">
            <div class="start-action">
              <div class="start-action-btn"><img src="assets/start/icon-add.svg" alt=""></div>
              <span>Пополнить</span>
            </div>
            <div class="start-action">
              <div class="start-action-btn"><img src="assets/start/icon-flip.svg" alt=""></div>
              <span>Скан</span>
            </div>
            <div class="start-action">
              <div class="start-action-btn"><img src="assets/start/icon-arrow-forward.svg" alt=""></div>
              <span>Перевести</span>
            </div>
            <div class="start-action">
              <div class="start-action-btn"><img src="assets/start/icon-prem.svg" alt=""></div>
              <span>Прем</span>
            </div>
          </div>
        </div>
        <div class="start-tiles">
          <div class="start-tile">
            <div class="start-tile-text">
              <div class="start-tile-title">Операции</div>
              <div class="start-tile-sub">Траты в октябре 43 746 ₽</div>
            </div>
            <div class="start-ops-bars"><span></span><span></span><span></span></div>
          </div>
          <button class="start-tile start-tile-cashback" id="startCashbackTile" aria-label="Кэшбэки и бонусы">
            <div class="start-tile-text">
              <div class="start-tile-title">Кэшбэки<br>и бонусы</div>
            </div>
            <div class="start-tile-badge">1</div>
            <div class="start-tile-icons">
              <img src="assets/start/icon-m.png" alt="">
              <img src="assets/start/icon-bird.png" alt="">
              <img src="assets/start/icon-chicken.png" alt="">
            </div>
          </button>
          <div class="start-tile start-tile-row">
            <div class="start-tile-icon-sq"></div>
            <div class="start-tile-text">
              <div class="start-tile-title">120 000 ₽</div>
              <div class="start-tile-sub">Накопления</div>
            </div>
          </div>
          <div class="start-tile start-tile-row">
            <div class="start-tile-icon-sq"></div>
            <div class="start-tile-text">
              <div class="start-tile-title">Кредиты</div>
              <div class="start-tile-sub">Деньги от банка и рейтинг</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  el.querySelector('#startCashbackTile').addEventListener('click', () => {
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
          <div class="avatars" id="novAvatars" style="display:none"></div>
        </div>
        <div class="tile">
          <div class="tile-label">Повышенный кэшбэк в октябре</div>
          <div class="avatars" id="octAvatars"></div>
        </div>
      </div>
      <div class="headline-block">
        <div class="headline-content">
          <div class="headline-pane" data-text="Настройте<br>кэшбэк под себя">
            <div class="headline">Настройте<br>кэшбэк под себя</div>
            <div class="headline-sub">Сохраняйте то, что пригодится</div>
          </div>
        </div>
      </div>
      <div class="chips-sticky-wrap" id="chipsStickyWrap"><div class="chips-row" id="chipsRow"></div></div>
      <div class="offers-wrap" id="offersWrap"></div>
      <div class="scroll-bottom-spacer" id="scrollBottomSpacer"></div>
      <div class="pick-section" id="pickSection" style="display:none">
        <div class="pick-section-head">
          <div class="pick-section-title">Ваша подборка</div>
          <button class="pick-section-all" id="pickSeeAll">Все</button>
        </div>
        <div class="pick-row" id="pickRow"></div>
        <div class="pick-row-compact" id="pickRowCompact"></div>
        <div class="pick-more-wrap">
          <button class="pick-more-btn" id="pickMoreBtn">${ICONS.heart}<span>Дополнить избранное</span></button>
        </div>
      </div>
      <div class="cod-wrap" id="codWrap" style="display:none">
        <div class="cod-headline">
          <div class="cod-headline-title">На <img class="cod-headline-num" src="assets/cod/headline-70.svg" alt="70%"><br>больше кэшбэка</div>
          <div class="cod-headline-sub">Получают люди, которые заходят<br>в раздел каждый день</div>
        </div>
        <div class="cod-card">
          <div class="cod-bg"></div>
          <div class="cod-head">
            <div class="cod-head-text">
              <div class="cod-title">${esc(CASHBACK_OF_DAY.title)}</div>
              <div class="cod-sub">${esc(CASHBACK_OF_DAY.sub)}</div>
            </div>
            <div class="cod-avatars">
              ${CASHBACK_OF_DAY.avatars.map((src) => `<img class="cod-avatar" src="${src}" alt="" loading="lazy">`).join('')}
            </div>
          </div>
          <div class="cod-panel-wrap">
            <div class="cod-panel">
              <div class="cod-panel-row">
                <div class="cod-panel-label">${esc(CASHBACK_OF_DAY.giftLabel)}</div>
                <div class="cod-panel-meta"><span>${esc(CASHBACK_OF_DAY.giftMeta)}</span>${ICONS.gift}</div>
              </div>
              <div class="cod-progress" id="codProgress">
                ${Array.from({ length: CASHBACK_OF_DAY.steps }).map(() => `<div class="cod-progress-step"><div class="cod-progress-step-fill"></div></div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="district-card">
          <div class="district-bg"></div>
          <div class="district-head">
            <div class="district-head-text">
              <div class="district-title">${DISTRICT_CASHBACK.title}</div>
              <div class="district-sub">${esc(DISTRICT_CASHBACK.sub)}</div>
            </div>
            <div class="cod-avatars">
              ${DISTRICT_CASHBACK.avatars.map((src) => `<img class="cod-avatar" src="${src}" alt="" loading="lazy">`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="pick-subheadline" id="pickSubheadline" style="display:none">
        <div class="pick-subheadline-title">Больше кэшбэка</div>
        <div class="pick-subheadline-sub">Новые акции появляются каждый день</div>
      </div>
      <div class="success-bottom-spacer" id="successBottomSpacer" style="display:none"></div>
    </div>
    <div class="bottom-fixed" id="bottomFixed">
      <button class="btn-primary" id="nextBtn"></button>
      <div class="bottom-caption">${ICONS.heartFilled}<span class="bottom-caption-text-wrap" id="bottomCaptionWrap"><span class="bottom-caption-text" id="bottomCaptionText">Можно выбрать без ограничений</span></span></div>
    </div>
  `;
  return el;
}

function renderNovTile(root) {
  const badge = root.querySelector('#novBadge');
  const btn = root.querySelector('#novPickBtn');
  const avatars = root.querySelector('#novAvatars');
  if (state.novemberChosen) {
    badge.classList.add('hidden');
    btn.style.display = 'none';
    avatars.style.display = '';
    avatars.innerHTML = state.novemberCategories.map((i, idx) =>
      `<img class="avatar" style="z-index:${4 - idx}" src="${PICKER_CATEGORIES[i].icon}" alt="">`
    ).join('');
  } else {
    badge.classList.remove('hidden');
    btn.style.display = '';
    avatars.style.display = 'none';
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

const OFFERS_SHOWN_LIMIT = 6;

function districtNearbyItemHTML(i, it) {
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
          <div class="offer-until">${esc(it.until)}</div>
        </div>
      </div>
      <button class="heart-btn" data-idx="${i}" aria-label="Нравится">${ICONS.heart}</button>
    </div>
  `;
}

function renderDistrictHTML(cat) {
  const nearby = [];
  const chain = [];
  cat.items.forEach((it, i) => (it.group === 'nearby' ? nearby : chain).push([i, it]));

  return `
    <div class="district-section">
      <div class="district-section-head">
        <div class="district-section-head-text">
          <div class="district-section-title">Кэшбэк вокруг вас</div>
          <div class="district-section-loc">${ICONS.pin}${esc(cat.nearbyStreet)}</div>
        </div>
      </div>
      <div class="offer-list">${nearby.map(([i, it]) => districtNearbyItemHTML(i, it)).join('')}</div>
    </div>
    <div class="district-section">
      <div class="district-section-head district-section-head-row">
        <div class="district-section-head-text">
          <div class="district-section-title">${esc(cat.chainLabel)}</div>
          <div class="district-section-loc">${ICONS.pin}${esc(cat.chainStreet)}</div>
        </div>
        <img class="district-chain-avatar" src="${cat.chainAvatar}" alt="">
      </div>
      <div class="offer-grid">${chain.map(([i, it]) => offerCardHTML(0, i, it)).join('')}</div>
    </div>
  `;
}

function renderOffers(root, stepIndex, animate) {
  const wrap = root.querySelector('#offersWrap');
  const cat = CATEGORIES[stepIndex];
  const shown = cat.items.slice(0, OFFERS_SHOWN_LIMIT);

  if (cat.id === 'district') {
    wrap.innerHTML = renderDistrictHTML(cat);
  } else if (!cat.items.length) {
    wrap.innerHTML = `<div class="favorites-empty">Раздел в разработке — скоро здесь появятся предложения</div>`;
  } else if (cat.type === 'list') {
    wrap.innerHTML = `<div class="offer-list">${shown.map((it, i) => offerListItemHTML(stepIndex, i, it)).join('')}</div>`;
  } else {
    wrap.innerHTML = `<div class="offer-grid">${shown.map((it, i) => offerCardHTML(stepIndex, i, it)).join('')}</div>`;
  }

  if (cat.moreNote) {
    wrap.insertAdjacentHTML('beforeend', `<div class="offers-more-note">${esc(cat.moreNote)}</div>`);
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

  if (cashbackRoot && state.step === stepIndex) {
    const rowBtn = cashbackRoot.querySelector(`#offersWrap .heart-btn[data-idx="${idx}"]`);
    if (rowBtn) rowBtn.classList.toggle('liked', liked);
  }
  if (navHeartOfferCtx && navHeartOfferCtx.stepIndex === stepIndex && navHeartOfferCtx.idx === idx) {
    document.getElementById('navHeart').classList.toggle('liked', liked);
  }
  if (cashbackRoot) updateBottomCaption(cashbackRoot, true);
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
  btn.textContent = cat.nextLabel ? ('Дальше ' + cat.nextLabel) : 'Собрать мою подборку';
}

const DEFAULT_CAPTION = 'Можно выбрать без ограничений';

function bottomCaptionText() {
  if (state.step === CATEGORIES.length - 1) return 'Почти готово — осталось собрать подборку';
  const count = totalLikedCount();
  if (count === 0) return DEFAULT_CAPTION;
  const word = pluralizeRu(count, 'предложение', 'предложения', 'предложений');
  return `Уже сохранили ${count} ${word}`;
}

function updateBottomCaption(root, animate) {
  const wrap = root.querySelector('#bottomCaptionWrap');
  const newText = bottomCaptionText();
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
  if (scrollEl.scrollTop < 1) return; // пользователь не скроллил — оставляем как есть
  const headline = root.querySelector('.headline-block');
  const navbar = document.getElementById('globalNavbar');
  const target = Math.max(0, staticOffsetTopWithin(headline, scrollEl) - navbar.offsetHeight);
  scrollEl.scrollTo({ top: target, behavior: 'smooth' });
}

const SUCCESS_HEADLINE = { headline: 'Заглядывайте<br>перед покупкой', headlineSub: 'Новые акции появляются каждый день' };

function currentHeadlineData() {
  return state.successMode ? SUCCESS_HEADLINE : CATEGORIES[state.step];
}

function headlinePaneHTML(cat) {
  return `
    <div class="headline">${cat.headline}</div>
    <div class="headline-sub">${esc(cat.headlineSub)}</div>
  `;
}

function updateHeadline(root, animate) {
  const cat = currentHeadlineData();
  const wrap = root.querySelector('.headline-content');
  const panes = wrap.querySelectorAll('.headline-pane');
  const current = panes[panes.length - 1];

  if (current && current.dataset.text === cat.headline) return;

  // при быстром переключении могли остаться панели, не успевшие доиграть
  // прошлый переход — убираем их сразу, иначе на элементе одновременно
  // окажутся классы slide-in-up и slide-out-up и каскад перепутает анимации
  for (let i = 0; i < panes.length - 1; i++) panes[i].remove();

  const next = document.createElement('div');
  next.className = 'headline-pane';
  next.dataset.text = cat.headline;
  next.innerHTML = headlinePaneHTML(cat);

  if (!animate || !current) {
    wrap.innerHTML = '';
    wrap.appendChild(next);
    return;
  }

  current.classList.remove('slide-in-up');
  void current.offsetWidth;
  current.classList.add('slide-out-up');
  current.addEventListener('animationend', () => current.remove(), { once: true });

  next.classList.add('slide-in-up');
  wrap.appendChild(next);
}

function advanceToStep(root) {
  updateProgress(root);
  updateChipsActive(root);
  scrollActiveChipIntoView(root);
  renderOffers(root, state.step, true);
  updateNextBtn(root);
  updateBottomCaption(root, true);
  updateHeadline(root, true);
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
    enterSuccessMode(root);
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
  cashbackNavbarUpdate = bindNavbarScroll(scrollEl, () => scrollEl.scrollTop > 0);
}

function mountCashbackScreen(root) {
  cashbackRoot = root;

  buildChipsRow(root);
  renderNovTile(root);
  buildOctAvatars(root);
  updateProgress(root);
  updateNextBtn(root);
  updateBottomCaption(root);
  updateHeadline(root, false);
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

  root.querySelector('#pickSeeAll').addEventListener('click', () => {
    haptic(8);
    openFavoritesScreen();
  });
  root.querySelector('#pickMoreBtn').addEventListener('click', () => {
    haptic(10);
    exitSuccessMode(root);
  });
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
  navbar.classList.remove('hide-heart');
  document.getElementById('navbarTitle').style.display = 'none';
  navHeartOfferCtx = { stepIndex, idx };
  navHeart.innerHTML = ICONS.heart;
  navHeart.classList.remove('pop');
  navHeart.classList.toggle('liked', state.likes[stepIndex].has(idx));

  navbar.classList.remove('solid');

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
  const navHeart = document.getElementById('navHeart');
  navHeart.classList.remove('liked', 'pop', 'pulse');
  navHeart.innerHTML = ICONS.heartFilled;
  popScreen();

  const top = screens[screens.length - 1];
  const navbar = document.getElementById('globalNavbar');
  const title = document.getElementById('navbarTitle');
  if (top && top.el.classList.contains('screen-favorites')) {
    navbar.classList.add('hide-progress', 'hide-heart');
    title.style.display = 'flex';
    if (favoritesNavbarUpdate) favoritesNavbarUpdate();
    if (favoritesRoot) renderFavoritesContent(favoritesRoot, false);
  } else {
    navbar.classList.toggle('hide-progress', state.successMode);
    navbar.classList.remove('hide-heart');
    title.style.display = 'none';
    if (cashbackNavbarUpdate) cashbackNavbarUpdate();
  }
}

/* ============================== экран избранного ============================== */

function favoritesEntries() {
  const entries = [];
  CATEGORIES.forEach((cat, stepIndex) => {
    cat.items.forEach((it, idx) => {
      if (state.likes[stepIndex].has(idx)) entries.push({ stepIndex, idx, item: it, type: cat.type });
    });
  });
  return entries;
}

const RECOMMEND_LIMIT = 6;

// Кандидаты на "Рекомендуем вам": непролайканные офферы. При фильтре по
// конкретной категории — рекомендации только из неё; при "Все" — вперемешку
// по кругу из каждой категории, чтобы раздел не был однобоким.
function recommendedEntries(filterStep, limit) {
  limit = limit || RECOMMEND_LIMIT;
  const cats = filterStep === null ? CATEGORIES : [CATEGORIES[filterStep]];
  const perCat = cats.map((cat) => {
    const stepIndex = CATEGORIES.indexOf(cat);
    return cat.items
      .map((it, idx) => ({ stepIndex, idx, item: it, type: cat.type }))
      .filter((e) => !state.likes[stepIndex].has(e.idx));
  });

  if (filterStep !== null) return perCat[0].slice(0, limit);

  const result = [];
  for (let i = 0; result.length < limit && perCat.some((arr) => i < arr.length); i++) {
    perCat.forEach((arr) => {
      if (result.length < limit && arr[i]) result.push(arr[i]);
    });
  }
  return result;
}

function buildFavoritesScreen() {
  const el = document.createElement('div');
  el.className = 'screen screen-favorites';
  el.innerHTML = `
    <div class="dim"></div>
    <div class="scroll" id="favoritesScroll">
      <div class="navbar-spacer"></div>
      <div class="chips-sticky-wrap"><div class="chips-row" id="favoritesChipsRow"></div></div>
      <div class="offers-wrap" id="favoritesWrap"></div>
      <div class="scroll-bottom-spacer"></div>
    </div>
  `;
  return el;
}

function renderFavoritesContent(root, animate) {
  const wrap = root.querySelector('#favoritesWrap');
  const all = favoritesEntries();
  const entries = favoritesFilterStep === null ? all : all.filter((e) => e.stepIndex === favoritesFilterStep);
  const listEntries = entries.filter((e) => e.type === 'list');
  const gridEntries = entries.filter((e) => e.type !== 'list');

  let likedHtml = '';
  if (!entries.length) {
    likedHtml = `<div class="favorites-empty">Пока нет избранных предложений</div>`;
  } else {
    if (listEntries.length) likedHtml += `<div class="offer-list">${listEntries.map((e) => offerListItemHTML(e.stepIndex, e.idx, e.item)).join('')}</div>`;
    if (gridEntries.length) likedHtml += `<div class="offer-grid">${gridEntries.map((e) => offerCardHTML(e.stepIndex, e.idx, e.item)).join('')}</div>`;
  }

  const recEntries = recommendedEntries(favoritesFilterStep);
  const recListEntries = recEntries.filter((e) => e.type === 'list');
  const recGridEntries = recEntries.filter((e) => e.type !== 'list');
  const recHtml = recEntries.length ? `
    <div class="fav-recommend">
      <div class="fav-recommend-title">Рекомендуем вам</div>
      ${recListEntries.length ? `<div class="offer-list">${recListEntries.map((e) => offerListItemHTML(e.stepIndex, e.idx, e.item)).join('')}</div>` : ''}
      ${recGridEntries.length ? `<div class="offer-grid">${recGridEntries.map((e) => offerCardHTML(e.stepIndex, e.idx, e.item)).join('')}</div>` : ''}
    </div>
  ` : '';

  wrap.innerHTML = `<div class="fav-liked-wrap">${likedHtml}</div>${recHtml}`;

  const likedOrder = listEntries.concat(gridEntries);
  const likedWrap = wrap.querySelector('.fav-liked-wrap');
  likedWrap.querySelectorAll('.heart-btn').forEach((btn, i) => {
    const { stepIndex, idx } = likedOrder[i];
    btn.classList.add('liked');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setOfferLiked(stepIndex, idx, false);
      haptic(8);
      renderFavoritesContent(root, false);
    });
  });
  likedWrap.querySelectorAll('.offer-item, .offer-card').forEach((el, i) => {
    const { stepIndex, idx } = likedOrder[i];
    el.addEventListener('click', () => openOfferScreen(stepIndex, idx));
  });

  const recOrder = recListEntries.concat(recGridEntries);
  const recWrap = wrap.querySelector('.fav-recommend');
  if (recWrap) {
    recWrap.querySelectorAll('.heart-btn').forEach((btn, i) => {
      const { stepIndex, idx } = recOrder[i];
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOfferLiked(stepIndex, idx, true);
        haptic([10, 20, 10]);
        renderFavoritesContent(root, false);
      });
    });
    recWrap.querySelectorAll('.offer-item, .offer-card').forEach((el, i) => {
      const { stepIndex, idx } = recOrder[i];
      el.addEventListener('click', () => openOfferScreen(stepIndex, idx));
    });
  }

  if (animate) triggerAnim(wrap);
}

function buildFavoritesChipsRow(root) {
  const row = root.querySelector('#favoritesChipsRow');
  const labels = ['Все', ...CATEGORIES.map((c) => c.label)];
  row.innerHTML = labels.map((label, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" data-step="${i - 1}">${esc(label)}</button>`
  ).join('');
  row.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const stepAttr = parseInt(chip.dataset.step, 10);
      const next = stepAttr === -1 ? null : stepAttr;
      if (next === favoritesFilterStep) return;
      haptic(8);
      row.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      favoritesFilterStep = next;
      renderFavoritesContent(root, true);
    });
  });
}

function mountFavoritesScreen(root) {
  favoritesRoot = root;
  favoritesFilterStep = null;

  buildFavoritesChipsRow(root);
  renderFavoritesContent(root, false);

  const navbar = document.getElementById('globalNavbar');
  navbar.classList.add('solid');
  favoritesNavbarUpdate = () => navbar.classList.add('solid');

  setTimeout(() => root.querySelector('.chips-row').classList.add('anim-in'), 60);
  setTimeout(() => root.querySelector('#favoritesWrap').classList.add('anim-in'), 140);
}

function openFavoritesScreen() {
  favoritesRoot = null;
  const el = buildFavoritesScreen();
  pushScreen(el);
  mountFavoritesScreen(el);

  const navbar = document.getElementById('globalNavbar');
  navbar.classList.add('hide-progress', 'hide-heart');
  const title = document.getElementById('navbarTitle');
  title.textContent = 'Избранное';
  title.style.display = 'flex';
}

function closeFavoritesScreen() {
  favoritesRoot = null;
  popScreen();

  const navbar = document.getElementById('globalNavbar');
  document.getElementById('navbarTitle').style.display = 'none';
  navbar.classList.toggle('hide-progress', state.successMode);
  navbar.classList.remove('hide-heart');
  if (cashbackNavbarUpdate) cashbackNavbarUpdate();
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
    <div class="picker-scroll" id="pickerScroll">
      <div class="picker-title">Выбери категории<br>с доп. кэшбэком</div>
      <div class="picker-sub">Выбери ${PICKER_MAX} категории — кэшбэк по ним будет повышен весь ноябрь</div>
      <div class="picker-list" id="pickerGrid"></div>
    </div>
    <div class="bottom-fixed">
      <button class="btn-primary picker-hide" id="pickerDone">Выбрать</button>
    </div>
  `;
  return el;
}

function updatePickerDoneState(root) {
  root.querySelector('#pickerDone').classList.toggle('picker-hide', pickerSelected.size < PICKER_MAX);
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
    if (pickerSelected.size !== PICKER_MAX) return;
    haptic([10, 30, 10]);
    state.novemberChosen = true;
    state.novemberCategories = Array.from(pickerSelected);
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

function pickCardHTML(stepIndex, idx, it) {
  return `
    <div class="pick-card" data-step="${stepIndex}" data-idx="${idx}">
      <div class="pick-card-box">
        <img class="pick-card-icon" src="${it.icon}" alt="" loading="lazy">
        <button class="heart-btn pick-card-heart liked" aria-label="Убрать из избранного">${ICONS.heart}</button>
        <div class="pick-card-text">
          <div class="pick-card-stat">
            <div class="pick-card-percent">${esc(it.percent)}</div>
            <div class="pick-card-cb-label">Кэшбэк</div>
          </div>
          <div class="pick-card-meta">
            <div>${esc(it.until || UNTIL_TEXT)}</div>
            ${it.expiration ? `<div>${esc(it.expiration)}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPickRow(root) {
  const section = root.querySelector('#pickSection');
  const row = root.querySelector('#pickRow');
  const rowCompact = root.querySelector('#pickRowCompact');
  const entries = favoritesEntries();

  if (!entries.length) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  // 1-2 выбранных оффера показываем строчным списком (как в избранном),
  // от 3 и больше — горизонтальной прокруткой карточек.
  if (entries.length <= 2) {
    row.style.display = 'none';
    row.innerHTML = '';
    rowCompact.style.display = 'block';
    const listEntries = entries.filter((e) => e.type === 'list');
    const gridEntries = entries.filter((e) => e.type !== 'list');
    rowCompact.innerHTML = [
      listEntries.length ? `<div class="offer-list">${listEntries.map((e) => offerListItemHTML(e.stepIndex, e.idx, e.item)).join('')}</div>` : '',
      gridEntries.length ? `<div class="offer-grid">${gridEntries.map((e) => offerCardHTML(e.stepIndex, e.idx, e.item)).join('')}</div>` : '',
    ].join('');

    const order = listEntries.concat(gridEntries);
    rowCompact.querySelectorAll('.heart-btn').forEach((btn, i) => {
      const { stepIndex, idx } = order[i];
      btn.classList.add('liked');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOfferLiked(stepIndex, idx, false);
        haptic(8);
        renderPickRow(root);
      });
    });
    rowCompact.querySelectorAll('.offer-item, .offer-card').forEach((el, i) => {
      const { stepIndex, idx } = order[i];
      el.addEventListener('click', () => openOfferScreen(stepIndex, idx));
    });
    return;
  }

  rowCompact.style.display = 'none';
  rowCompact.innerHTML = '';
  row.style.display = '';
  row.innerHTML = entries.map((e) => pickCardHTML(e.stepIndex, e.idx, e.item)).join('');

  row.querySelectorAll('.pick-card-heart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.pick-card');
      const stepIndex = parseInt(card.dataset.step, 10);
      const idx = parseInt(card.dataset.idx, 10);
      setOfferLiked(stepIndex, idx, false);
      haptic(8);
      renderPickRow(root);
    });
  });

  row.querySelectorAll('.pick-card').forEach((card) => {
    card.addEventListener('click', () => {
      openOfferScreen(parseInt(card.dataset.step, 10), parseInt(card.dataset.idx, 10));
    });
  });
}

function enterSuccessMode(root) {
  state.successMode = true;
  haptic([10, 50, 10, 50, 20]);

  root.querySelector('.headline-block').style.display = 'none';
  root.querySelector('#chipsStickyWrap').style.display = 'none';
  root.querySelector('#offersWrap').style.display = 'none';
  root.querySelector('#scrollBottomSpacer').style.display = 'none';
  root.querySelector('#bottomFixed').style.display = 'none';
  root.querySelector('#codWrap').style.display = '';
  root.querySelector('#pickSubheadline').style.display = '';
  root.querySelector('#successBottomSpacer').style.display = '';
  root.querySelector('#cbScroll').scrollTop = 0;

  const navbar = document.getElementById('globalNavbar');
  navbar.classList.add('hide-progress');
  navbar.classList.remove('hide-heart');

  renderPickRow(root);

  setTimeout(() => root.querySelector('#pickSection').classList.add('anim-in'), 90);
  setTimeout(() => root.querySelector('#codWrap').classList.add('anim-in'), 130);
  setTimeout(() => root.querySelector('#pickSubheadline').classList.add('anim-in'), 160);

  clearTimeout(codProgressTimer);
  const firstStepFill = root.querySelector('#codProgress .cod-progress-step-fill');
  if (firstStepFill) {
    firstStepFill.classList.remove('filled');
    codProgressTimer = setTimeout(() => firstStepFill.classList.add('filled'), 1500);
  }
}

function exitSuccessMode(root) {
  state.successMode = false;
  haptic(8);

  clearTimeout(codProgressTimer);
  const firstStepFill = root.querySelector('#codProgress .cod-progress-step-fill');
  if (firstStepFill) firstStepFill.classList.remove('filled');

  root.querySelector('#pickSection').classList.remove('anim-in');
  root.querySelector('#codWrap').classList.remove('anim-in');
  root.querySelector('#pickSubheadline').classList.remove('anim-in');
  root.querySelector('#codWrap').style.display = 'none';
  root.querySelector('#pickSubheadline').style.display = 'none';
  root.querySelector('#successBottomSpacer').style.display = 'none';
  root.querySelector('.headline-block').style.display = '';
  root.querySelector('#chipsStickyWrap').style.display = '';
  root.querySelector('#offersWrap').style.display = '';
  root.querySelector('#scrollBottomSpacer').style.display = '';
  root.querySelector('#bottomFixed').style.display = '';

  const navbar = document.getElementById('globalNavbar');
  navbar.classList.remove('hide-progress', 'hide-heart');

  updateHeadline(root, true);
  updateNextBtn(root);
  updateBottomCaption(root, true);
}

/* ============================== глобальный апп-бар ============================== */

function buildGlobalNavbar() {
  const el = document.createElement('div');
  el.className = 'navbar';
  el.id = 'globalNavbar';
  el.style.visibility = 'hidden';
  el.style.pointerEvents = 'none';
  el.innerHTML = `
    <button class="glass-pill nav-back" id="gnbBack" aria-label="Назад">${ICONS.chevronLeft}</button>
    <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
    <div class="navbar-title" id="navbarTitle"></div>
    <button class="glass-pill nav-heart" id="navHeart" aria-label="Избранное">${ICONS.heartFilled}</button>
  `;
  document.getElementById('app').appendChild(el);

  el.querySelector('#gnbBack').addEventListener('click', () => {
    haptic(8);
    const top = screens[screens.length - 1];
    if (top && top.el.classList.contains('screen-offer')) {
      closeOfferScreen();
    } else if (top && top.el.classList.contains('screen-favorites')) {
      closeFavoritesScreen();
    } else if (top && top.el.classList.contains('screen-cashback') && state.successMode) {
      popToRoot();
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
      openFavoritesScreen();
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
