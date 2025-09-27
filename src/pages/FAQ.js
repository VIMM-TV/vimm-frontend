import React, { useState } from 'react';
import './FAQ.css';

function FAQ() {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      category: "Getting Started",
      items: [
        {
          question: "What is VIMM?",
          answer: "VIMM is a decentralized streaming platform built on the Hive blockchain. It allows content creators to stream live video while earning cryptocurrency rewards from their audience. Unlike traditional platforms, VIMM gives creators full ownership of their content and direct monetization without intermediaries."
        },
        {
          question: "How do I create an account?",
          answer: "To join VIMM, you need a Hive blockchain account. Click the 'Login with Hive' button and use your existing Hive account, or create a new one through services like Hive Onboard. Your Hive account serves as your VIMM identity, giving you access to all platform features."
        },
        {
          question: "Is VIMM free to use?",
          answer: "Yes! Watching streams on VIMM is completely free. Creating an account and following streamers is also free. However, some features like tipping streamers or certain premium interactions may require small amounts of Hive cryptocurrency."
        }
      ]
    },
    {
      category: "Streaming",
      items: [
        {
          question: "How do I start streaming?",
          answer: "After logging in, go to your Channel Settings to configure your stream. Generate a stream key, set up your streaming software (like OBS), and start broadcasting. Make sure to set an engaging title and select the appropriate category for your content."
        },
        {
          question: "What streaming software can I use?",
          answer: "VIMM works with any RTMP-compatible streaming software including OBS Studio, Streamlabs, XSplit, and more. OBS Studio is free and highly recommended for beginners. Simply use your VIMM stream key and server URL in your streaming software settings."
        },
        {
          question: "Are there any streaming restrictions?",
          answer: "VIMM follows community guidelines that prohibit illegal content, harassment, and spam. Content should be appropriate for the platform's diverse audience. Specific streaming quality and duration limits may apply to new accounts, which are lifted as you build reputation on the platform."
        },
        {
          question: "How do I earn from streaming?",
          answer: "Streamers can earn through various methods: viewer tips in Hive cryptocurrency, community upvotes that provide Hive rewards, sponsored content, and direct support from followers. The decentralized nature means you keep more of your earnings compared to traditional platforms."
        }
      ]
    },
    {
      category: "Watching & Following",
      items: [
        {
          question: "How do I follow streamers?",
          answer: "Click the heart (❤️) button on any stream or streamer's profile to follow them. Followed streamers will appear in your 'Following' page, where you can see who's live and get notifications when they start streaming."
        },
        {
          question: "Can I watch streams without an account?",
          answer: "Yes! You can watch any public stream without creating an account. However, you'll need a Hive account to follow streamers, participate in chat, tip creators, or access personalized features like your following list."
        },
        {
          question: "How do I tip streamers?",
          answer: "When logged in, you can tip streamers using Hive cryptocurrency. Look for the tip button during streams or visit their profile. Tips are sent directly to the streamer's Hive wallet, supporting them directly without platform fees."
        }
      ]
    },
    {
      category: "Technical",
      items: [
        {
          question: "What video quality does VIMM support?",
          answer: "VIMM supports multiple streaming resolutions including 720p and 1080p. The platform automatically adjusts video quality based on your internet connection. Streamers can broadcast in various bitrates, and viewers can select their preferred quality when available."
        },
        {
          question: "Why is my stream lagging or buffering?",
          answer: "Stream quality depends on both the streamer's upload speed and your internet connection. Try refreshing the page, lowering video quality if available, or checking your internet connection. Streamers experiencing issues should verify their upload speed and streaming software settings."
        },
        {
          question: "Is there a mobile app?",
          answer: "Currently, VIMM is available as a web application that works on mobile browsers. A dedicated mobile app is in development. You can add VIMM to your phone's home screen through your browser's 'Add to Home Screen' option for a more app-like experience."
        },
        {
          question: "What browsers are supported?",
          answer: "VIMM works best on modern browsers including Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date and has JavaScript enabled. Some older browsers may have limited functionality or compatibility issues."
        }
      ]
    },
    {
      category: "Hive Blockchain",
      items: [
        {
          question: "What is Hive blockchain?",
          answer: "Hive is a fast, fee-less blockchain designed for social media and content creation. It powers VIMM's decentralized infrastructure, enabling direct creator monetization, censorship resistance, and true content ownership. Transactions on Hive are free and typically confirm within 3 seconds."
        },
        {
          question: "Do I need to understand cryptocurrency?",
          answer: "While basic knowledge helps, you don't need to be a crypto expert to use VIMM. The platform handles most blockchain interactions automatically. You'll mainly interact with Hive when receiving tips or rewards, which are stored in your Hive wallet."
        },
        {
          question: "How do I manage my Hive wallet?",
          answer: "Your Hive wallet is separate from VIMM but connected to your account. You can manage it through Hive wallet applications like Hive Keychain, PeakD, or Hive.blog. These tools let you view balances, make transfers, and manage your cryptocurrency."
        },
        {
          question: "What are Hive rewards?",
          answer: "Hive rewards are earned when community members upvote your content or streams. These rewards are distributed automatically after 7 days and appear in your Hive wallet. The amount depends on the voting power and stake of users who upvoted your content."
        }
      ]
    },
    {
      category: "Community & Safety",
      items: [
        {
          question: "How do I report inappropriate content?",
          answer: "If you encounter content that violates community guidelines, use the report function available on streams and profiles. Reports are reviewed by community moderators. You can also block users to prevent seeing their content in your feeds."
        },
        {
          question: "What are the community guidelines?",
          answer: "VIMM promotes a respectful, inclusive environment. Prohibited content includes harassment, hate speech, illegal activities, spam, and inappropriate material. Creators should respect intellectual property rights and maintain appropriate content standards for all audiences."
        },
        {
          question: "How does moderation work?",
          answer: "VIMM uses a combination of community reporting, automated systems, and human moderators to maintain platform standards. The decentralized nature means content decisions are made transparently, and creators have more control over their communities than on traditional platforms."
        }
      ]
    }
  ];

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about VIMM streaming platform</p>
      </div>

      <div className="faq-content">
        {faqData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="faq-section">
            <h2 className="section-title">{section.category}</h2>
            <div className="faq-items">
              {section.items.map((item, itemIndex) => {
                const globalIndex = `${sectionIndex}-${itemIndex}`;
                const isOpen = openItems.has(globalIndex);
                
                return (
                  <div key={itemIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button 
                      className="faq-question"
                      onClick={() => toggleItem(globalIndex)}
                      aria-expanded={isOpen}
                    >
                      <span className="question-text">{item.question}</span>
                      <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    <div className="faq-answer">
                      <div className="answer-content">
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-footer">
        <div className="contact-section">
          <h3>Still have questions?</h3>
          <p>
            Can't find what you're looking for? Join our community on 
            <a href="https://discord.gg/vimm" target="_blank" rel="noopener noreferrer"> Discord </a>
            or reach out on 
            <a href="https://hive.blog/@vimm" target="_blank" rel="noopener noreferrer"> Hive </a>
            for additional support.
          </p>
        </div>
        
        <div className="search-hint">
          <p>💡 <strong>Tip:</strong> Use Ctrl+F (Cmd+F on Mac) to search for specific keywords on this page.</p>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
