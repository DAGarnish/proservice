'use client';

export default function FAQLink() {
  return (
    <a 
      href="#faq-deluxe" 
      style={{ textDecoration: 'underline' }} 
      onClick={(e) => {
        const el = document.getElementById('faq-deluxe') as HTMLDetailsElement;
        if (el) {
          el.open = true;
        }
      }}
    >
      FAQs
    </a>
  );
}
