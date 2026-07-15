'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '../page.module.css';

export default function FAQItemClient({ question, answer, id }: { question: string; answer: React.ReactNode; id?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (id && window.location.hash === `#${id}`) {
      setIsOpen(true);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [id]);

  return (
    <details 
      className={styles.faqItem} 
      id={id} 
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className={styles.faqQuestion}>
        {question}
        <ChevronDown size={18} className={styles.faqChevron} />
      </summary>
      <p className={styles.faqAnswer}>{answer}</p>
    </details>
  );
}
