export interface Chapter {
  id: number;
  title: string;
  arabicTitle: string;
  content: string[];
}

export const bookTitle = "Islam is the Deen of GOD";
export const bookAuthor = "Author";

export const chapters: Chapter[] = [
  {
    id: 1,
    title: "The Meaning of Islam",
    arabicTitle: "معنى الإسلام",
    content: [
      "Islam, in its essence, means complete submission and surrender to the will of Almighty God (Allah). It is not merely a religion in the conventional sense but a complete way of life — a 'Deen' — that encompasses every aspect of human existence.",
      "The word 'Islam' is derived from the Arabic root 'S-L-M' which carries meanings of peace, purity, submission, and obedience. A Muslim is one who submits their will to God and finds peace through this submission.",
      "This divine guidance was not introduced as something new by Prophet Muhammad (peace be upon him), but rather it is the same eternal message that was delivered by all the prophets of God — from Adam to Noah, from Abraham to Moses, from Jesus to Muhammad (peace be upon them all).",
      "God says in the Holy Quran: 'Indeed, the religion in the sight of Allah is Islam.' (Quran 3:19). This verse establishes that Islam is the only accepted way of life in the sight of the Creator.",
    ],
  },
  {
    id: 2,
    title: "The Oneness of God",
    arabicTitle: "توحيد الله",
    content: [
      "The fundamental principle of Islam is Tawheed — the absolute oneness of God. There is no deity worthy of worship except Allah, the One, the Eternal, the Self-Sufficient.",
      "'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.' (Quran 112:1-4)",
      "This concept of monotheism is the cornerstone upon which the entire structure of Islam is built. It liberates the human mind from superstition, polytheism, and the worship of created things.",
      "Tawheed is not merely a theological concept but a transformative force that shapes a Muslim's entire worldview, moral conduct, and relationship with the Creator and creation.",
    ],
  },
  {
    id: 3,
    title: "The Five Pillars",
    arabicTitle: "أركان الإسلام الخمسة",
    content: [
      "Islam is built upon five fundamental pillars that serve as the foundation of a Muslim's faith and practice:",
      "1. Shahada (Declaration of Faith): 'There is no god but Allah, and Muhammad is His Messenger.' This declaration is the doorway to Islam and the essence of the Muslim creed.",
      "2. Salah (Prayer): Muslims perform five daily prayers as a direct connection with their Creator. These prayers punctuate the day and serve as constant reminders of God's presence.",
      "3. Zakat (Charity): An obligatory act of giving a portion of one's wealth to those in need, purifying both the giver and the wealth itself.",
      "4. Sawm (Fasting): During the month of Ramadan, Muslims fast from dawn to sunset, cultivating self-discipline, empathy, and gratitude.",
      "5. Hajj (Pilgrimage): Once in a lifetime, if physically and financially able, a Muslim must journey to the sacred city of Makkah for Hajj.",
    ],
  },
  {
    id: 4,
    title: "The Holy Quran",
    arabicTitle: "القرآن الكريم",
    content: [
      "The Quran is the final revelation from God to humanity, delivered through the Angel Jibreel (Gabriel) to Prophet Muhammad (peace be upon him) over a period of 23 years.",
      "It is a book of guidance, wisdom, and mercy. 'This is the Book about which there is no doubt, a guidance for those conscious of Allah.' (Quran 2:2)",
      "The Quran has been preserved in its original Arabic text, unchanged since its revelation over 1400 years ago. This miraculous preservation is a testament to God's promise: 'Indeed, it is We who sent down the message, and indeed, We will be its guardian.' (Quran 15:9)",
      "It addresses all aspects of human life — from personal conduct to social justice, from economics to governance, from spirituality to science — providing a comprehensive framework for human civilization.",
    ],
  },
  {
    id: 5,
    title: "Prophethood",
    arabicTitle: "النبوة",
    content: [
      "God sent prophets and messengers throughout human history to guide humanity to the straight path. Islam acknowledges and honors all prophets, from Adam to Muhammad (peace be upon them all).",
      "Every prophet came with the same essential message: worship God alone and follow His guidance. 'And We certainly sent into every nation a messenger, saying: Worship Allah and avoid false gods.' (Quran 16:36)",
      "Prophet Muhammad (peace be upon him) is the final messenger, sent as a mercy to all of creation. His life serves as the perfect example of how to live according to God's will.",
      "The study of the Prophet's sayings (Hadith) and his way of life (Sunnah) provides Muslims with practical guidance for every situation in life.",
    ],
  },
  {
    id: 6,
    title: "The Day of Judgment",
    arabicTitle: "يوم القيامة",
    content: [
      "Belief in the Day of Judgment is a fundamental article of Islamic faith. On this day, every soul will be held accountable for its deeds in this worldly life.",
      "'Every soul will taste death. And We test you with evil and with good as trial; and to Us you will be returned.' (Quran 21:35)",
      "This belief instills in Muslims a profound sense of responsibility and moral accountability. Knowing that every action, word, and intention will be weighed on the scales of divine justice motivates righteous conduct.",
      "Paradise (Jannah) awaits those who lived righteously, while Hellfire (Jahannam) is the consequence for those who rejected God's guidance and persisted in wrongdoing.",
    ],
  },
  {
    id: 7,
    title: "Islam as a Complete Way of Life",
    arabicTitle: "الإسلام منهج حياة",
    content: [
      "Islam is not confined to rituals and worship alone. It is a comprehensive system that guides every aspect of human existence — personal, social, economic, and political.",
      "From the way a Muslim greets others ('As-Salamu Alaikum' — Peace be upon you) to the ethics of business transactions, from family relations to international diplomacy, Islam provides clear and just guidelines.",
      "'This day I have perfected for you your religion and completed My favor upon you and have approved for you Islam as religion.' (Quran 5:3)",
      "Islam promotes justice, compassion, knowledge, cleanliness, and respect for all of God's creation. It is truly the Deen (complete way of life) chosen by God for all of humanity.",
    ],
  },
];

export const dailyVerses = [
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of God, the Most Gracious, the Most Merciful.", reference: "Quran 1:1" },
  { arabic: "إِنَّ الدِّينَ عِندَ اللَّهِ الْإِسْلَامُ", translation: "Indeed, the religion in the sight of Allah is Islam.", reference: "Quran 3:19" },
  { arabic: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ", translation: "I did not create jinn and humans except to worship Me.", reference: "Quran 51:56" },
  { arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "For indeed, with hardship comes ease.", reference: "Quran 94:5" },
  { arabic: "وَلَذِكْرُ اللَّهِ أَكْبَرُ", translation: "And the remembrance of Allah is greater.", reference: "Quran 29:45" },
  { arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge.", reference: "Quran 20:114" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Indeed, Allah is with the patient.", reference: "Quran 2:153" },
];
