(() => {
  document.getElementById('history-back')?.addEventListener('click', () => history.back());
  document.getElementById('history-forward')?.addEventListener('click', () => history.forward());
  const noticeList = document.getElementById('notice-list');
  if (noticeList && window.JANSEVA_NOTIFICATIONS_API) {
    const category = noticeList.dataset.category || 'all';
    const label = value => ({scholarship:'Scholarship', driving_licence:'Driving licence', subsidy:'Subsidy'}[value] || value);
    const refreshNotices = async () => {
      try {
        const response = await fetch(window.JANSEVA_NOTIFICATIONS_API, {headers:{'Accept':'application/json'}});
        if (!response.ok) return;
        const data = await response.json();
        let badge = document.querySelector('.update-count');
        if (data.unread > 0 && !badge) {
          const link = document.querySelector('.updates-link');
          if (link) { badge = document.createElement('span'); badge.className = 'update-count'; link.appendChild(badge); }
        }
        if (badge) { badge.textContent = data.unread; badge.hidden = !data.unread; }
        (data.sources || []).forEach(sourceInfo => {
          const card = document.querySelector(`[data-source-key="${sourceInfo.source_key}"]`);
          if (!card) return;
          const textBlock = card.querySelector('span:nth-child(2)');
          if (sourceInfo.last_checked_at) {
            let checked = textBlock.querySelector('.source-time');
            if (!checked) { checked = document.createElement('small'); checked.className = 'source-time'; textBlock.appendChild(checked); }
            checked.textContent = `Checked ${sourceInfo.last_checked_at.slice(0,16).replace('T',' ')}`;
          }
          if (sourceInfo.last_error && !textBlock.querySelector('.source-error')) {
            const error = document.createElement('small'); error.className = 'source-error'; error.textContent = 'Automatic check unavailable; cached notices are retained.'; textBlock.appendChild(error);
          }
        });
        const filtered = data.notices.filter(notice => category === 'all' || notice.category === category);
        if (!filtered.length) return;
        const container = document.createElement('div'); container.className = 'notice-list';
        filtered.forEach(notice => {
          const card = document.createElement('article'); card.className = 'notice-card';
          const meta = document.createElement('div'); meta.className = 'notice-meta';
          const tag = document.createElement('span'); tag.className = `notice-tag ${notice.category}`; tag.textContent = label(notice.category);
          const source = document.createElement('span'); source.textContent = notice.source;
          const time = document.createElement('time'); time.textContent = notice.published_at ? `Published ${notice.published_at}` : `First seen ${notice.first_seen_at.slice(0,16).replace('T',' ')}`;
          meta.append(tag, source, time);
          const title = document.createElement('h3'); const titleLink = document.createElement('a'); titleLink.href = notice.url; titleLink.target = '_blank'; titleLink.rel = 'noopener'; titleLink.textContent = notice.title; title.appendChild(titleLink);
          const summary = document.createElement('p'); summary.textContent = 'The public release title matched JanSeva service keywords. Open the official source to confirm full details.';
          card.append(meta, title, summary); container.appendChild(card);
        });
        noticeList.replaceChildren(container);
      } catch (_error) { /* Keep the last successfully loaded notices visible. */ }
    };
    let attempts = 0;
    const pollAfterLoad = async () => {
      await refreshNotices();
      attempts += 1;
      if (attempts < 12) window.setTimeout(pollAfterLoad, 2500);
      else window.setInterval(refreshNotices, 5 * 60 * 1000);
    };
    window.setTimeout(pollAfterLoad, 1200);
  }

  const form = document.getElementById('chat-form');
  if (!form) return;
  const log = document.getElementById('chat-log');
  const input = document.getElementById('chat-input');
  const progress = document.getElementById('progress-bar');
  const profile = window.JANSEVA_PROFILE || {};
  function addBubble(text, who) {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${who}`;
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }
  function updateProgress() {
    const count = ['full_name', 'education', 'state', 'income'].filter(key => profile[key] !== undefined && profile[key] !== '').length;
    progress.style.width = `${Math.max(20, count * 25)}%`;
  }
  updateProgress();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addBubble(message, 'user');
    input.value = '';
    input.disabled = true;
    try {
      const response = await fetch('/api/chat', {method:'POST', headers:{'Content-Type':'application/json','X-CSRFToken':document.querySelector('meta[name=csrf-token]').content}, body:JSON.stringify({message})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Please try again.');
      Object.assign(profile, data.profile);
      updateProgress();
      addBubble(data.reply, 'bot');
      if (data.complete) addBubble('Next: open application details to review sample checks, upload documents and prepare your draft.', 'bot');
    } catch (error) {
      addBubble(error.message || 'Unable to connect. Please try again.', 'bot');
    } finally { input.disabled = false; input.focus(); }
  });
})();
