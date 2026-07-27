import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import RoleLayout from '../../components/RoleLayout';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export type FAQItem = {
  question: string;
  answer: string;
};

interface HelpPageProps {
  menuItems: any[];
  userName: string;
  userRole: string;
  settingsPath?: string;
  faqItems: FAQItem[];
}

export default function HelpPage({
  menuItems,
  userName,
  userRole,
  settingsPath,
  faqItems,
}: HelpPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <RoleLayout
      menuItems={menuItems}
      userName={userName}
      userRole={userRole}
      settingsPath={settingsPath}
    >
      <PageHeader
        title="Bantuan & Panduan"
        description="Temukan jawaban atas pertanyaan umum terkait penggunaan aplikasi."
      />

      <div className="max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border-b border-slate-100 last:border-0"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <span className="font-semibold text-slate-800">
                {item.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        ))}

        {faqItems.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Belum ada panduan tersedia.
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
