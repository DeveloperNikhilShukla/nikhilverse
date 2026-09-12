async function askAI(){
  let q = msg.value.trim();

  if(!q) return;

  // Question send hote hi input box clear
  msg.value = '';

  chat.innerHTML =
    '<b>You:</b> ' +
    q +
    '<br><br>Thinking…';

  try {
    let r = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: q
      })
    }).then(x => x.json());

    if (!r.answer) {
      chat.innerHTML =
        '<b>You:</b> ' +
        q +
        '<br><br>' +
        '<span style="color:#ff8a8a">' +
        (r.error || 'Nikhil AI unavailable') +
        '</span>';

      return;
    }

    chat.innerHTML =
      '<b>You:</b> ' +
      q +
      '<br><br>' +
      r.answer +
      (
        r.results?.length
          ? '<br><br><b>Related:</b><br>' +
            r.results
              .map(x => '• ' + x.title)
              .join('<br>')
          : ''
      );

  } catch (error) {

    chat.innerHTML =
      '<b>You:</b> ' +
      q +
      '<br><br>' +
      '<span style="color:#ff8a8a">' +
      'Nikhil AI se connection nahi ho paya.' +
      '</span>';

  }
}
