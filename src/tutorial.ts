import { t, type Lang } from './i18n';
import { hasDoneTutorial, markTutorialDone } from './storage';

export function maybeShowTutorial(lang: Lang, onDone: () => void): void {
  if (hasDoneTutorial()) { onDone(); return; }

  const overlay = document.getElementById('tutorial')!;
  const tr = t(lang);
  document.getElementById('tutTitle')!.textContent = tr.tutTitle;
  document.getElementById('tut1')!.textContent     = tr.tut1;
  document.getElementById('tut2')!.textContent     = tr.tut2;
  document.getElementById('tut3')!.textContent     = tr.tut3;
  document.getElementById('tut4')!.textContent     = tr.tut4;
  document.getElementById('tut5')!.textContent     = tr.tut5;
  document.getElementById('tutBtn')!.textContent   = tr.tutBtn;

  overlay.hidden = false;

  const dismiss = (): void => {
    overlay.hidden = true;
    markTutorialDone();
    onDone();
  };

  document.getElementById('tutBtn')!.addEventListener('click', dismiss);
  overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });
}
