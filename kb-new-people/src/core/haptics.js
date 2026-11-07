// Единый адаптер тактильного отклика.
// Android / Chrome: Vibration API. iOS Safari 17.4+: системный тик переключателя <input type="checkbox" switch>.
// Если ничего не поддерживается — вызовы просто ничего не делают, визуальная обратная связь остаётся.

const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const canVibrate = typeof navigator.vibrate === 'function' && !isIOS;

let switchLabel = null;
let enabled = true;

function iosSwitch() {
  if (switchLabel) return switchLabel;
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  switchLabel = document.createElement('label');
  switchLabel.setAttribute('aria-hidden', 'true');
  switchLabel.style.cssText = 'position:fixed;left:-100px;top:-100px;width:1px;height:1px;opacity:0;pointer-events:none;';
  switchLabel.append(input);
  document.body.append(switchLabel);
  return switchLabel;
}

function tick() {
  if (!enabled) return;
  if (canVibrate) return;
  if (isIOS) iosSwitch().click();
}

function vibrate(pattern) {
  if (!enabled) return;
  if (canVibrate) {
    try { navigator.vibrate(pattern); } catch { /* нет поддержки */ }
  } else if (isIOS) {
    tick();
  }
}

export const haptics = {
  // Поддерживается ли хоть какой-то механизм на этом устройстве.
  get supported() {
    return canVibrate || isIOS;
  },
  get mechanism() {
    if (canVibrate) return 'vibration-api';
    if (isIOS) return 'ios-switch';
    return 'none';
  },
  setEnabled(value) {
    enabled = !!value;
  },
  // Выбор значения: лайк, чипс, звезда, категория.
  selection() {
    vibrate(8);
  },
  // Лёгкий отклик на важное подтверждение.
  light() {
    vibrate(12);
  },
  // Успешное завершение (два коротких тика).
  success() {
    vibrate([10, 60, 14]);
    if (isIOS && enabled) setTimeout(tick, 90);
  },
  // Недоступное действие.
  warning() {
    vibrate([20, 40, 20]);
  },
};
