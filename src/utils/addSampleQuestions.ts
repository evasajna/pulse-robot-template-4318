import { supabase } from "@/integrations/supabase/client";

export const addSampleQuestions = async (quizId: string) => {
  const sampleQuestions = [
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ തലസ്ഥാനം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["ന്യൂഡൽഹി", "മുംബൈ", "കൊൽക്കത്ത", "ചെന്നൈ"],
      correct_answer: "ന്യൂഡൽഹി"
    },
    {
      quiz_id: quizId,
      question_text: "വിസ്തീർണ്ണത്തിൽ ഇന്ത്യയിലെ ഏറ്റവും വലിയ സംസ്ഥാനം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["രാജസ്ഥാൻ", "മധ്യപ്രദേശ്", "ഉത്തരപ്രദേശ്", "മഹാരാഷ്ട്ര"],
      correct_answer: "രാജസ്ഥാൻ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ദേശീയ മൃഗം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["സിംഹം", "കടുവ", "ആന", "മയിൽ"],
      correct_answer: "കടുവ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയിലെ ഏറ്റവും പവിത്രമായി കരുതപ്പെടുന്ന നദി ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["യമുന", "ഗംഗ", "ഗോദാവരി", "നർമദ"],
      correct_answer: "ഗംഗ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ദേശീയ ഗാനം രചിച്ചത് ആരാണ്?",
      question_type: "multiple_choice" as const,
      options: ["രവീന്ദ്രനാഥ് ടാഗോർ", "ബങ്കിം ചന്ദ്ര ചാറ്റോപാധ്യായ്", "സരോജിനി നായിഡു", "മഹാത്മാ ഗാന്ധി"],
      correct_answer: "രവീന്ദ്രനാഥ് ടാഗോർ"
    },
    {
      quiz_id: quizId,
      question_text: "കേരളത്തിന്റെ തലസ്ഥാനം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["തിരുവനന്തപുരം", "കൊച്ചി", "കോഴിക്കോട്", "തൃശൂർ"],
      correct_answer: "തിരുവനന്തപുരം"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ സ്വാതന്ത്ര്യ ദിനം ഏത് തീയതിയാണ്?",
      question_type: "multiple_choice" as const,
      options: ["ഓഗസ്റ്റ് 15", "ജനുവരി 26", "ഒക്ടോബർ 2", "മാർച്ച് 23"],
      correct_answer: "ഓഗസ്റ്റ് 15"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ദേശീയ പക്ഷി ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["മയിൽ", "കഴുകൻ", "കാക്ക", "പ്രാവ്"],
      correct_answer: "മയിൽ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയിലെ ഏറ്റവും ഉയരമുള്ള പർവ്വത കൊടുമുടി ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["കഞ്ചൻജംഗ", "നന്ദാദേവി", "ധൗലാഗിരി", "മൗണ്ട് എവറസ്റ്റ്"],
      correct_answer: "കഞ്ചൻജംഗ"
    },
    {
      quiz_id: quizId,
      question_text: "കേരളത്തിലെ ഏറ്റവും നീളമുള്ള നദി ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["പെരിയാർ", "ഭരതപ്പുഴ", "പമ്പ", "കാബിനി"],
      correct_answer: "പെരിയാർ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ആദ്യ പ്രധാനമന്ത്രി ആരായിരുന്നു?",
      question_type: "multiple_choice" as const,
      options: ["ജവഹർലാൽ നെഹ്‌റു", "മഹാത്മാ ഗാന്ധി", "സർദാർ വല്ലഭായി പട്ടേൽ", "ഡോ. രാജേന്ദ്ര പ്രസാദ്"],
      correct_answer: "ജവഹർലാൽ നെഹ്‌റു"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ദേശീയ ഫലം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["മാങ്ങ", "ആപ്പിൾ", "വാഴപ്പഴം", "ഓറഞ്ച്"],
      correct_answer: "മാങ്ങ"
    },
    {
      quiz_id: quizId,
      question_text: "കേരളത്തിന്റെ ഔദ്യോഗിക ഭാഷ ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["മലയാളം", "ഇംഗ്ലീഷ്", "ഹിന്ദി", "തമിഴ്"],
      correct_answer: "മലയാളം"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയിലെ ഏറ്റവും ദക്ഷിണേന്ത്യൻ സംസ്ഥാനം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["കേരളം", "തമിഴ്നാട്", "കർണാടകം", "ആന്ധ്രപ്രദേശ്"],
      correct_answer: "തമിഴ്നാട്"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ദേശീയ കായിക വിനോദം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["ഹോക്കി", "ക്രിക്കറ്റ്", "ഫുട്ബോൾ", "കബഡി"],
      correct_answer: "ഹോക്കി"
    },
    {
      quiz_id: quizId,
      question_text: "കേരളത്തിലെ ഏറ്റവും വലിയ ശുദ്ധജല തടാകം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["വേമ്പനാട് കായൽ", "അഷ്ടമുടി കായൽ", "പുന്നമട കായൽ", "കുട്ടനാട്"],
      correct_answer: "വേമ്പനാട് കായൽ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയുടെ ദേശീയ പുഷ്പം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["താമര", "റോസ്", "ജാസ്മിൻ", "സൂര്യകാന്തി"],
      correct_answer: "താമര"
    },
    {
      quiz_id: quizId,
      question_text: "കേരളത്തിന്റെ ഔദ്യോഗിക പക്ഷി ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["ഗ്രേറ്റ് ഹോൺബിൽ", "കൊക്ക്", "മയിൽ", "പ്രാവ്"],
      correct_answer: "ഗ്രേറ്റ് ഹോൺബിൽ"
    },
    {
      quiz_id: quizId,
      question_text: "ഇന്ത്യയിലെ ഏറ്റവും പ്രധാനപ്പെട്ട തുറമുഖം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["മുംബൈ", "കൊൽക്കത്ത", "ചെന്നൈ", "കൊച്ചി"],
      correct_answer: "മുംബൈ"
    },
    {
      quiz_id: quizId,
      question_text: "കേരളത്തിലെ ഏറ്റവും പ്രസിദ്ധമായ നൃത്തരൂപം ഏതാണ്?",
      question_type: "multiple_choice" as const,
      options: ["കഥകളി", "ഭരതനാട്യം", "ഒഡിസി", "കുച്ചിപുടി"],
      correct_answer: "കഥകളി"
    }
  ];

  try {
    const { error } = await supabase
      .from("questions")
      .insert(sampleQuestions);

    if (error) throw error;
    return { success: true, count: sampleQuestions.length };
  } catch (error) {
    console.error("Error adding sample questions:", error);
    return { success: false, error };
  }
};