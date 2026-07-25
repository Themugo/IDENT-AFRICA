/**
 * AI Language Support
 * 
 * Multilingual AI concierge that responds in the user's language.
 */

import type { Language } from './index';

// Supported AI languages
export const AI_LANGUAGES: Record<Language, { code: string; name: string; nativeName: string }> = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  sw: { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文' },
};

// AI prompt prefixes for each language
export const AI_PROMPTS: Record<Language, string> = {
  en: 'You are a knowledgeable African travel expert. Provide helpful, accurate information about destinations, wildlife, culture, and travel tips.',
  fr: 'Vous êtes un expert en voyages en Afrique. Fournissez des informations utiles et précises sur les destinations, la faune, la culture et les conseils de voyage.',
  de: 'Sie sind ein Kenner afrikanischer Reisen. Bieten Sie hilfreiche, genaue Informationen über Reiseziele, Tierwelt, Kultur und Reisetipps.',
  es: 'Eres un experto en viajes africanos. Proporciona información útil y precisa sobre destinos, vida silvestre, cultura y consejos de viaje.',
  ar: 'أنت خبير في السفر إلى أفريقيا. قدم معلومات مفيدة ودقيقة عن الوجهات والحياة البرية والثقافة ونصائح السفر.',
  sw: 'Wewe ni mtaalamu wa safiri za Afrika. Toa maelezo muhimu na sahihi kuhusu sehemu za kusisitiri, wanyama, utamaduni na vidokezo vya kusafiri.',
  zh: '您是非洲旅行专家。提供关于目的地、野生动物、文化和旅行提示的有用、准确的信息。',
};

// Greeting messages
export const AI_GREETINGS: Record<Language, string[]> = {
  en: ['Hello!', 'Hi there!', 'Welcome!', 'Greetings!'],
  fr: ['Bonjour!', 'Salut!', 'Bienvenue!', 'Enchanté!'],
  de: ['Hallo!', 'Guten Tag!', 'Willkommen!', 'Grüße!'],
  es: ['¡Hola!', '¡Buenos días!', '¡Bienvenido!', '¡Saludos!'],
  ar: ['مرحبا!', 'أهلاً!', 'أهلا وسهلا!', 'السلام عليكم!'],
  sw: ['Habari!', 'Hujambo!', 'Karibu!', 'Asante!'],
  zh: ['你好!', '您好!', '欢迎!', '问候!'],
};

// Language detection keywords
const LANGUAGE_INDICATORS: Record<Language, string[]> = {
  en: ['safari', 'hello', 'help', 'search', 'book', 'destination', 'package', 'price', 'what', 'where', 'when', 'how'],
  fr: ['safari', 'bonjour', 'aide', 'recherche', 'réserver', 'destination', 'circuit', 'prix', 'quoi', 'où', 'quand', 'comment'],
  de: ['safari', 'hallo', 'hilfe', 'suche', 'buchen', 'reiseziel', 'paket', 'preis', 'was', 'wo', 'wann', 'wie'],
  es: ['safari', 'hola', 'ayuda', 'buscar', 'reservar', 'destino', 'paquete', 'precio', 'qué', 'dónde', 'cuándo', 'cómo'],
  ar: ['سفاري', 'مرحبا', 'مساعدة', 'بحث', 'حجز', 'وجهة', 'رحلة', 'سعر', 'ماذا', 'أين', 'متى', 'كيف'],
  sw: ['safari', 'habari', 'msaada', 'tafuta', 'agiza', 'sehemu', 'kifurushi', 'bei', 'nini', 'wapi', 'lini', 'vipi'],
  zh: ['safari', '你好', '帮助', '搜索', '预订', '目的地', '套餐', '价格', '什么', '哪里', '什么时候', '如何'],
};

/**
 * Detect language from text
 */
export function detectLanguage(text: string): Language {
  const lowerText = text.toLowerCase();
  const scores: Record<Language, number> = {
    en: 0, fr: 0, de: 0, es: 0, ar: 0, sw: 0, zh: 0,
  };

  // Check for language-specific indicators
  for (const [lang, keywords] of Object.entries(LANGUAGE_INDICATORS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[lang as Language]++;
      }
    }
  }

  // Check for Arabic script
  const arabicRegex = /[\u0600-\u06FF]/;
  if (arabicRegex.test(text)) {
    scores.ar = 100;
  }

  // Check for Chinese characters
  const chineseRegex = /[\u4E00-\u9FFF]/;
  if (chineseRegex.test(text)) {
    scores.zh = 100;
  }

  // Find highest score
  let maxScore = 0;
  let detectedLang: Language = 'en';

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang as Language;
    }
  }

  return detectedLang;
}

/**
 * Get random greeting
 */
export function getRandomGreeting(language: Language): string {
  const greetings = AI_GREETINGS[language];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Get AI system prompt for language
 */
export function getAISystemPrompt(language: Language): string {
  return AI_PROMPTS[language];
}

/**
 * AI Concierge Service
 */
class AIConciergeService {
  /**
   * Process user message and generate response
   */
  async processMessage(
    message: string,
    userLanguage: Language,
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{
    response: string;
    detectedLanguage: Language;
    suggestions: string[];
  }> {
    // Detect language of input
    const detectedLanguage = detectLanguage(message);
    
    // Get system prompt
    const systemPrompt = getAISystemPrompt(detectedLanguage);
    
    // Generate response (mock - would integrate with actual AI)
    const response = await this.generateResponse(message, detectedLanguage, conversationHistory);
    
    // Generate follow-up suggestions
    const suggestions = this.generateSuggestions(message, detectedLanguage);

    return {
      response,
      detectedLanguage,
      suggestions,
    };
  }

  /**
   * Generate response (placeholder for actual AI)
   */
  private async generateResponse(
    message: string,
    language: Language,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Topic detection
    if (lowerMessage.includes('maasai') || lowerMessage.includes('mara')) {
      return this.getMaasaiMaraInfo(language);
    }
    
    if (lowerMessage.includes('zanzibar') || lowerMessage.includes('beach')) {
      return this.getZanzibarInfo(language);
    }
    
    if (lowerMessage.includes('serengeti')) {
      return this.getSerengetiInfo(language);
    }
    
    if (lowerMessage.includes('when') || lowerMessage.includes('best time') || lowerMessage.includes('wann') || lowerMessage.includes('وقت')) {
      return this.getBestTimeInfo(language);
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('prix') || lowerMessage.includes('preis') || lowerMessage.includes('سعر')) {
      return this.getPricingInfo(language);
    }
    
    // Default greeting response
    return this.getDefaultResponse(language);
  }

  private getMaasaiMaraInfo(language: Language): string {
    const responses: Record<Language, string> = {
      en: 'Maasai Mara is one of Africa\'s most iconic safari destinations. Known for the Great Migration (July-October), it offers exceptional wildlife viewing including the Big Five. We offer luxury tented camps, game drives, and cultural experiences with the Maasai people.',
      fr: 'Le Maasai Mara est l\'une des destinations safari les plus emblématiques d\'Afrique. Connu pour la Grande Migration (juillet-octobre), il offre des observations de faune exceptionnelles, y compris les Big Five. Nous proposons des camps de luxe, des safaris et des expériences culturelles avec les Maasai.',
      de: 'Das Maasai Mara ist eines der ikonischsten Safari-Ziele Afrikas. Bekannt für die Große Migration (Juli-Oktober), bietet es außergewöhnliche Wildbeobachtungen, einschließlich der Big Five. Wir bieten Luxuscamps, Pirschfahrten und kulturelle Erlebnisse mit den Maasai.',
      es: 'Maasai Mara es uno de los destinos de safari más emblemáticos de África. Conocido por la Gran Migración (julio-octubre), ofrece avistamiento de vida silvestre excepcional, incluyendo los Big Five. Ofrecemos camps de lujo, safaris y experiencias culturales con los Maasai.',
      ar: 'محمية ماساي مارا هي واحدة من أكثر وجهات السفاري شهرة في أفريقيا. تشتهر بالهجرة الكبرى (يوليو - أكتوبر)، وتقدم مشاهدة حياة برية استثنائية بما في ذلك الحيوانات الخمس الكبرى. نقدم مخيمات فاخرة ورحلات السفاري وت experiences الثقافية مع شعب الماساي.',
      sw: 'Maasai Mara ni mojawapo wa malengo muhimu zaidi ya safari barani Afrika. Inajulikana kwa Migration Kubwa (Julai-Oktoba), inatoa mtazamo wa wanyama wa kipekee ikiwa ni pamoja na Big Five. Tunatoa makambi ya kifahari, kusafiri, na uzoefu wa kitamaduni na watu wa Maasai.',
      zh: '马赛马拉是非洲最具标志性的safari目的地之一。以大迁徙（7月至10月）闻名，提供包括五大动物在内的卓越野生动物观赏。我们提供豪华帐篷营地、游戏车驾驶以及与马赛人的文化体验。',
    };
    return responses[language];
  }

  private getZanzibarInfo(language: Language): string {
    const responses: Record<Language, string> = {
      en: 'Zanzibar offers pristine beaches, turquoise waters, and rich cultural heritage. Perfect for relaxation, water sports, and exploring Stone Town\'s UNESCO-listed architecture. Best visited October-March. We have beach resorts, spice tours, and diving packages.',
      fr: 'Zanzibar offre des plages immaculées, des eaux turquoise et un riche patrimoine culturel. Parfait pour la détente, les sports nautiques et l\'exploration de Stone Town. Meilleur visitable en octobre-mars.',
      de: 'Sansibar bietet unberührte Strände, türkisfarbenes Wasser und reiches kulturelles Erbe. Perfekt zum Entspannen, für Wassersport und zum Erkunden von Stone Town. Am besten besuchbar Oktober-März.',
      es: 'Zanzibar ofrece playas prístinas, aguas turquesas y rico patrimonio cultural. Perfecto para relajación, deportes acuáticos y explorar Stone Town. Mejor visitado octubre-marzo.',
      ar: 'زنجبار توفر شواطئ بكر ومياه فيروزية وتراث ثقافي غني. مثالية للاسترخاء ورياضات الماء واستكشاف ستون تاون. يُفضل زيارتها من أكتوبر إلى مارس.',
      sw: 'Zanzibar inatoa ufuo safi, maji ya buluu, na urithi wa utamaduni. Inafaa kwa kupumzika, micheza majini, na kuchunguza Stone Town. Inafaa kutembelewa Oktoba-Machi.',
      zh: '桑给巴尔提供原始海滩、绿松石水域和丰富的文化遗产。非常适合放松、水上运动和探索石头城的联合国教科文组织列为世界遗产的建筑。最佳游览时间为10月至3月。',
    };
    return responses[language];
  }

  private getSerengetiInfo(language: Language): string {
    const responses: Record<Language, string> = {
      en: 'The Serengeti is world-renowned for its endless plains and the Great Migration. Home to millions of wildebeest, zebras, and gazelles, plus predators like lions and leopards. Best time: June-October for migration, year-round for game viewing.',
      fr: 'Le Serengeti est mondialement connu pour ses plaines sans fin et la Grande Migration. Accueil des millions de gnous, zèbres et gazelles, ainsi que des prédateurs comme les lions et les léopards.',
      de: 'Der Serengeti ist weltbekannt für seine endlosen Ebenen und die Große Migration. Heimat von Millionen von Gnus, Zebras und Gazellen, sowie Raubtieren wie Löwen und Leoparden.',
      es: 'El Serengeti es mundialmente famoso por sus llanuras interminables y la Gran Migración. Hogar de millones de ñus, cebras y gacelas, además de depredadores como leones y leopardos.',
      ar: 'السيرينجيتي مشهور عالميا بسهوله اللانهائية والهجرة الكبرى. موطن لملايين من حيوان الغنم البري والحمر الوحشية والغزلان، بالإضافة إلى الحيوانات المفترسة مثل الأسود والفهود.',
      sw: 'Serengeti inajulikana duniani kwa vilima vyake visivyokoma na Migration Kubwa. Nyumbani kwa mamia ya nyundo, panda, na swala, pamoja na wanyama wa majina kama simba na chui.',
      zh: '塞伦盖蒂以无边无际的平原和大迁徙闻名于世。这里生活着数百万头牛羚、斑马和小羚羊，还有狮子和豹子等捕食者。',
    };
    return responses[language];
  }

  private getBestTimeInfo(language: Language): string {
    const responses: Record<Language, string> = {
      en: 'The best time to visit East Africa depends on what you want to experience: Wildlife viewing is excellent June-October (dry season), the Great Migration peaks July-September, and green season (November-May) offers lower prices and great birding.',
      fr: 'Le meilleur moment pour visiter l\'Afrique de l\'Est dépend de ce que vous voulez vivre: L\'observation de la faune est excellente juin-octobre, la Grande Migration atteint son apogée juillet-septembre.',
      de: 'Die beste Zeit für Ostafrika hängt davon ab, was Sie erleben möchten: Tierbeobachtung ist Juni-Oktober ausgezeichnet, die Große Migration erreicht ihren Höhepunkt Juli-September.',
      es: 'El mejor momento para visitar África Oriental depende de lo que quieras experimentar: El avistamiento de vida silvestre es excelente junio-octubre, la Gran Migración alcanza su punto máximo julio-septiembre.',
      ar: 'أفضل وقت لزيارة شرق أفريقيا يعتمد على ما تريد تجربته: مشاهدة الحياة البرية ممتازة يونيو-أكتوبر، ذروة الهجرة الكبرى يوليو-سبتمبر.',
      sw: 'Wakati bora wa kutembelea Afrika ya Mashariki unategemea unachotaka kuona: Kuangalia wanyama ni vizuri Juni-Oktoba, Migration Kubwa inafikia kilele Julai-Septemba.',
      zh: '访问东非的最佳时间取决于您想体验什么：野生动物观赏在6月至10月最佳，大迁徙的高峰期是7月至9月。',
    };
    return responses[language];
  }

  private getPricingInfo(language: Language): string {
    const responses: Record<Language, string> = {
      en: 'Safari pricing varies based on luxury level and duration: Budget safaris start at $100-200/day, mid-range at $300-500/day, and luxury can be $500-1500+/day. Beach resorts in Zanzibar range from $100-800/night.',
      fr: 'Les prix des safaris varient selon le niveau de luxe et la durée: Les safaris économiques commencent à 100-200€/jour, milieu de gamme à 300-500€/jour, et luxe à 500-1500€+/jour.',
      de: 'Safari-Preise variieren je nach Luxusniveau und Dauer: Budget-Safaris beginnen bei 100-200€/Tag, Mittelklasse bei 300-500€/Tag, und Luxus bei 500-1500€+/Tag.',
      es: 'Los precios de safari varían según el nivel de lujo y la duración: Safaris económicos desde $100-200/día, gama media $300-500/día, y lujo $500-1500+/día.',
      ar: 'تختلف أسعار السفاري حسب مستوى الفخامة والمدة: تبدأ السفاري الاقتصادية من 100-200 دولار/يوم، متوسطة المدى 300-500 دولار/يوم، والفاخرة 500-1500+/يوم.',
      sw: 'Bei ya safari inatofautiana kulingana na kiwango cha luxu na muda: Safari za bajeti huanza $100-200/siku, wastani $300-500/siku, na luxu $500-1500+/siku.',
      zh: 'Safari价格因豪华程度和持续时间而异：经济型safari起价100-200美元/天，中档300-500美元/天，豪华型500-1500美元以上/天。',
    };
    return responses[language];
  }

  private getDefaultResponse(language: Language): string {
    const responses: Record<Language, string> = {
      en: 'I\'m here to help you plan your African adventure! I can provide information about destinations, wildlife, cultural experiences, pricing, and help you find the perfect safari or beach getaway. What would you like to know?',
      fr: 'Je suis là pour vous aider à planifier votre aventure africaine! Je peux fournir des informations sur les destinations, la faune, les expériences culturelles, les prix et vous aider à trouver le safari ou le séjour plage parfait.',
      de: 'Ich bin hier, um Ihnen bei der Planung Ihres afrikanischen Abenteuers zu helfen! Ich kann Informationen über Reiseziele, Tierwelt, kulturelle Erlebnisse, Preise liefern und Ihnen helfen, die perfekte Safari oder den perfekten Strandurlaub zu finden.',
      es: '¡Estoy aquí para ayudarte a planificar tu aventura africana! Puedo proporcionar información sobre destinos, vida silvestre, experiencias culturales, precios y ayudarte a encontrar el safari o escape a la playa perfecto.',
      ar: 'أنا هنا لمساعدتك في التخطيط لمغامرك الأفريقي! يمكنني تقديم معلومات حول الوجهات والحياة البرية والتجارب الثقافية والأسعار ومساعدتك في finding the perfect safari.',
      sw: 'Niko hapa kukusaidia kupanga aventura yako ya Kiafrika! Naweza kutoa maelezo kuhusu sehemu, wanyama, uzoefu wa kitamaduni, bei, na kukusaidia kupata safari au likizo ya ufuo ya kipekee.',
      zh: '我在这里帮助您规划非洲冒险！我可以提供关于目的地、野生动物、文化体验、价格的信息，并帮助您找到完美的safari或海滩度假。',
    };
    return responses[language];
  }

  private generateSuggestions(message: string, language: Language): string[] {
    const suggestions: Record<Language, string[]> = {
      en: [
        'What are the best safari destinations?',
        'Tell me about Maasai Mara',
        'Plan a 7-day Tanzania itinerary',
      ],
      fr: [
        'Quelles sont les meilleures destinations safari?',
        'Parlez-moi du Maasai Mara',
        'Planifiez un itinéraire de 7 jours en Tanzanie',
      ],
      de: [
        'Was sind die besten Safari-Ziele?',
        'Erzählen Sie mir vom Maasai Mara',
        'Planen Sie eine 7-tägige Tansania-Reise',
      ],
      es: [
        '¿Cuáles son los mejores destinos de safari?',
        'Cuéntame sobre Maasai Mara',
        'Planifica un itinerario de 7 días en Tanzania',
      ],
      ar: [
        'ما هي أفضل وجهات السفاري؟',
        'أخبرني عن ماساي مارا',
        'خطط لرحلة 7 أيام في تنزانيا',
      ],
      sw: [
        'Sehemu bora za safari ni zipi?',
        'Niambie kuhusu Maasai Mara',
        'Panga ratiba ya siku 7 Tanzania',
      ],
      zh: [
        '最好的safari目的地是什么？',
        '告诉我关于马赛马拉',
        '计划7天的坦桑尼亚行程',
      ],
    };

    return suggestions[language];
  }
}

export const aiConciergeService = new AIConciergeService();
