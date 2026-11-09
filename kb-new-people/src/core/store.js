// Состояние пользователя. Всё, что здесь лежит, переживает перезагрузку (localStorage).
// Временное состояние экранов (скролл, шаг тура, подсказки) хранится в самих экранах.

const KEY = 'kb-new-people:v1';

const initial = () => ({
  favBrands: [],          // id брендов в порядке добавления
  pk: null,               // { categories: [id], rating: 1..5, month }
  onboarding: {},         // { s1: { done: true }, s2: {...} }
  streak: { day1: false },
  tour: { s3: false, s4: false, s5: false },
  boost: null,            // { brandId, offerId } — повышенный кэшбэк, засчитан после «Включить уведомления»
});

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    return { ...initial(), ...JSON.parse(raw) };
  } catch {
    return initial();
  }
}

let state = read();
const listeners = new Set();

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* приватный режим или переполнение — работаем в памяти */
  }
}

function emit(change) {
  for (const fn of listeners) fn(state, change);
}

export const store = {
  get state() {
    return state;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  isFav(brandId) {
    return state.favBrands.includes(brandId);
  },

  hasAnyFav() {
    return state.favBrands.length > 0;
  },

  // Лайк засчитывается бренду целиком.
  toggleFav(brandId) {
    const liked = !this.isFav(brandId);
    state = {
      ...state,
      favBrands: liked ? [...state.favBrands, brandId] : state.favBrands.filter((id) => id !== brandId),
    };
    write();
    emit({ type: 'fav', brandId, liked });
    return liked;
  },

  setPk(pk) {
    state = { ...state, pk };
    write();
    emit({ type: 'pk' });
  },

  setBoost(boost) {
    state = { ...state, boost };
    write();
    emit({ type: 'boost' });
  },

  completeOnboarding(scenario) {
    state = { ...state, onboarding: { ...state.onboarding, [scenario]: { done: true } } };
    write();
    emit({ type: 'onboarding', scenario });
  },

  markStreakDay() {
    if (state.streak.day1) return;
    state = { ...state, streak: { day1: true } };
    write();
    emit({ type: 'streak' });
  },

  completeTour(scenario) {
    state = { ...state, tour: { ...state.tour, [scenario]: true } };
    write();
    emit({ type: 'tour', scenario });
  },

  reset() {
    state = initial();
    write();
    emit({ type: 'reset' });
  },
};
