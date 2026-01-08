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
      content: string[];
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
    blogPost: string;
  };
};

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      insight: "Problem",
      method: "Solution",
      journey: "Process",
      journal: "Blog"
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
          readTime: "4 min read",
          content: [
            "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away. In digital product design, we often mistake abundance for value. We add features to justify price tags, forgetting that every new button adds cognitive load.",
            "True craftsmanship is the art of subtraction. It is the courage to say 'no' to good ideas so that the great ones can breathe. When we strip away the decorative, the essential remains. This is not about aesthetic minimalism; it is about functional clarity.",
            "We believe that software should behave like a good tool in a workshop: precise, reliable, and invisible until needed. It shouldn't clamor for your attention; it should wait for your intent."
          ]
        },
        {
          title: "Cognitive Archaeology",
          excerpt: "Digging through your own notes shouldn't feel like a chore. How to build a second brain that lasts.",
          date: "Oct 08",
          readTime: "6 min read",
          content: [
            "Your notes are artifacts of your past self. But often, they are buried in a digital landfill, never to be seen again. We treat note-taking as a storage problem, when it is really a retrieval problem.",
            "Cognitive archaeology is the practice of designing your workspace so that ideas resurface when you need them. It is about creating pathways between thoughts, ensuring that a spark from three years ago can ignite a fire today.",
            "Instead of folders, we use associations. Instead of search, we use context. The goal is to create a living system that grows smarter the more you use it, turning a graveyard of text into a garden of insights."
          ]
        },
        {
          title: "Silence as a Service",
          excerpt: "In an attention economy, paying for silence is the new luxury. The rise of calm technology.",
          date: "Sep 29",
          readTime: "3 min read",
          content: [
            "We live in an age of notification supremacy. Every app wants a piece of your mind. Silence has become a premium commodity, sold back to us in the form of noise-canceling headphones and retreat centers.",
            "Calm technology respects your attention. It does not demand; it awaits. It informs without burdening. As we move forward, the most valuable tools will be the ones that know when to stay quiet.",
            "We design for the 'flow state'. This means no red badges, no pop-ups, and no gamification. Just a clean, empty canvas that invites you to fill it with your own meaning."
          ]
        },
        {
          title: "Analog Minds, Digital Tools",
          excerpt: "Bridging the tactile satisfaction of paper with the infinite recall of software.",
          date: "Sep 15",
          readTime: "5 min read",
          content: [
            "There is a reason we still reach for a notebook. The friction of paper slows us down, forcing us to think before we write. Digital tools offer infinite speed and editability, but often at the cost of retention.",
            "The ideal workflow bridges these worlds. It captures the fluidity of ink and the permanence of code. We need tools that feel as natural as a sketchbook but as powerful as a database.",
            "Our interface mimics the physical properties of paper—the texture, the whitespace, the permanence—while providing the magical capabilities of software, like instant search and infinite undo."
          ]
        },
        {
          title: "The Myth of Multitasking",
          excerpt: "Neuroscience confirms what we already felt: doing two things at once is doing neither well.",
          date: "Aug 30",
          readTime: "7 min read",
          content: [
            "The human brain is a sequential processor. We cannot do two things at once; we can only switch between them very quickly. This switching comes with a metabolic cost. We call it 'multitasking', but it is really 'micro-distraction'.",
            "Deep work requires momentum. Every time you tab-switch, you break the chain. To reclaim our productivity, we must reclaim our ability to do one thing at a time, for a long time.",
            "Essential forces a single-context view. You cannot see your email while you write. You cannot see your calendar while you code. This constraint is our most powerful feature."
          ]
        },
        {
          title: "Architecture of Thought",
          excerpt: "How the visual structure of your workspace influences the structure of your arguments.",
          date: "Aug 22",
          readTime: "5 min read",
          content: [
            "We shape our tools, and thereafter our tools shape us. A linear document processor encourages linear thinking. A spatial canvas encourages lateral connections. The interface is not neutral; it is the scaffolding of your thought process.",
            "By choosing tools that allow for spatial organization, we unlock the brain's natural ability to map concepts. We move from lists to constellations, seeing the big picture without losing the details.",
            "Our spatial view allows you to arrange ideas like cards on a table. You can group them, stack them, or scatter them. It is thinking with your hands, on a screen."
          ]
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
        manifesto: "Manifesto"
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
      blogPost: "This article will be available on the full platform launch."
    }
  },
  pl: {
    nav: {
      insight: "Problem",
      method: "Rozwiązanie",
      journey: "Proces",
      journal: "Blog"
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
          readTime: "4 min czytania",
          content: [
            "Perfekcję osiąga się nie wtedy, gdy nie ma już nic do dodania, ale wtedy, gdy nie ma już nic do odjęcia. W projektowaniu produktów cyfrowych często mylimy obfitość z wartością. Dodajemy funkcje, by uzasadnić cenę, zapominając, że każdy nowy przycisk zwiększa obciążenie poznawcze.",
            "Prawdziwe rzemiosło to sztuka odejmowania. To odwaga mówienia 'nie' dobrym pomysłom, aby te wspaniałe mogły oddychać. Kiedy odrzucimy to, co dekoracyjne, pozostaje to, co istotne. Nie chodzi tu o estetyczny minimalizm, ale o funkcjonalną jasność.",
            "Wierzymy, że oprogramowanie powinno zachowywać się jak dobre narzędzie w warsztacie: precyzyjne, niezawodne i niewidoczne, dopóki nie jest potrzebne. Nie powinno domagać się twojej uwagi; powinno czekać na twoją intencję."
          ]
        },
        {
          title: "Archeologia Poznawcza",
          excerpt: "Przekopywanie się przez własne notatki nie powinno być udręką. Jak zbudować 'drugi mózg', który przetrwa lata.",
          date: "08 Paź",
          readTime: "6 min czytania",
          content: [
            "Twoje notatki to artefakty twojego przeszłego ja. Często jednak są pogrzebane w cyfrowym wysypisku, nigdy więcej nie oglądane. Traktujemy robienie notatek jako problem przechowywania, podczas gdy w rzeczywistości jest to problem odzyskiwania.",
            "Archeologia poznawcza to praktyka projektowania przestrzeni roboczej tak, aby pomysły wypływały na powierzchnię, gdy ich potrzebujesz. Chodzi o tworzenie ścieżek między myślami, zapewnienie, że iskra sprzed trzech lat może rozpalić ogień dzisiaj.",
            "Zamiast folderów używamy skojarzeń. Zamiast wyszukiwania używamy kontekstu. Celem jest stworzenie żywego systemu, który staje się mądrzejszy, im więcej go używasz, zamieniając cmentarzysko tekstu w ogród spostrzeżeń."
          ]
        },
        {
          title: "Cisza jako Usługa",
          excerpt: "W gospodarce uwagi płacenie za ciszę staje się nowym luksusem. Wzrost popularności 'calm technology'.",
          date: "29 Wrz",
          readTime: "3 min czytania",
          content: [
            "Żyjemy w epoce supremacji powiadomień. Każda aplikacja chce kawałka twojego umysłu. Cisza stała się towarem luksusowym, sprzedawanym nam z powrotem w postaci słuchawek z redukcją szumów i ośrodków odosobnienia.",
            "Spokojna technologia (calm technology) szanuje twoją uwagę. Nie żąda; czeka. Informuje bez obciążania. W miarę jak posuwamy się naprzód, najcenniejszymi narzędziami będą te, które wiedzą, kiedy milczeć.",
            "Projektujemy dla stanu 'flow'. Oznacza to brak czerwonych odznak, brak wyskakujących okienek i brak grywalizacji. Tylko czyste, puste płótno, które zaprasza do wypełnienia go własnym sensem."
          ]
        },
        {
          title: "Analogowe Umysły, Cyfrowe Narzędzia",
          excerpt: "Łączenie dotykowej satysfakcji papieru z nieskończoną pamięcią oprogramowania.",
          date: "15 Wrz",
          readTime: "5 min czytania",
          content: [
            "Jest powód, dla którego wciąż sięgamy po notatnik. Tarcie papieru spowalnia nas, zmuszając do myślenia przed napisaniem. Narzędzia cyfrowe oferują nieskończoną prędkość i edytowalność, ale często kosztem retencji.",
            "Idealny przepływ pracy łączy te światy. Chwyta płynność atramentu i trwałość kodu. Potrzebujemy narzędzi, które są tak naturalne jak szkicownik, ale tak potężne jak baza danych.",
            "Nasz interfejs naśladuje fizyczne właściwości papieru — fakturę, białą przestrzeń, trwałość — jednocześnie zapewniając magiczne możliwości oprogramowania, takie jak natychmiastowe wyszukiwanie i nieskończone cofanie."
          ]
        },
        {
          title: "Mit Wielozadaniowości",
          excerpt: "Neuronauka potwierdza to, co już czuliśmy: robienie dwóch rzeczy naraz to nierobienie żadnej z nich dobrze.",
          date: "30 Sie",
          readTime: "7 min czytania",
          content: [
            "Ludzki mózg jest procesorem sekwencyjnym. Nie możemy robić dwóch rzeczy naraz; możemy tylko bardzo szybko przełączać się między nimi. To przełączanie wiąże się z kosztem metabolicznym. Nazywamy to 'wielozadaniowością', ale w rzeczywistości jest to 'mikro-rozproszenie'.",
            "Głęboka praca wymaga rozpędu. Za każdym razem, gdy przełączasz kartę, przerywasz łańcuch. Aby odzyskać naszą produktywność, musimy odzyskać zdolność robienia jednej rzeczy naraz, przez długi czas.",
            "Essential wymusza widok pojedynczego kontekstu. Nie możesz widzieć e-maila podczas pisania. Nie możesz widzieć kalendarza podczas kodowania. To ograniczenie jest naszą najpotężniejszą funkcją."
          ]
        },
        {
          title: "Architektura Myśli",
          excerpt: "Jak wizualna struktura twojej przestrzeni roboczej wpływa na strukturę twoich argumentów.",
          date: "22 Sie",
          readTime: "5 min czytania",
          content: [
            "Kształtujemy nasze narzędzia, a potem nasze narzędzia kształtują nas. Liniowy edytor tekstu zachęca do myślenia liniowego. Przestrzenne płótno zachęca do połączeń bocznych. Interfejs nie jest neutralny; jest rusztowaniem twojego procesu myślowego.",
            "Wybierając narzędzia, które pozwalają na organizację przestrzenną, odblokowujemy naturalną zdolność mózgu do mapowania pojęć. Przechodzimy od list do konstelacji, widząc duży obraz bez utraty szczegółów.",
            "Nasze przestrzenne widoki pozwalają układać pomysły jak karty na stole. Możesz je grupować, układać w stosy lub rozrzucać. To myślenie rękami, na ekranie."
          ]
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
        manifesto: "Manifest"
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