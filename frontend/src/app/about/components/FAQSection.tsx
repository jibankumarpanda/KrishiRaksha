'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How accurate are the crop yield predictions?',
      answer: 'Our AI models achieve 92% accuracy by analyzing over 50 parameters including soil conditions, weather patterns, historical data, and satellite imagery. The system continuously learns from new data, improving predictions with each season.',
    },
    {
      id: 2,
      question: 'How quickly are insurance claims processed?',
      answer: 'Smart contracts automatically trigger payouts when predefined conditions are met. Once verified through satellite imagery and weather data, funds are transferred to your bank account within 24-48 hours, eliminating lengthy paperwork and waiting periods.',
    },
    {
      id: 3,
      question: 'Is my data secure on the blockchain?',
      answer: 'Yes, absolutely. Blockchain technology ensures your data is encrypted, immutable, and distributed across multiple nodes. No single entity can alter or manipulate your records. We comply with all Indian data protection regulations and maintain ISO 27001 certification.',
    },
    {
      id: 4,
      question: 'What languages is the platform available in?',
      answer: 'The platform supports 10+ Indian regional languages including Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, Punjabi, and Odia. Voice assistance is available for farmers with limited literacy, and WhatsApp integration enables easy communication,these are future goal but currently the platform comunicates only in ENGLISH LANGUAGE',
    },
    {
      id: 5,
      question: 'Do I need a smartphone to use this service?',
      answer: 'While a smartphone provides the best experience, we also support basic feature phones through SMS and voice calls. Our support team can assist you with registration and claim submission via phone. Many farmers also access the platform through cooperative societies and agricultural centers.',
    },
    {
      id: 6,
      question: 'What crops are covered under the insurance?',
      answer: 'We cover all major crops including rice, wheat, cotton, sugarcane, pulses, oilseeds, and vegetables. Coverage includes yield loss due to drought, flood, pest attacks, disease, and unseasonal weather events. Specific terms vary by region and crop type.',
    },
  ];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  if (!isHydrated) {
    return (
      <section className="mb-16 lg:mb-24">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-12" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 h-20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16 lg:mb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Common questions about our platform and services
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-card rounded-lg shadow-card border border-border overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors duration-200"
            >
              <span className="text-lg font-heading font-bold text-foreground pr-4">
                {faq.question}
              </span>
              <Icon
                name="ChevronDownIcon"
                size={24}
                className={`text-primary flex-shrink-0 transition-transform duration-300 ${
                  openId === faq.id ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openId === faq.id ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-6 text-text-secondary leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-text-secondary mb-4">
          Still have questions? Our support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
         
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-success text-success-foreground rounded-md hover:bg-success/90 transition-colors duration-200 shadow-card"
          >
            <Icon name="ChatBubbleLeftRightIcon" size={20} />
            <span className="font-body font-medium">WhatsApp Support</span>
          </a>
        </div>
      </div>
    </section>
  );
}
