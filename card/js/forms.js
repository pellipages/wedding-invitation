/* Blessings (akshata → petals → words) and RSVP */

// RSYVP form handler
$$('[data-r]').forEach(b => b.onclick = () => {
  store.rsvp = { name: $('#rn').value, guests: $('#rg').value, r: b.dataset.r };
  save();
  $('#rt').textContent = `Thank you${$('#rn').value ? ', ' + $('#rn').value : ''} — noted as ${b.dataset.r}.`;
  if (b.dataset.r[0] == 'j') {
    rain('petal.webp', 12, 22, 4);
    lit($('#rsvp'));
  }
});

// Share button handler
$('#share').onclick = () => {
  const d = { title: 'Harika & Prem — Wedding', text: 'You are invited to our wedding.', url: location.href };
  navigator.share ? navigator.share(d).catch(() => {}) : navigator.clipboard && navigator.clipboard.writeText(location.href).then(() => $('#rt').textContent = 'Link copied.');
};