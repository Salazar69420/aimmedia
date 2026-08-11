/**
 * AIM Media — Booking Funnel (/book)
 * Typeform-style one-question-at-a-time flow. No-ops on any other page.
 */
(function () {
  const app = document.getElementById('quiz-app');
  if (!app) return;

  const steps = Array.from(app.querySelectorAll('.qz-stage .qz-step'));
  const progressFill = app.querySelector('.qz-progress-fill');
  const stepCurrentEl = app.querySelector('.qz-step-current');
  const stepTotalEl = app.querySelector('.qz-step-total');
  const backBtn = document.getElementById('qz-back');
  const nextBtn = document.getElementById('qz-next');
  const slotsContainer = document.getElementById('qz-slots');
  const hp = document.getElementById('qz-hp');

  const answers = {};
  let current = 0;

  // ── Build the preferred-time chips from "today", client-side, so the
  // page is never stale between rebuilds. Skips weekends.
  function buildSlots() {
    if (!slotsContainer) return;
    const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const blocks = ['Morning · 9am–12pm', 'Afternoon · 12–4pm', 'Evening · 4–6pm'];
    const d = new Date();
    let added = 0;
    while (added < 4) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      added++;
      const label = dayFmt.format(d);
      blocks.forEach(block => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'qz-option';
        const value = `${label} · ${block}`;
        btn.dataset.value = value;
        btn.textContent = value;
        btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        btn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        slotsContainer.appendChild(btn);
      });
    }
  }

  function stepIsValid(stepEl) {
    const optGroup = stepEl.querySelector('.qz-options[data-type="single"]');
    if (optGroup && !optGroup.querySelector('.qz-selected')) return false;
    const required = stepEl.querySelectorAll('.qz-input[required]');
    for (const inp of required) if (!inp.value.trim()) return false;
    if (stepEl.contains(slotsContainer) && slotsContainer) {
      if (slotsContainer.querySelectorAll('.qz-selected').length === 0) return false;
    }
    return true;
  }

  function shake(el) {
    el.classList.add('qz-shake');
    setTimeout(() => el.classList.remove('qz-shake'), 400);
  }

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle('qz-active', idx === i));
    if (progressFill) progressFill.style.width = `${((i + 1) / steps.length) * 100}%`;
    if (stepCurrentEl) stepCurrentEl.textContent = String(i + 1);
    if (backBtn) backBtn.style.display = i === 0 ? 'none' : '';

    const stepEl = steps[i];
    const optGroup = stepEl.querySelector('.qz-options[data-type="single"]');
    const isAuto = optGroup && optGroup.dataset.auto === 'true';
    if (nextBtn) {
      nextBtn.style.display = isAuto ? 'none' : '';
      nextBtn.textContent = i === steps.length - 1 ? 'Submit →' : 'Next →';
      nextBtn.disabled = !stepIsValid(stepEl);
    }

    const firstInput = stepEl.querySelector('.qz-input');
    if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 350);
  }

  function goNext() {
    const stepEl = steps[current];
    if (!stepIsValid(stepEl)) {
      shake(nextBtn);
      return;
    }
    if (current === steps.length - 1) {
      submitQuiz();
      return;
    }
    current++;
    showStep(current);
  }

  function goBack() {
    if (current === 0) return;
    current--;
    showStep(current);
  }

  function updateNextState() {
    if (!nextBtn) return;
    nextBtn.disabled = !stepIsValid(steps[current]);
  }

  function showDone() {
    app.querySelector('.qz-stage').style.display = 'none';
    app.querySelector('.qz-nav').style.display = 'none';
    app.querySelector('.qz-progress').style.display = 'none';
    app.querySelector('.qz-progress-label').style.display = 'none';
    const nameEl = document.getElementById('qz-done-name');
    if (nameEl && answers.name) nameEl.textContent = `, ${answers.name.split(' ')[0]}`;
    document.getElementById('qz-done').classList.add('qz-panel-active');
  }

  function showError() {
    document.getElementById('qz-error').classList.add('qz-panel-active');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Submit →';
    }
  }

  function submitQuiz() {
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Sending…';
    }
    answers.slots = slotsContainer
      ? Array.from(slotsContainer.querySelectorAll('.qz-selected')).map(b => b.dataset.value)
      : [];
    answers.source = 'book';
    answers.submittedAt = new Date().toISOString();

    // Honeypot: bots fill hidden fields. Pretend to succeed, send nothing.
    if (hp && hp.value.trim()) {
      setTimeout(showDone, 500);
      return;
    }

    fetch(app.dataset.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
      .then(res => {
        if (!res.ok) throw new Error('Request failed');
        return res.json().catch(() => ({}));
      })
      .then(showDone)
      .catch(showError);
  }

  function init() {
    if (stepTotalEl) stepTotalEl.textContent = String(steps.length);
    buildSlots();

    app.querySelectorAll('.qz-options[data-type="single"]').forEach(group => {
      group.addEventListener('click', e => {
        const btn = e.target.closest('.qz-option');
        if (!btn || !group.contains(btn)) return;
        group.querySelectorAll('.qz-option').forEach(o => o.classList.remove('qz-selected'));
        btn.classList.add('qz-selected');
        answers[group.dataset.field] = btn.dataset.value;
        updateNextState();
        if (group.dataset.auto === 'true') setTimeout(goNext, 320);
      });
    });

    if (slotsContainer) {
      slotsContainer.addEventListener('click', e => {
        const btn = e.target.closest('.qz-option');
        if (!btn || !slotsContainer.contains(btn)) return;
        const max = parseInt(slotsContainer.dataset.max, 10) || 2;
        const selectedCount = slotsContainer.querySelectorAll('.qz-selected').length;
        if (btn.classList.contains('qz-selected')) {
          btn.classList.remove('qz-selected');
        } else {
          if (selectedCount >= max) {
            shake(btn);
            return;
          }
          btn.classList.add('qz-selected');
        }
        updateNextState();
      });
    }

    app.querySelectorAll('.qz-input[data-field]').forEach(inp => {
      inp.addEventListener('input', () => {
        answers[inp.dataset.field] = inp.value.trim();
        updateNextState();
      });
    });

    if (backBtn) backBtn.addEventListener('click', goBack);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    app.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
      e.preventDefault();
      goNext();
    });

    showStep(0);
  }

  init();
})();
