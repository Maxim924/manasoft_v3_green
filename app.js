const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const menuButton = $('.menu-button');
const sidebar = $('#sidebar');
const scrim = $('.scrim');
function toggleMenu(open) {
  sidebar.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menuButton.textContent = open ? '×' : '☰';
  scrim.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  sidebar.inert = !open;
}
menuButton.addEventListener('click', () => toggleMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click', () => { toggleMenu(false); menuButton.focus({ preventScroll: true }); });
$$('a[href^="#"]', sidebar).forEach(link => link.addEventListener('click', () => { toggleMenu(false); menuButton.focus({ preventScroll: true }); }));
matchMedia('(max-width: 700px)').addEventListener('change', () => toggleMenu(false));
toggleMenu(false);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) { toggleMenu(false); menuButton.focus(); }
  if (event.key === 'Tab' && sidebar.classList.contains('open')) {
    const links = $$('a', sidebar).filter(el => el.getClientRects().length);
    if (!links.length) return;
    if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); links.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuButton.focus(); }
  }
});
if ('IntersectionObserver' in window) {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js-motion');
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); }
    }), { threshold: 0.08 });
    $$('.reveal').forEach(el => reveals.observe(el));

    const process = $('#approach .process-grid');
    if (process) {
      const steps = $$(':scope > article', process);
      const inViewThreshold = .15;
      const processReveal = new IntersectionObserver(entries => {
        const entering = new Set(entries.filter(entry => entry.intersectionRatio >= inViewThreshold).map(entry => entry.target));
        steps.filter(step => entering.has(step)).forEach((step, index) => {
          step.style.setProperty('--process-delay', `${index * 180}ms`);
          step.classList.add('step-in-view');
          processReveal.unobserve(step);
        });
      }, { threshold: inViewThreshold });
      process.classList.add('process-reveal');
      steps.forEach(step => processReveal.observe(step));
    }
  }
  const sectionLinks = $$('.nav-link[href^="#"]', sidebar);
  if (sectionLinks.length > 1) {
    const navigation = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) sectionLinks.forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    sectionLinks.forEach(link => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) navigation.observe(section);
    });
  }
}
const integration = $('#ecosystem .integration');
const integrationCards = integration ? $$(':scope > div', integration) : [];
if (integrationCards.length && Element.prototype.animate) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const bounceDuration = 260;
  let bounceWave;
  async function startBounceWave(event) {
    if (event.pointerType !== 'mouse' || reduceMotion.matches || bounceWave) return;
    integrationCards.forEach(card => card.classList.remove('integration-lit'));
    bounceWave = integrationCards.map((card, index) => card.animate([
      { transform: 'translateY(0)', easing: 'ease-out' },
      { transform: 'translateY(-8px)', offset: .45, easing: 'ease-in' },
      { transform: 'translateY(0)' }
    ], { duration: bounceDuration, delay: index * bounceDuration }));
    await Promise.allSettled(bounceWave.map((jump, index) => jump.finished.then(() => {
      if (!reduceMotion.matches) integrationCards[index].classList.add('integration-lit');
    })));
    bounceWave = undefined;
  }
  integrationCards.forEach(card => card.addEventListener('pointerenter', startBounceWave));
  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) bounceWave?.forEach(animation => animation.cancel());
  });
}
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('selected', active); item.setAttribute('aria-pressed', String(active)); });
  $$('.service-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; });
}));
const services = {
  implementation: { title: 'Внедрение и доработка 1С', description: 'Адаптируем 1С:Предприятие под процессы вашей компании — от учёта до интеграций.', items: ['Перенос начальных данных и запуск системы', 'Новые отчёты, формы и автоматизация операций', 'Интеграция с внешними системами', 'Обучение сотрудников'], path: '/promotion/vnedrenie_1s_predpriyatie/' },
  support: { title: 'Сопровождение 1С', description: 'Комплексная поддержка программных продуктов 1С для стабильной и актуальной работы.', items: ['Обновление конфигураций и устранение сбоев', 'Настройка и адаптация под новые задачи', 'Резервное копирование и восстановление', 'Консультации и обучение пользователей'], path: '/promotion/soprovozhdenie_1s_predpriyatie/' },
  crm: { title: 'Внедрение Битрикс24', description: 'Объединяем работу с клиентами, сотрудниками, документами и задачами в едином цифровом пространстве.', items: ['Настройка CRM под процессы продаж', 'Задачи и коммуникации команды', 'Интеграция с 1С:Предприятие', 'Сопровождение и развитие системы'], path: '/bitrix24/' },
  equipment: { title: 'Оборудование для торговли и склада', description: 'Подбираем, подключаем и интегрируем оборудование в единую систему учёта.', items: ['Терминалы сбора данных и сканеры штрихкодов', 'Принтеры этикеток и онлайн-кассы', 'Оборудование и ПО для маркированных товаров', 'Автоматизация склада на базе Клеверенс'], path: '/design/' }
};
let selectedService;
function openDialog(dialog) { dialog.showModal(); document.body.classList.add('dialog-open'); }
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close(); });
});
$$('[data-service]').forEach(button => button.addEventListener('click', () => {
  selectedService = services[button.dataset.service];
  if (!selectedService) return;
  $('#detail-title').textContent = selectedService.title;
  $('#detail-description').textContent = selectedService.description;
  $('#detail-list').replaceChildren(...selectedService.items.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  $('#detail-source').href = document.documentElement.dataset.static === 'true' ? (document.documentElement.dataset.root || './') + selectedService.path.replace(/^\//, '') + 'index.html' : `?page=${encodeURIComponent(selectedService.path)}`;
  $('#detail-source').removeAttribute('target');
  $('#detail-source').textContent = 'Подробнее об услуге ↗';
  $('#detail-dialog').setAttribute('aria-labelledby', 'detail-title');
  openDialog($('#detail-dialog'));
}));
$('#discuss-service').addEventListener('click', () => {
  $('#detail-dialog').close();
  $('#contact-form [name="message"]').value = `Интересует ${selectedService.title.toLowerCase()}. `;
  location.hash = 'contact';
  $('#contact-form [name="name"]').focus({ preventScroll: true });
});
$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  for (const input of $$('input, textarea', form)) {
    input.setCustomValidity(input.value.trim() ? '' : 'Пожалуйста, заполните поле.');
    if (!input.reportValidity()) return;
  }
  const data = new FormData(form);
  $('#request-text').value = `Здравствуйте, Manasoft!\n\nМеня зовут ${data.get('name').trim()}.\nКонтакт: ${data.get('contact').trim()}\n\nЗадача: ${data.get('message').trim()}`;
  $('#copy-status').textContent = '';
  openDialog($('#request-dialog'));
});
$$('input, textarea', $('#contact-form')).forEach(input => input.addEventListener('input', () => input.setCustomValidity('')));
$('#copy-request').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#request-text').value); $('#copy-status').textContent = 'Текст скопирован. Отправьте его через контакты компании.'; }
  catch { $('#request-text').focus(); $('#request-text').select(); $('#copy-status').textContent = 'Текст выделен. Скопируйте его вручную через меню устройства или Ctrl+C.'; }
});
$('#year').textContent = new Date().getFullYear();
