// Demo mode mock responses — no OpenAI API key required

const SILENT_WAV_B64 =
  "UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

export const DEMO_AUDIO_DATA_URL = `data:audio/wav;base64,${SILENT_WAV_B64}`;

export const DEMO_LISTENING = {
  title: "A Day at the Coffee Shop",
  transcript: `Sarah: Hi! Could I get a medium latte, please?
Barista: Of course! Would you like any flavor syrup with that?
Sarah: Yes, could I have vanilla? And actually, could you make it oat milk instead of regular?
Barista: Absolutely. That'll be one oat milk vanilla latte. Can I get a name for the order?
Sarah: Sarah, please. Oh, and do you have any blueberry muffins left?
Barista: We have one left! Would you like it warmed up?
Sarah: Yes please, that would be great. How long will it take?
Barista: About five minutes. We're a little busy this morning — there's a conference nearby.
Sarah: No problem at all. I'll just sit by the window while I wait.
Barista: Perfect. We'll call your name when it's ready!`,
  audioUrl: DEMO_AUDIO_DATA_URL,
  duration: 38,
};

export const DEMO_QUIZ = {
  questions: [
    {
      id: 1,
      question: "What drink did Sarah order?",
      options: [
        "A regular latte with whole milk",
        "An oat milk vanilla latte",
        "A cappuccino with almond milk",
        "A black coffee",
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      question: "What food did Sarah also purchase?",
      options: [
        "A chocolate croissant",
        "A cinnamon roll",
        "A blueberry muffin",
        "A banana bread slice",
      ],
      correctIndex: 2,
    },
    {
      id: 3,
      question: "Why did the barista say the shop was busy?",
      options: [
        "It was a holiday morning",
        "There was a conference nearby",
        "A sports event was taking place",
        "They were short-staffed",
      ],
      correctIndex: 1,
    },
    {
      id: 4,
      question: "Where did Sarah decide to wait?",
      options: [
        "At the counter",
        "Outside on the patio",
        "In a corner booth",
        "By the window",
      ],
      correctIndex: 3,
    },
    {
      id: 5,
      question: "How would the barista notify Sarah when her order was ready?",
      options: [
        "By sending a text message",
        "By calling her name",
        "By handing her a buzzer",
        "By placing it on a shelf",
      ],
      correctIndex: 1,
    },
  ],
};

export const DEMO_TRANSCRIPT =
  `Alex: So, what did you do last weekend?
Jamie: It was great! On Saturday I went to a local market with my friend. We bought some fresh vegetables and tried street food.
Alex: Oh nice! What kind of street food did you have?
Jamie: We had these amazing tacos — very spicy but delicious. And then we walked around the park for about an hour.
Alex: That sounds like a perfect day. Did you go anywhere on Sunday?
Jamie: Sunday was more relaxing. I stayed home and watched a documentary about ocean wildlife. It was really interesting. What about you?
Alex: I went hiking with my family. The trail was quite difficult, but the view from the top was absolutely beautiful.
Jamie: Wow, I'd love to do that. I haven't been hiking in a long time. Maybe we could go together next month?
Alex: That's a great idea! There's a trail about 30 kilometers from the city that's really popular.
Jamie: Perfect. Let's plan it!`;

export const DEMO_FEEDBACK = {
  overallScore: 76,
  summary:
    "Great conversation with natural flow! You used a good variety of tenses and expressed opinions clearly.",
  points: [
    {
      category: "grammar",
      title: "Good use of past tenses",
      detail:
        "Both speakers correctly used simple past ('went', 'bought', 'had') throughout the conversation. Watch out for mixing present and past: 'I haven't been hiking in a long time' is perfect — keep using present perfect this way.",
      positive: true,
    },
    {
      category: "vocabulary",
      title: "Natural everyday expressions",
      detail:
        "Phrases like 'It was great!', 'That sounds like a perfect day', and 'Let's plan it!' show good command of conversational English. Try adding more descriptive adjectives beyond 'amazing' and 'beautiful'.",
      positive: true,
    },
    {
      category: "fluency",
      title: "Some hesitation patterns",
      detail:
        "The conversation had good back-and-forth rhythm. To improve fluency further, try to avoid restarting sentences mid-thought. Use fillers like 'Well…' or 'You know…' naturally when you need a moment to think.",
      positive: false,
    },
    {
      category: "pronunciation",
      title: "Tip: stress content words",
      detail:
        "In English, stress falls on content words (nouns, verbs, adjectives). For example: 'The TRAIL was quite DIFFICULT, but the VIEW from the TOP was absolutely BEAUTIFUL.' Practising this rhythm will make you sound more natural.",
      positive: false,
    },
  ],
  quizQuestions: [
    {
      id: 1,
      question: "Which tense is used in 'I haven't been hiking in a long time'?",
      options: [
        "Simple past",
        "Present perfect",
        "Past continuous",
        "Past perfect",
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      question:
        "What is the most natural way to suggest a future plan in this conversation's style?",
      options: [
        "We will go together next month",
        "Let's plan it!",
        "I am going to plan it",
        "We shall do it",
      ],
      correctIndex: 1,
    },
    {
      id: 3,
      question:
        "Which word best fills the gap: 'The view was _____ beautiful'?",
      options: ["very", "so much", "absolutely", "too"],
      correctIndex: 2,
    },
  ],
};
