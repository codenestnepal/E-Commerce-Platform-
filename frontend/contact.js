document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const subject = document.getElementById('contactSubject')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!fullName || !email || !subject || !message) return showNotification('Please fill all fields', 'error');
    if (!validateEmail(email)) return showNotification('Invalid email', 'error');
    if (message.length < 5) return showNotification('Message must be at least 5 characters', 'error');

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    try {
      await ApiService.sendContactMessage(fullName, email, subject, message);
      showNotification('Message sent successfully!', 'success');
      form.reset();
    } catch (err) {
      showNotification(err.message || 'Failed to send message', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
});