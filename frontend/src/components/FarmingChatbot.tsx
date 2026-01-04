'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

const FarmingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Namaste! 🙏 I am Krishi AI, your intelligent farming assistant. I can help you with farming questions, crop diseases, pests, fertilizers, government schemes, insurance claims, and general queries. Ask me anything!',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Hide badge after 5 seconds
  useEffect(() => {
    if (showBadge) {
      const timer = setTimeout(() => setShowBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showBadge]);

  // Knowledge Base with 40+ farming Q&A pairs
  const knowledgeBase: Record<string, string> = {
    'tomato,yellow,leaves':
      'Yellow leaves on tomato plants usually mean: (1) Nitrogen deficiency - apply urea fertilizer (2) Overwatering - check soil moisture (3) Early blight disease - spray Mancozeb fungicide. Water deeply but less frequently.',
    'tomato,wilt,disease':
      'Tomato wilt is caused by Fusarium fungus. Remove infected plants immediately. Rotate crops yearly. Use resistant varieties like Pusa Ruby. Avoid overwatering. Apply Trichoderma to soil before planting.',
    'tomato,blight':
      'Early blight shows dark spots with rings. Remove infected leaves. Spray Mancozeb or Chlorothalonil. Avoid overhead watering. Maintain good air circulation. Mulch to prevent soil splash.',
    'tomato,fruit,rot':
      'Fruit rot prevention: Avoid overwatering. Ensure good drainage. Spray Bordeaux mixture. Remove infected fruits. Maintain calcium levels (add lime if needed). Harvest fruits before over-ripening.',
    'rice,blast,disease':
      'Rice blast shows brown spots on leaves. Spray Tricyclazole or Carbendazim. Apply potassium fertilizer to strengthen plants. Avoid excessive nitrogen. Drain fields periodically.',
    'rice,bacterial,blight':
      'Bacterial blight causes yellow to white leaf lesions. Use disease-free seeds. Spray Streptocycline 300 ppm. Balance nitrogen fertilizer. Remove infected plants and weeds.',
    'rice,sheath,rot':
      'Sheath rot appears as brown spots on leaf sheaths. Spray Propiconazole. Avoid excessive nitrogen. Improve drainage. Remove infected debris after harvest.',
    'wheat,rust,disease':
      'Wheat rust appears as orange-brown pustules. Spray Propiconazole or Tebuconazole. Use resistant varieties. Apply adequate phosphorus and potash fertilizer.',
    'wheat,smut':
      'Wheat smut prevention: Use certified disease-free seeds. Treat seeds with Carbendazim (2g/kg seeds). Avoid planting in infected fields. Rotate crops.',
    'cotton,wilt':
      'Cotton wilt prevention: Use wilt-resistant varieties. Deep summer ploughing. Apply Trichoderma. Avoid waterlogging. Crop rotation with cereals for 2-3 years.',
    'cotton,boll,rot':
      'Boll rot control: Remove infected bolls. Spray Carbendazim. Improve air circulation. Avoid excessive nitrogen. Harvest as bolls mature.',
    'aphids,control,pest':
      'Aphid control: Spray neem oil (5ml/liter) weekly. Use yellow sticky traps. Release ladybugs (natural predators). Chemical option: Imidacloprid 200 SL. Avoid excessive nitrogen fertilizer.',
    'whitefly,control':
      'Whitefly management: Spray neem oil + garlic extract. Use yellow sticky traps. Remove infected leaves. Chemical: Thiamethoxam 25% WG. Apply early morning or evening.',
    'bollworm,cotton':
      'Bollworm control in cotton: Install pheromone traps. Spray Bacillus thuringiensis (Bt). Hand-pick larvae. Chemical: Emamectin benzoate. Rotate insecticides to avoid resistance.',
    'stem,borer,rice':
      'Rice stem borer: Remove stubble after harvest. Use pheromone traps. Release egg parasitoids (Trichogramma). Spray Cartap hydrochloride or Chlorantraniliprole.',
    'caterpillar,control':
      'Caterpillar control: Hand-pick large caterpillars. Spray neem oil or Bt (Bacillus thuringiensis). Use pheromone traps. Chemical: Spinosad or Emamectin benzoate. Encourage natural predators.',
    'thrips,control':
      'Thrips management: Spray neem oil. Use blue sticky traps. Remove weeds (host plants). Chemical: Spinosad or Fipronil. Maintain field hygiene.',
    'mites,control':
      'Mite control: Spray water to increase humidity. Apply sulfur dust. Use predatory mites. Chemical: Abamectin or Fenazaquin. Avoid dusty conditions.',
    'neem,oil,spray':
      'Neem oil spray recipe: Mix 10ml neem oil + 5ml liquid soap in 1 liter water. Shake well. Spray on both sides of leaves. Best time: Early morning or evening. Repeat every 7-10 days.',
    'organic,pesticide':
      'Organic pesticides: (1) Neem oil for aphids/whiteflies (2) Garlic-chili spray for caterpillars (3) Buttermilk spray for fungal diseases (4) Wood ash for beetles (5) Turmeric powder for soil diseases.',
    'garlic,spray':
      'Garlic spray: Crush 10 garlic cloves + 2 red chilies. Soak in 1 liter water overnight. Filter and add 5ml liquid soap. Spray weekly. Effective against aphids, caterpillars, and fungal diseases.',
    'companion,planting':
      'Companion planting benefits: Marigold repels nematodes. Basil repels aphids. Onion/garlic repel many pests. Legumes fix nitrogen. Plant diverse crops to confuse pests.',
    'watering,schedule':
      'Watering tips: Water early morning (6-8 AM) or evening (5-7 PM). Check soil 2 inches deep - water if dry. Drip irrigation saves 40% water. Mulch soil to retain moisture. Avoid midday watering.',
    'overwatering,signs':
      'Overwatering signs: Yellow leaves, wilting despite wet soil, root rot, fungus growth, slow growth. Solution: Reduce watering frequency. Improve drainage. Check for root rot and trim damaged roots.',
    'underwatering,signs':
      'Underwatering signs: Dry, brittle leaves, drooping plants, brown leaf edges, slow growth, soil pulling away from pot edges. Solution: Water deeply and increase frequency. Add mulch.',
    'drought,management':
      'Drought management: Use drip irrigation. Apply mulch (straw/dried leaves). Choose drought-resistant varieties. Harvest rainwater. Plant early to use monsoon moisture. Spray antitranspirants.',
    'monsoon,preparation':
      'Monsoon prep: Clean drainage channels. Check bund height. Prepare for pest outbreaks. Store pesticides. Ensure seed availability. Repair farm equipment. Have crop insurance active.',
    'frost,protection':
      'Frost protection: Cover seedlings with plastic sheets/blankets at night. Spray water before sunrise (ice formation releases heat). Use smoke pots. Plant frost-resistant varieties. Delay planting until frost risk passes.',
    'heatwave,crops':
      'Heatwave protection: Irrigate early morning. Apply mulch to reduce soil temperature. Provide shade nets for vegetables. Spray kaolin clay (reflective coating). Harvest early morning. Supplement potassium for heat tolerance.',
    'npk,fertilizer':
      'NPK fertilizer guide: N (Nitrogen) for leaf growth, P (Phosphorus) for roots, K (Potassium) for disease resistance. Vegetable crops: 19-19-19. Cereals: 20-10-10. Fruits: 10-26-26. Apply based on soil test.',
    'urea,application':
      'Urea application: Apply 45 days after sowing for cereals. Broadcast and irrigate immediately. For vegetables, split dose: 50% at planting, 25% at 30 days, 25% at 50 days. Avoid touching leaves.',
    'dap,fertilizer':
      'DAP (Diammonium Phosphate): Rich in N and P. Apply at sowing time. Mix in soil, avoid direct contact with seeds. Use 100-150 kg/hectare for cereals. Good for root development.',
    'compost,making':
      'Compost making: Mix 3 parts brown material (dry leaves, straw) + 1 part green (kitchen waste, manure). Layer in pit. Add water to keep moist. Turn every 15 days. Ready in 3-4 months. Rich in nutrients.',
    'vermicompost,benefits':
      'Vermicompost benefits: Improves soil structure, adds nutrients (NPK + micronutrients), increases water retention, promotes beneficial microbes. Use 2-5 tons/hectare. Mix in soil before planting.',
    'soil,pH,test':
      'Soil pH testing: Buy pH kit from Krishi Vigyan Kendra (₹50-100). Mix soil with water 1:2. Use pH paper. Most crops prefer 6.0-7.0 pH. If acidic: Add lime. If alkaline: Add gypsum or sulfur.',
    'soil,preparation':
      'Soil preparation: Plough 2-3 times. Remove weeds and stones. Add organic compost (5-10 tons/hectare). Level the field. Ensure good drainage. Test soil pH and nutrients before planting.',
    'insurance,claim,krishi':
      'To file insurance claim on KRISHI RAKSHA: (1) Login to dashboard (2) Go to "Submit Claim" (3) Upload geo-tagged photos of damage (4) Enter crop and damage details (5) Our ML system verifies automatically (6) Approval in 24-48 hours.',
    'claim,photo,requirements':
      'Claim photo requirements: (1) Enable GPS location on phone (2) Take photos showing full field damage (3) Include date/time stamp (4) Multiple angles (5) Close-ups of affected plants (6) Include any visible cause (flood, pest, hail). Min 5 photos required.',
    'claim,rejection,reasons':
      'Common claim rejection reasons: (1) Photos not geo-tagged (2) Damage doesn\'t match weather data (3) Pre-existing condition (4) Incorrect crop type (5) Late submission (>7 days). Always document damage immediately after occurrence.',
    'covered,damages':
      'PMFBY insurance covers: Drought, flood, hailstorm, cyclone, pest attack, disease outbreak, unseasonal rainfall. NOT covered: War, nuclear risks, malicious damage, poor farming practices, theft, stray animals.',
    'seed,treatment':
      'Seed treatment before sowing: Soak seeds in Trichoderma solution (10g/kg seeds) for 30 minutes. Or use Carbendazim (2g/kg). Dry in shade. This prevents seed-borne diseases. Increases germination by 15-20%.',
    'crop,rotation,benefits':
      'Crop rotation benefits: Breaks pest/disease cycle, improves soil fertility, reduces weed pressure, balances nutrient use. Suggested: Legumes → Cereals → Vegetables → Oilseeds. Rotate annually for best results.',
    'intercropping,advantages':
      'Intercropping advantages: Higher income per acre, pest control (diversity confuses pests), soil protection, better land use. Examples: Maize + beans, cotton + chickpea, coconut + banana.',
    'drip,irrigation,benefits':
      'Drip irrigation benefits: Saves 40-60% water, reduces weed growth, precise fertilizer application (fertigation), prevents leaf diseases, increases yield by 20-50%. Initial cost: ₹40,000-60,000/acre with 90% government subsidy.',
    'borewell,depth':
      'Borewell depth depends on region: Coastal areas 50-100 feet, hard rock areas 200-400 feet. Consult local water authority. Check for bore permit. Cost: ₹250-400 per foot. Use casing to prevent collapse.',
    'solar,pump':
      'Solar pump benefits: Zero electricity cost, works in remote areas, low maintenance, 25-year lifespan. Government subsidy up to 90%. 5 HP pump cost: ₹2-2.5 lakh (after subsidy ₹20,000-50,000). Check PM-KUSUM scheme.',
    'government,schemes':
      'Key schemes: PM-KISAN (₹6000/year), PMFBY (crop insurance), PM-KUSUM (solar), Soil Health Card, KCC (Kisan Credit Card), e-NAM (online market). Visit nearest Krishi Vigyan Kendra for applications.',
    'kisan,credit,card':
      'Kisan Credit Card (KCC): Get agricultural loan at 4% interest. Limit up to ₹3 lakh based on land. Apply through any bank with land documents + Aadhaar. Interest subvention available. Repay after harvest.',
    'weather,forecast':
      'Check weather forecast: (1) KRISHI RAKSHA dashboard "Weather" tab (2) IMD Meghdoot app (3) Kisan Suvidha app (4) Local Krishi Vigyan Kendra. Plan spraying/harvesting based on 7-day forecast.',
    'market,price,check':
      'Check crop prices: (1) e-NAM portal (enam.gov.in) (2) Agmarknet website (3) Kisan Suvidha app (4) Local mandi rates. Compare prices across mandis. Consider transport cost before selling.',
    'harvesting,time':
      'Right harvesting time: Grains - when moisture is 20-25%, Fruits - check color and firmness, Vegetables - based on size and maturity. Harvest early morning (less moisture loss). Avoid rainy days (fungus risk).',
    'storage,techniques':
      'Proper storage: Dry grains to 12% moisture. Use airtight containers. Add neem leaves to prevent insects. Store in cool, dry place. Raise storage from ground (prevent moisture). Check regularly for pests.',
    'contact,support':
      'For more help: Visit nearest Krishi Vigyan Kendra, Call Kisan Call Center (1800-180-1551 - toll free), Use KRISHI RAKSHA dashboard\'s support chat, Email: support@krishiraksha.in',
  };

  // Smart matching algorithm (more flexible - single keyword match)
  const findBestAnswer = (userQuery: string): string | null => {
    const query = userQuery.toLowerCase().trim();
    
    // More flexible keyword matching - single keyword is enough
    let bestMatch: string | null = null;
    let highestScore = 0;
    
    for (const [keywords, answer] of Object.entries(knowledgeBase)) {
      const keywordList = keywords.split(',');
      let score = 0;
      
      keywordList.forEach((keyword) => {
        const trimmedKeyword = keyword.trim();
        if (query.includes(trimmedKeyword)) {
          score += 1;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = answer;
      }
    }
    
    // Single keyword match is enough for knowledge base
    return highestScore >= 1 ? bestMatch : null;
  };

  // Get bot response - API first, knowledge base as fallback
  const getBotResponse = async (userQuery: string): Promise<string> => {
    // Build conversation context from recent messages
    const recentMessages = messages.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    // Try API first (primary method) - supports multiple providers
    const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

    // Try Anthropic Claude first
    if (anthropicKey) {
      try {
        const systemPrompt = `You are Krishi AI, a friendly and knowledgeable agricultural assistant for Indian farmers. You help with:
- Farming questions (crops, pests, diseases, fertilizers, irrigation)
- Agricultural best practices and techniques
- Government schemes and subsidies
- Crop insurance and KRISHI RAKSHA platform queries
- General questions (you can answer anything, but prioritize farming when relevant)

Respond in simple, clear English or Hinglish. Be conversational, helpful, and practical. Keep responses concise but informative (2-4 sentences for simple questions, up to 150 words for complex topics).`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: systemPrompt,
            messages: [
              ...recentMessages,
              { role: 'user', content: userQuery },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content && data.content[0]?.text) {
            return data.content[0].text;
          }
        }
      } catch (error) {
        console.log('Anthropic API error:', error);
      }
    }

    // Try OpenAI GPT as fallback
    if (openaiKey) {
      try {
        const systemPrompt = `You are Krishi AI, a friendly agricultural assistant for Indian farmers. Help with farming, agriculture, government schemes, crop insurance, and general questions. Respond in simple English or Hinglish. Be conversational and practical.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 1024,
            messages: [
              { role: 'system', content: systemPrompt },
              ...recentMessages,
              { role: 'user', content: userQuery },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
          }
        }
      } catch (error) {
        console.log('OpenAI API error:', error);
      }
    }

    // Try Google Gemini as fallback
    if (googleKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are Krishi AI, an agricultural assistant. Answer this question in simple English/Hinglish: ${userQuery}`
              }]
            }],
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
          }
        }
      } catch (error) {
        console.log('Google AI API error:', error);
      }
    }

    // Fallback to knowledge base if API not available
    const knowledgeAnswer = findBestAnswer(userQuery);
    if (knowledgeAnswer) {
      return knowledgeAnswer;
    }

    // Final fallback response
    return "I understand your question, but I don't have a specific answer right now. For farming questions, try asking about specific crops, pests, diseases, fertilizers, or irrigation. For KRISHI RAKSHA platform help, visit the dashboard or contact support at support@krishiraksha.in. For general questions, please provide your API key (Anthropic, OpenAI, or Google) in environment variables to enable full AI capabilities.";
  };

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim(),
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const botResponse = await getBotResponse(userMessage.text);
      
      // Simulate typing delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      const botMessage: Message = {
        role: 'bot',
        text: botResponse,
        time: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        time: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Styles
  const styles = {
    chatButton: {
      position: 'fixed' as const,
      bottom: '24px',
      right: '24px',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: '#22c55e',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
      zIndex: 9999,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      color: 'white',
    },
    chatButtonHover: {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 20px rgba(34, 197, 94, 0.6)',
    },
    badge: {
      position: 'absolute' as const,
      bottom: '70px',
      right: '0',
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '12px',
      whiteSpace: 'nowrap' as const,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      pointerEvents: 'none' as const,
      animation: 'fadeIn 0.3s ease',
    },
    chatPopup: {
      position: 'fixed' as const,
      bottom: isMobile ? '0' : '100px',
      right: isMobile ? '0' : '24px',
      width: isMobile ? '100%' : '420px',
      height: isMobile ? '100%' : '650px',
      backgroundColor: 'white',
      borderRadius: isMobile ? '0' : '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column' as const,
      animation: 'slideUp 0.3s ease',
      maxWidth: isMobile ? '100%' : '420px',
      maxHeight: isMobile ? '100%' : '650px',
    },
    header: {
      backgroundColor: '#22c55e',
      color: 'white',
      padding: '16px 20px',
      borderRadius: isMobile ? '0' : '16px 16px 0 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '18px',
      fontWeight: '600',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '0',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'background-color 0.2s',
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      backgroundColor: '#f9fafb',
    },
    messageBubble: {
      maxWidth: '75%',
      padding: '12px 16px',
      borderRadius: '16px',
      fontSize: '14px',
      lineHeight: '1.5',
      wordWrap: 'break-word' as const,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#22c55e',
      color: 'white',
      borderBottomRightRadius: '4px',
    },
    botMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
      borderBottomLeftRadius: '4px',
    },
    messageTime: {
      fontSize: '10px',
      opacity: 0.7,
      marginTop: '4px',
    },
    typingIndicator: {
      display: 'flex',
      gap: '4px',
      padding: '12px 16px',
      backgroundColor: '#f3f4f6',
      borderRadius: '16px',
      borderBottomLeftRadius: '4px',
      alignSelf: 'flex-start',
      maxWidth: '75%',
    },
    typingDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#9ca3af',
      animation: 'bounce 1.4s infinite',
    },
    inputContainer: {
      padding: '16px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: 'white',
      borderRadius: isMobile ? '0' : '0 0 16px 16px',
      display: 'flex',
      gap: '8px',
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '24px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    sendButton: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#22c55e',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      transition: 'all 0.2s',
      flexShrink: 0,
    },
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
    },
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          style={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Button */}
      <button
        style={styles.chatButton}
        onClick={() => {
          setIsOpen(!isOpen);
          setShowBadge(false);
        }}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.chatButtonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = styles.chatButton.boxShadow;
        }}
        aria-label="Open AI Chatbot"
      >
        💬
        {showBadge && (
          <div style={styles.badge}>
            AI Assistant
          </div>
        )}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div style={styles.chatPopup}>
          {/* Header */}
          <div style={styles.header}>
            <span>🌾 Krishi AI Assistant</span>
            <button
              style={styles.closeButton}
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageBubble,
                  ...(message.role === 'user' ? styles.userMessage : styles.botMessage),
                }}
              >
                <div>{message.text}</div>
                <div style={styles.messageTime}>{formatTime(message.time)}</div>
              </div>
            ))}
            {isTyping && (
              <div style={styles.typingIndicator}>
                <div style={{ ...styles.typingDot, animationDelay: '0s' }} />
                <div style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
                <div style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about farming, crops, pests, insurance..."
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
            <button
              style={styles.sendButton}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#22c55e';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Send message"
            >
              📤
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </>
  );
};

export default FarmingChatbot;

