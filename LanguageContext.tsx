import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pl' | 'en';

type Translations = {
  nav: {
    insight: string;
    method: string;
    journey: string;
    journal: string;
  };
  hero: {
    title1: string;
    title2: string;
    subtitle: string;
    scroll: string;
  };
  problem: {
    fig: string;
    headingPart1: string;
    headingBusy: string;
    headingWith: string;
    headingProductive: string;
    text1: string;
    text2: string;
  };
  solution: {
    label: string;
    heading: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    quote: string;
  };
  process: {
    label: string;
    steps: Array<{
      title: string;
      desc: string;
    }>;
  };
  trust: {
    label: string;
  };
  blog: {
    label: string;
    readMore: string;
    articles: Array<{
      title: string;
      excerpt: string;
      date: string;
      readTime: string;
    }>;
  };
  cta: {
    heading: string;
    subheading: string;
    button: string;
  };
  footer: {
    desc: string;
    links: {
      manifesto: string;
      pricing: string;
      login: string;
    };
  };
  modal: {
    title: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    close: string;
  };
  alerts: {
    manifesto: string;
    pricing: string;
    login: string;
    blogPost: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      insight: "Insight",
      method: "Method",
      journey: "Journey",
      journal: "Journal"
    },
    hero: {
      title1: "Silence",
      title2: "the noise.",
      subtitle: "A digital workspace designed to remove everything but the work itself. No notifications. No clutter. Just flow.",
      scroll: "Scroll"
    },
    problem: {
      fig: "FIG 01. / SATURATION",
      headingPart1: "We have confused",
      headingBusy: "busy",
      headingWith: "with",
      headingProductive: "productive.",
      text1: "The modern interface is a carnival of red dots, banners, and constant urgency. Your attention is the currency, and it is being spent by everyone but you.",
      text2: "Deep work requires a sanctuary, not a marketplace."
    },
    solution: {
      label: "The Solution",
      heading: "A tool that dares to fade away.",
      feature1Title: "Radical Minimalism",
      feature1Desc: "Tools only appear when you move your mouse. The rest of the time, it is just you and your thoughts.",
      feature2Title: "Structured Flow",
      feature2Desc: "We organize your scattered ideas into coherent streams, automatically. No filing required.",
      quote: "\"It feels less like software and more like a quiet room with a view.\""
    },
    process: {
      label: "How it works",
      steps: [
        { title: "Capture", desc: "Dump your raw thoughts, links, and fragments. The canvas accepts everything without asking you to categorize it first." },
        { title: "Refine", desc: "Highlight what matters. Our subtle AI suggests connections you might have missed, turning noise into signal." },
        { title: "Create", desc: "Distraction-free output mode. When you are ready to write, the research fades to the back, but stays within reach." }
      ]
    },
    trust: {
      label: "Quietly empowering thinkers at"
    },
    blog: {
      label: "The Journal",
      readMore: "Read Article",
      articles: [
        {
          title: "The Art of Subtraction",
          excerpt: "Why removing features is the ultimate feature. A look into the philosophy of reductionist design.",
          date: "Oct 12",
          readTime: "4 min read"
        },
        {
          title: "Cognitive Archaeology",
          excerpt: "Digging through your own notes shouldn't feel like a chore. How to build a second brain that lasts.",
          date: "Oct 08",
          readTime: "6 min read"
        },
        {
          title: "Silence as a Service",
          excerpt: "In an attention economy, paying for silence is the new luxury. The rise of calm technology.",
          date: "Sep 29",
          readTime: "3 min read"
        },
        {
          title: "Analog Minds, Digital Tools",
          excerpt: "Bridging the tactile satisfaction of paper with the infinite recall of software.",
          date: "Sep 15",
          readTime: "5 min read"
        },
        {
          title: "The Myth of Multitasking",
          excerpt: "Neuroscience confirms what we already felt: doing two things at once is doing neither well.",
          date: "Aug 30",
          readTime: "7 min read"
        },
        {
          title: "Architecture of Thought",
          excerpt: "How the visual structure of your workspace influences the structure of your arguments.",
          date: "Aug 22",
          readTime: "5 min read"
        }
      ]
    },
    cta: {
      heading: "Your mind is a terrible thing to clutter.",
      subheading: "Join the waitlist for Essential. Invitation only. No spam, ever.",
      button: "Request Access"
    },
    footer: {
      desc: "Designed for clarity in a chaotic world.",
      links: {
        manifesto: "Manifesto",
        pricing: "Pricing",
        login: "Login"
      }
    },
    modal: {
      title: "Join the Waitlist",
      emailPlaceholder: "Enter your email address",
      submit: "Request Invitation",
      submitting: "Sending...",
      success: "You are on the list.",
      close: "Close"
    },
    alerts: {
      manifesto: "The Essential Manifesto is coming soon.",
      pricing: "Pricing is available upon request for enterprise teams.",
      login: "The login portal is currently restricted to early access members.",
      blogPost: "This article will be available on the full platform launch."
    }
  },
  pl: {
    nav: {
      insight: "Wgląd",
      method: "Metoda",
      journey: "Podróż",
      journal: "Dziennik"
    },
    hero: {
      title1: "Ucisz",
      title2: "zgiełk.",
      subtitle: "Cyfrowa przestrzeń pracy zaprojektowana, by usunąć wszystko poza samą pracą. Żadnych powiadomień. Żadnego bałaganu. Tylko flow.",
      scroll: "Przewiń"
    },
    problem: {
      fig: "RYS 01. / NASYCENIE",
      headingPart1: "Mylimy bycie",
      headingBusy: "zajętym",
      headingWith: "z byciem",
      headingProductive: "produktywnym.",
      text1: "Współczesny interfejs to karnawał czerwonych kropek, banerów i ciągłej pilności. Twoja uwaga jest walutą wydawaną przez wszystkich, tylko nie przez ciebie.",
      text2: "Głęboka praca wymaga świątyni, a nie targowiska."
    },
    solution: {
      label: "Rozwiązanie",
      heading: "Narzędzie, które ma odwagę zniknąć.",
      feature1Title: "Radykalny Minimalizm",
      feature1Desc: "Narzędzia pojawiają się tylko wtedy, gdy poruszysz myszką. Przez resztę czasu jesteś tylko ty i twoje myśli.",
      feature2Title: "Uporządkowany Przepływ",
      feature2Desc: "Organizujemy twoje rozproszone pomysły w spójne strumienie, automatycznie. Bez konieczności katalogowania.",
      quote: "„To mniej przypomina oprogramowanie, a bardziej cichy pokój z widokiem.”"
    },
    process: {
      label: "Jak to działa",
      steps: [
        { title: "Chwytaj", desc: "Wyrzuć z siebie surowe myśli, linki i fragmenty. Płótno przyjmuje wszystko, nie pytając najpierw o kategorię." },
        { title: "Udoskonalaj", desc: "Wyróżnij to, co ważne. Nasze subtelne AI sugeruje połączenia, które mogłeś przeoczyć, zamieniając szum w sygnał." },
        { title: "Twórz", desc: "Tryb tworzenia bez rozpraszaczy. Kiedy jesteś gotowy pisać, research usuwa się w cień, ale pozostaje w zasięgu ręki." }
      ]
    },
    trust: {
      label: "Cicho wspieramy myślicieli z"
    },
    blog: {
      label: "Dziennik",
      readMore: "Czytaj dalej",
      articles: [
        {
          title: "Sztuka Odejmowania",
          excerpt: "Dlaczego usuwanie funkcji jest najważniejszą funkcją. Spojrzenie na filozofię projektowania redukcjonistycznego.",
          date: "12 Paź",
          readTime: "4 min czytania"
        },
        {
          title: "Archeologia Poznawcza",
          excerpt: "Przekopywanie się przez własne notatki nie powinno być udręką. Jak zbudować 'drugi mózg', który przetrwa lata.",
          date: "08 Paź",
          readTime: "6 min czytania"
        },
        {
          title: "Cisza jako Usługa",
          excerpt: "W gospodarce uwagi płacenie za ciszę staje się nowym luksusem. Wzrost popularności 'calm technology'.",
          date: "29 Wrz",
          readTime: "3 min czytania"
        },
        {
          title: "Analogowe Umysły, Cyfrowe Narzędzia",
          excerpt: "Łączenie dotykowej satysfakcji papieru z nieskończoną pamięcią oprogramowania.",
          date: "15 Wrz",
          readTime: "5 min czytania"
        },
        {
          title: "Mit Wielozadaniowości",
          excerpt: "Neuronauka potwierdza to, co już czuliśmy: robienie dwóch rzeczy naraz to nierobienie żadnej z nich dobrze.",
          date: "30 Sie",
          readTime: "7 min czytania"
        },
        {
          title: "Architektura Myśli",
          excerpt: "Jak wizualna struktura twojej przestrzeni roboczej wpływa na strukturę twoich argumentów.",
          date: "22 Sie",
          readTime: "5 min czytania"
        }
      ]
    },
    cta: {
      heading: "Twój umysł to zbyt cenna rzecz, by go zaśmiecać.",
      subheading: "Dołącz do listy oczekujących na Essential. Tylko na zaproszenie. Zero spamu.",
      button: "Poproś o Dostęp"
    },
    footer: {
      desc: "Zaprojektowane dla jasności w chaotycznym świecie.",
      links: {
        manifesto: "Manifest",
        pricing: "Cennik",
        login: "Zaloguj"
      }
    },
    modal: {
      title: "Dołącz do listy oczekujących",
      emailPlaceholder: "Wpisz swój adres email",
      submit: "Poproś o Zaproszenie",
      submitting: "Wysyłanie...",
      success: "Jesteś na liście.",
      close: "Zamknij"
    },
    alerts: {
      manifesto: "Manifest Essential pojawi się wkrótce.",
      pricing: "Cennik dostępny na żądanie dla zespołów.",
      login: "Portal logowania jest obecnie ograniczony do członków wczesnego dostępu.",
      blogPost: "Ten artykuł będzie dostępny po pełnym uruchomieniu platformy."
    }
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pl');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pl' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};