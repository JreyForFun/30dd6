document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const wordCountEl = document.getElementById('wordCount');
  const charCountEl = document.getElementById('charCount');
  const sentenceCountEl = document.getElementById('sentenceCount');
  const readTimeEl = document.getElementById('readTime');
  const paraCountEl = document.getElementById('paraCount');
  const avgWordLenEl = document.getElementById('avgWordLen');
  const longestWordEl = document.getElementById('longestWord');
  const speakTimeEl = document.getElementById('speakTime');
  const charNoSpaceCountEl = document.getElementById('charNoSpaceCount');
  const targetProgress = document.getElementById('targetProgress').firstElementChild;

  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const upperBtn = document.getElementById('upperBtn');
  const lowerBtn = document.getElementById('lowerBtn');
  const titleBtn = document.getElementById('titleBtn');
  const toast = document.getElementById('toast');

  textInput.focus();

  function updateStats() {
    const text = textInput.value;

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;

    const charCount = text.length;

    const charNoSpaceCount = text.replace(/\s/g, '').length;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    const paraCount = paragraphs.length;

    const readTimeMin = Math.ceil(wordCount / 200);

    const speakTimeMin = Math.ceil(wordCount / 150);

    let avgLen = 0;
    if (wordCount > 0) {
      avgLen = (charNoSpaceCount / wordCount).toFixed(1);
    }

    let longest = '-';
    if (wordCount > 0) {
      const sortedWords = [...words].sort((a, b) => b.length - a.length);
      longest = sortedWords[0];
      if (longest.length > 15) {
        longest = longest.substring(0, 12) + '...';
      }
    }

    animateValue(wordCountEl, parseInt(wordCountEl.textContent), wordCount);
    animateValue(charCountEl, parseInt(charCountEl.textContent), charCount);
    animateValue(sentenceCountEl, parseInt(sentenceCountEl.textContent), sentenceCount);

    readTimeEl.textContent = readTimeMin + 'm';
    speakTimeEl.textContent = speakTimeMin + 'm';

    paraCountEl.textContent = paraCount;
    avgWordLenEl.textContent = avgLen;
    longestWordEl.textContent = longest;
    charNoSpaceCountEl.textContent = charNoSpaceCount;

    const targetInput = document.getElementById('targetInput');
    let target = parseInt(targetInput ? targetInput.value : 500) || 500;

    const statValues = document.querySelectorAll('.stat-value');
    if (wordCount >= target && target > 0) {
      statValues.forEach(el => el.classList.add('has-content', 'text-accent'));
      statValues.forEach(el => el.classList.remove('text-primary'));
    } else {
      statValues.forEach(el => el.classList.remove('has-content', 'text-accent'));
      statValues.forEach(el => el.classList.add('text-primary'));
    }

    const progress = Math.min((wordCount / target) * 100, 100);
    targetProgress.style.width = `${progress}%`;
  }

  function animateValue(obj, start, end) {
    if (start === end) return;
    const range = end - start;
    const minTimer = 50;
    let stepTime = Math.abs(Math.floor(1500 / range));
    stepTime = Math.max(stepTime, minTimer);
    const startTime = new Date().getTime();
    const endTime = startTime + 1500;
    let timer;

    function run() {
      const now = new Date().getTime();
      const remaining = Math.max((endTime - now) / 1500, 0);
      const value = Math.round(end - (remaining * range));
      obj.textContent = value;
      if (value === end) {
        clearInterval(timer);
      }
    }

    if (Math.abs(range) < 5) {
      obj.textContent = end;
    } else {
      timer = setInterval(run, stepTime);
      setTimeout(() => obj.textContent = end, 1500);
    }
  }

  function updateKeywords(text) {
    const words = text.toLowerCase().trim().split(/[\s.!?(),;:"']+/).filter(w => w.length > 3);
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const sortedKeywords = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]).slice(0, 5);
    const container = document.getElementById('keywordDensity');

    if (sortedKeywords.length === 0) {
      container.innerHTML = '<span class="text-secondary text-sm italic">Type to see keywords...</span>';
      return;
    }

    container.innerHTML = sortedKeywords.map(word =>
      `<span class="bg-container border border-zinc-800 px-2 py-1 rounded text-xs text-secondary">
                ${word} <span class="text-accent ml-1">${frequency[word]}</span>
            </span>`
    ).join('');
  }

  textInput.addEventListener('input', () => {
    updateStats();
    updateKeywords(textInput.value);
  });

  const targetInput = document.getElementById('targetInput');
  if (targetInput) {
    targetInput.addEventListener('input', updateStats);
  }

  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the text?')) {
      textInput.value = '';
      updateStats();
      updateKeywords('');
      textInput.focus();
    }
  });

  copyBtn.addEventListener('click', () => {
    if (!textInput.value) return;
    textInput.select();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textInput.value).then(showToast).catch(err => {
        console.error('Clipboard failed', err);
        document.execCommand('copy');
        showToast();
      });
    } else {
      document.execCommand('copy');
      showToast();
    }
  });

  function showToast() {
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2000);
  }

  upperBtn.addEventListener('click', () => {
    textInput.value = textInput.value.toUpperCase();
    updateStats();
    updateKeywords(textInput.value);
  });

  lowerBtn.addEventListener('click', () => {
    textInput.value = textInput.value.toLowerCase();
    updateStats();
    updateKeywords(textInput.value);
  });

  titleBtn.addEventListener('click', () => {
    const originalVal = textInput.value;
    const titleVal = toTitleCase(originalVal);
    textInput.value = titleVal;
    updateStats();
    updateKeywords(textInput.value);
  });

  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  updateStats();
});
