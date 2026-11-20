/* ================================================================
   frases.js — "Eu te amo" em cada idioma, e onde ele se fala
   Na ordem de familiaridade para quem é do Brasil: das línguas que
   ela já ouviu às mais distantes.

   `lugares` são as luzes do idioma no globo: [país, nome escrito ao
   lado da luz, latitude, longitude]. O país é o código de paises.js;
   tocar em qualquer parte dele vai para a luz mais perto do toque.
   Um país com várias línguas tem uma luz para cada, na região onde
   ela se fala.

   `pronuncia` é como quem fala português leria em voz alta, com o
   acento na sílaba forte; vazia só no português.
   ================================================================ */

export const frases = [
  /* --- Nível 1: Muito Familiares --- */
  { idioma: "Português", frase: "Eu te amo", pronuncia: "", lugares: [
      ["BRA", "Brasil", -12.1, -49.56],
      ["AGO", "Angola", -12.18, 17.98],
      ["CPV", "Cabo Verde", 15.07, -23.64],
      ["GNB", "Guiné-Bissau", 12.16, -14.52],
      ["MOZ", "Moçambique", -13.94, 37.84],
      ["PRT", "Portugal", 39.61, -8.27],
      ["STP", "São Tomé e Príncipe", 0.97, 7.02]
  ] },
  { idioma: "Inglês", frase: "I love you", pronuncia: "Ai lóv iú", lugares: [
      ["GBR", "Reino Unido", 54.4, -2.12],
      ["NGA", "Abuja, Nigéria", 9.1, 7.4],
      ["AIA", "Anguilla", 18.24, -63.03],
      ["ATG", "Antígua e Barbuda", 17.35, -61.79],
      ["AUS", "Austrália", -24.13, 134.05],
      ["BHS", "Bahamas", 26.4, -77.15],
      ["BRB", "Barbados", 13.16, -59.57],
      ["BLZ", "Belize", 17.2, -88.71],
      ["BMU", "Bermudas", 32.3, -64.76],
      ["BTN", "Butão", 27.54, 90.04],
      ["CAN", "Canadá", 60.32, -101.91],
      ["DMA", "Dominica", 15.46, -61.34],
      ["IRL", "Dublin, Irlanda", 53.35, -6.3],
      ["USA", "Estados Unidos", 39.54, -97.48],
      ["GHA", "Gana", 7.72, -1.04],
      ["GRD", "Granada", 12.11, -61.68],
      ["GUM", "Guam", 13.35, 144.7],
      ["GGY", "Guernsey", 49.46, -2.56],
      ["GUY", "Guiana", 5.12, -58.94],
      ["GMB", "Gâmbia", 13.64, -15.0],
      ["NFK", "Ilha Norfolk", -29.03, 167.95],
      ["IMN", "Ilha de Man", 54.22, -4.53],
      ["CYM", "Ilhas Cayman", 19.32, -81.24],
      ["COK", "Ilhas Cook", -21.22, -159.79],
      ["FLK", "Ilhas Malvinas", -51.61, -58.74],
      ["MNP", "Ilhas Marianas do Norte", 15.19, 145.73],
      ["MHL", "Ilhas Marshall", 7.08, 171.19],
      ["PCN", "Ilhas Pitcairn", -24.36, -128.32],
      ["SLB", "Ilhas Salomão", -8.03, 159.17],
      ["VIR", "Ilhas Virgens Americanas", 17.75, -64.78],
      ["VGB", "Ilhas Virgens Britânicas", 18.43, -64.64],
      ["JAM", "Jamaica", 18.14, -77.32],
      ["JEY", "Jersey", 49.22, -2.09],
      ["ZAF", "Joanesburgo, África do Sul", -26.2, 28.05],
      ["KIR", "Kiribati", 1.82, -157.38],
      ["LBR", "Libéria", 6.45, -9.46],
      ["MDV", "Maldivas", 4.17, 73.51],
      ["MUS", "Maurício", -20.3, 57.57],
      ["FSM", "Micronésia", 6.89, 158.23],
      ["MSR", "Montserrat", 16.74, -62.19],
      ["NAM", "Namíbia", -20.58, 17.11],
      ["NRU", "Nauru", -0.52, 166.93],
      ["NIU", "Niue", -19.05, -169.86],
      ["NZL", "Nova Zelândia", -39.76, 172.79],
      ["PLW", "Palau", 7.52, 134.58],
      ["SHN", "Santa Helena", -15.95, -5.71],
      ["LCA", "Santa Lúcia", 13.89, -60.98],
      ["SLE", "Serra Leoa", 8.62, -11.76],
      ["SYC", "Seychelles", -4.68, 55.48],
      ["SGP", "Singapura", 1.37, 103.82],
      ["SDS", "Sudão do Sul", 7.23, 30.39],
      ["KNA", "São Cristóvão e Nevis", 17.34, -62.76],
      ["SXM", "São Martinho", 18.04, -63.07],
      ["VCT", "São Vicente e Granadinas", 13.09, -61.34],
      ["IOT", "Território Britânico do Oceano Índico", -6.19, 71.35],
      ["IOA", "Territórios australianos do Oceano Índico", -10.49, 105.67],
      ["TON", "Tonga", -21.21, -175.16],
      ["TTO", "Trinidad e Tobago", 11.0, -60.92],
      ["TCA", "Turks e Caicos", 21.82, -71.75],
      ["TUV", "Tuvalu", -8.51, 179.21],
      ["ZMB", "Zâmbia", -14.66, 26.4]
  ] },
  { idioma: "Espanhol", frase: "Te amo", pronuncia: "Tê ámo", lugares: [
      ["ESP", "Espanha", 40.09, -3.46],
      ["ARG", "Argentina", -33.5, -64.17],
      ["BOL", "Bolívia", -16.67, -64.59],
      ["CHL", "Chile", -38.15, -72.32],
      ["COL", "Colômbia", 3.37, -73.17],
      ["CRI", "Costa Rica", 10.07, -84.08],
      ["CUB", "Cuba", 21.33, -77.98],
      ["SLV", "El Salvador", 13.69, -88.89],
      ["ECU", "Equador", -1.26, -78.19],
      ["GTM", "Guatemala", 14.98, -90.5],
      ["GNQ", "Guiné Equatorial", 2.33, 8.99],
      ["HND", "Honduras", 14.79, -86.89],
      ["MEX", "México", 23.92, -102.29],
      ["NIC", "Nicarágua", 12.67, -85.07],
      ["PAN", "Panamá", 8.72, -80.35],
      ["PRY", "Paraguai", -21.67, -60.15],
      ["PER", "Peru", -12.98, -72.9],
      ["PRI", "Porto Rico", 18.23, -66.48],
      ["DOM", "República Dominicana", 19.1, -70.65],
      ["URY", "Uruguai", -32.96, -55.97],
      ["VEN", "Venezuela", 7.18, -64.6]
  ] },
  { idioma: "Italiano", frase: "Ti amo", pronuncia: "Ti ámo", lugares: [
      ["ITA", "Itália", 44.73, 11.08],
      ["SMR", "San Marino", 43.93, 12.44],
      ["CHE", "Ticino, Suíça", 46.0, 8.95],
      ["VAT", "Vaticano", 41.9, 12.45]
  ] },
  { idioma: "Francês", frase: "Je t'aime", pronuncia: "Jê tém", lugares: [
      ["FRA", "França", 46.7, 2.55],
      ["BEN", "Benin", 10.32, 2.35],
      ["BFA", "Burkina Faso", 12.67, -1.36],
      ["CMR", "Camarões", 4.59, 12.47],
      ["TCD", "Chade", 15.14, 18.65],
      ["COM", "Comores", -11.73, 43.32],
      ["CIV", "Costa do Marfim", 7.49, -5.57],
      ["DJI", "Djibuti", 11.98, 42.5],
      ["GAB", "Gabão", -0.44, 11.84],
      ["CHE", "Genebra, Suíça", 46.5, 6.6],
      ["GIN", "Guiné", 10.62, -10.02],
      ["MLI", "Mali", 18.69, -2.04],
      ["MCO", "Mônaco", 43.74, 7.4],
      ["NCL", "Nova Caledônia", -21.06, 165.08],
      ["NER", "Níger", 17.45, 9.5],
      ["CAN", "Quebec, Canadá", 46.8, -71.2],
      ["CAF", "República Centro-Africana", 6.99, 20.91],
      ["COD", "República Democrática do Congo", -1.86, 23.46],
      ["COG", "República do Congo", 0.14, 15.9],
      ["SPM", "Saint-Pierre e Miquelon", 47.04, -56.33],
      ["BLM", "São Bartolomeu", 17.9, -62.83],
      ["MAF", "São Martinho", 18.08, -63.05],
      ["TGO", "Togo", 8.81, 1.06],
      ["BEL", "Valônia, Bélgica", 50.4, 4.6],
      ["WLF", "Wallis e Futuna", -14.29, -178.14]
  ] },

  /* --- Nível 2: Influência Cultural e Imigração no Brasil --- */
  { idioma: "Japonês", frase: "愛してる", pronuncia: "Aishiteru", lugares: [
      ["JPN", "Japão", 36.14, 138.44]
  ] },
  { idioma: "Alemão", frase: "Ich liebe dich", pronuncia: "Ich líbe dich", lugares: [
      ["DEU", "Alemanha", 50.96, 9.68],
      ["LIE", "Liechtenstein", 47.11, 9.56],
      ["CHE", "Suíça", 47.2, 8.3],
      ["AUT", "Áustria", 47.52, 14.13]
  ] },
  { idioma: "Árabe", frase: "أحبك", pronuncia: "Uhibbuki", lugares: [
      ["LBN", "Líbano", 34.13, 35.99],
      ["DZA", "Argélia", 27.4, 2.81],
      ["SAU", "Arábia Saudita", 23.81, 44.7],
      ["BHR", "Barein", 26.06, 50.55],
      ["QAT", "Catar", 25.24, 51.14],
      ["EGY", "Egito", 26.19, 29.45],
      ["ARE", "Emirados Árabes Unidos", 23.47, 54.55],
      ["ERI", "Eritreia", 15.79, 38.29],
      ["IRQ", "Iraque", 33.09, 43.26],
      ["YEM", "Iêmen", 15.33, 45.87],
      ["JOR", "Jordânia", 30.81, 36.38],
      ["KWT", "Kuwait", 29.41, 47.31],
      ["LBY", "Líbia", 26.64, 18.01],
      ["MAR", "Marrocos", 31.65, -7.19],
      ["MRT", "Mauritânia", 19.59, -9.74],
      ["OMN", "Omã", 22.12, 57.34],
      ["PSX", "Palestina", 32.05, 35.29],
      ["SAH", "Sara Ocidental", 23.97, -12.63],
      ["SDN", "Sudão", 16.33, 29.26],
      ["SYR", "Síria", 35.01, 38.28],
      ["TUN", "Tunísia", 33.69, 9.01]
  ] },
  { idioma: "Coreano", frase: "사랑해", pronuncia: "Saranghae", lugares: [
      ["KOR", "Coreia do Sul", 36.38, 128.13],
      ["PRK", "Coreia do Norte", 39.89, 126.44]
  ] },
  { idioma: "Mandarim", frase: "我爱你", pronuncia: "Wo ai ni", lugares: [
      ["CHN", "China", 39.9, 116.4],
      ["TWN", "Taiwan", 23.65, 120.87]
  ] },

  /* --- Nível 3: Pop Culture, História e Religião --- */
  { idioma: "Russo", frase: "Я тебя люблю", pronuncia: "Ya tebya lyublyu", lugares: [
      ["RUS", "Rússia", 58.25, 44.69]
  ] },
  { idioma: "Grego", frase: "Σ'αγαπώ", pronuncia: "Sagapo", lugares: [
      ["GRC", "Grécia", 39.49, 21.73],
      ["CYP", "Chipre", 34.91, 33.08]
  ] },
  { idioma: "Hebraico", frase: "אני אוהב אותך", pronuncia: "Ani ohev otach", lugares: [
      ["ISR", "Israel", 30.91, 34.85]
  ] },
  { idioma: "Havaiano", frase: "Aloha wau iā ʻoe", pronuncia: "Aloha wau ia oe", lugares: [
      ["USA", "Havaí", 19.6, -155.5]
  ] },

  /* --- Nível 4: Europa e Destinos Turísticos --- */
  { idioma: "Holandês", frase: "Ik hou van je", pronuncia: "Ik ráu fan iê", lugares: [
      ["NLD", "Holanda", 52.42, 5.61],
      ["BEL", "Flandres, Bélgica", 51.0, 4.4],
      ["SUR", "Suriname", 4.14, -55.91]
  ] },
  { idioma: "Sueco", frase: "Jag älskar dig", pronuncia: "Jag elskar dig", lugares: [
      ["SWE", "Suécia", 65.86, 19.02],
      ["ALD", "Åland", 60.16, 19.87]
  ] },
  { idioma: "Turco", frase: "Seni seviyorum", pronuncia: "Séni seviórum", lugares: [
      ["TUR", "Turquia", 39.35, 34.51],
      ["CYN", "Chipre do Norte", 35.22, 33.69]
  ] },
  { idioma: "Polonês", frase: "Kocham cię", pronuncia: "Kórram tchiê", lugares: [
      ["POL", "Polônia", 51.99, 19.49]
  ] },
  { idioma: "Romeno", frase: "Te iubesc", pronuncia: "Tê iubésk", lugares: [
      ["ROU", "Romênia", 45.73, 24.97],
      ["MDA", "Moldávia", 47.43, 28.49]
  ] },
  { idioma: "Dinamarquês", frase: "Jeg elsker dig", pronuncia: "Iai élsker dai", lugares: [
      ["DNK", "Dinamarca", 55.97, 9.02]
  ] },
  { idioma: "Norueguês", frase: "Jeg elsker deg", pronuncia: "Iai élsker dai", lugares: [
      ["NOR", "Noruega", 61.36, 9.68]
  ] },
  { idioma: "Finlandês", frase: "Minä rakastan sinua", pronuncia: "Mínê rákastan sínua", lugares: [
      ["FIN", "Finlândia", 63.25, 27.28]
  ] },
  { idioma: "Tcheco", frase: "Miluji tě", pronuncia: "Mílui tiê", lugares: [
      ["CZE", "Tchéquia", 49.88, 15.38]
  ] },
  { idioma: "Húngaro", frase: "Szeretlek", pronuncia: "Séretlék", lugares: [
      ["HUN", "Hungria", 47.09, 19.45]
  ] },
  { idioma: "Ucraniano", frase: "Я тебе кохаю", pronuncia: "Ya tebe kokhayu", lugares: [
      ["UKR", "Ucrânia", 49.72, 32.14]
  ] },
  { idioma: "Islandês", frase: "Ég elska þig", pronuncia: "Eg elska thig", lugares: [
      ["ISL", "Islândia", 64.78, -18.67]
  ] },

  /* --- Nível 5: Ásia e Outros --- */
  { idioma: "Tailandês", frase: "ฉันรักเธอ", pronuncia: "Chan rak ter", lugares: [
      ["THA", "Tailândia", 15.46, 101.07]
  ] },
  { idioma: "Indonésio", frase: "Aku cinta kamu", pronuncia: "Áku tchínta kámu", lugares: [
      ["IDN", "Jacarta, Indonésia", -6.2, 106.8]
  ] },
  { idioma: "Vietnamita", frase: "Anh yêu em", pronuncia: "Ãin iêu ém", lugares: [
      ["VNM", "Vietnã", 21.72, 105.39]
  ] },
  { idioma: "Filipino", frase: "Mahal kita", pronuncia: "Marrál kitá", lugares: [
      ["PHL", "Filipinas", 11.2, 122.47]
  ] },
  { idioma: "Hindi", frase: "मैं तुमसे प्यार करता हूँ", pronuncia: "Main tumse pyar karta hoon", lugares: [
      ["IND", "Nova Délhi, Índia", 28.6, 77.2]
  ] },
  { idioma: "Bengali", frase: "আমি তোমাকে ভালোবাসি", pronuncia: "Ami tomake bhalobashi", lugares: [
      ["BGD", "Bangladesh", 24.21, 89.68],
      ["IND", "Calcutá, Índia", 22.6, 88.4]
  ] },
  { idioma: "Malaio", frase: "Saya sayang awak", pronuncia: "Sáia saiáng áuak", lugares: [
      ["MYS", "Malásia", 2.53, 113.84],
      ["BRN", "Brunei", 4.45, 114.55]
  ] },
  { idioma: "Cazaque", frase: "Мен сені жақсы көремін", pronuncia: "Men seni jaqsı köremin", lugares: [
      ["KAZ", "Cazaquistão", 49.05, 68.69]
  ] },
  { idioma: "Nepalês", frase: "म तिमीलाई माया गर्छु", pronuncia: "Ma timilai maya garchu", lugares: [
      ["NPL", "Nepal", 28.3, 83.64]
  ] },
  { idioma: "Cingalês", frase: "මම ඔයාට ආදරෙයි", pronuncia: "Mama oyata adareyi", lugares: [
      ["LKA", "Sri Lanka", 7.58, 80.7]
  ] },

  /* --- Nível 6: África e Idiomas Regionais --- */
  { idioma: "Suaíli", frase: "Nakupenda", pronuncia: "Nakupênda", lugares: [
      ["TZA", "Tanzânia", -6.05, 34.96],
      ["COD", "Goma, Congo", -1.7, 29.2],
      ["KEN", "Quênia", 0.55, 37.91]
  ] },
  { idioma: "Africâner", frase: "Ek het jou lief", pronuncia: "Ék rét iau lif", lugares: [
      ["ZAF", "Cabo Ocidental, África do Sul", -33.0, 19.5],
      ["NAM", "Windhoek, Namíbia", -22.6, 17.1]
  ] },
  { idioma: "Zulu", frase: "Ngiyakuthanda", pronuncia: "Nguiiakutánda", lugares: [
      ["ZAF", "KwaZulu-Natal, África do Sul", -28.5, 31.0]
  ] },
  { idioma: "Iorubá", frase: "Mo nifẹ rẹ", pronuncia: "Mô nifé ré", lugares: [
      ["NGA", "Ibadan, Nigéria", 7.4, 3.9]
  ] },
  { idioma: "Somali", frase: "Waan ku jeclahay", pronuncia: "Uán ku djéclarrai", lugares: [
      ["SOM", "Somália", 3.57, 45.19],
      ["SOL", "Somalilândia", 9.44, 46.73]
  ] },
  { idioma: "Amárico", frase: "አፈቅርሃለሁ", pronuncia: "Afeqerkalehu", lugares: [
      ["ETH", "Etiópia", 8.03, 39.09]
  ] },
  { idioma: "Igbo", frase: "Ahụrụ m gị n'anya", pronuncia: "Arurú m gui nánia", lugares: [
      ["NGA", "Enugu, Nigéria", 6.4, 7.5]
  ] },

  /* --- Nível 7: Mais Idiomas e Dialetos --- */
  { idioma: "Basco", frase: "Maite zaitut", pronuncia: "Máite saitút", lugares: [
      ["ESP", "País Basco", 43.1, -2.5]
  ] },
  { idioma: "Catalão", frase: "T'estimo", pronuncia: "Testímu", lugares: [
      ["ESP", "Catalunha", 41.6, 1.8],
      ["AND", "Andorra", 42.55, 1.54]
  ] },
  { idioma: "Galego", frase: "Ámote", pronuncia: "Ámotê", lugares: [
      ["ESP", "Galícia", 42.75, -8.0]
  ] },
  { idioma: "Galês", frase: "Rwy'n dy garu di", pronuncia: "Ruin dâ gári di", lugares: [
      ["GBR", "País de Gales", 52.3, -3.7]
  ] },
  { idioma: "Irlandês", frase: "Grá agam ort", pronuncia: "Gráa águm órt", lugares: [
      ["IRL", "Irlanda", 53.08, -7.8]
  ] },
  { idioma: "Maori", frase: "Kei te aroha au ki a koe", pronuncia: "Kêi tê aróra áu ki á kôe", lugares: [
      ["NZL", "Rotorua, Nova Zelândia", -38.1, 176.2]
  ] },
  { idioma: "Samoano", frase: "Ou te alofa ia te oe", pronuncia: "Ôu tê alôfa ía tê ôe", lugares: [
      ["WSM", "Samoa", -13.64, -172.44],
      ["ASM", "Samoa Americana", -14.33, -170.75]
  ] },
  { idioma: "Taitiano", frase: "Ua here vau ia oe", pronuncia: "Ua rérê váu ía ôe", lugares: [
      ["PYF", "Polinésia Francesa", -17.63, -149.46]
  ] },
  { idioma: "Armênio", frase: "Ես քեզ սիրում եմ", pronuncia: "Yes qez sirum em", lugares: [
      ["ARM", "Armênia", 40.46, 44.8]
  ] },
  { idioma: "Azeri", frase: "Mən səni sevirəm", pronuncia: "Men seni sevirem", lugares: [
      ["AZE", "Azerbaijão", 40.4, 47.21]
  ] },
  { idioma: "Bósnio", frase: "Volim te", pronuncia: "Vólim tê", lugares: [
      ["BIH", "Bósnia", 44.09, 18.07]
  ] },
  { idioma: "Búlgaro", frase: "Обичам те", pronuncia: "Obicham te", lugares: [
      ["BGR", "Bulgária", 42.51, 25.16]
  ] },
  { idioma: "Croata", frase: "Volim te", pronuncia: "Vólim tê", lugares: [
      ["HRV", "Croácia", 45.81, 16.37]
  ] },
  { idioma: "Eslovaco", frase: "Ľúbim ťa", pronuncia: "Lhúbim tiá", lugares: [
      ["SVK", "Eslováquia", 48.73, 19.05]
  ] },
  { idioma: "Esloveno", frase: "Ljubim te", pronuncia: "Liúbim tê", lugares: [
      ["SVN", "Eslovênia", 46.06, 14.92]
  ] },
  { idioma: "Estoniano", frase: "Ma armastan sind", pronuncia: "Ma ármastan sínd", lugares: [
      ["EST", "Estônia", 58.72, 25.87]
  ] },
  { idioma: "Georgiano", frase: "მიყვარხαρ", pronuncia: "Miqvarxar", lugares: [
      ["GEO", "Geórgia", 41.87, 43.74]
  ] },
  { idioma: "Letão", frase: "Es tevi mīlu", pronuncia: "Ês tévi mílu", lugares: [
      ["LVA", "Letônia", 57.07, 25.46]
  ] },
  { idioma: "Lituano", frase: "Aš tave myliu", pronuncia: "Ách táve míliu", lugares: [
      ["LTU", "Lituânia", 55.1, 24.09]
  ] },
  { idioma: "Macedônio", frase: "Те сакам", pronuncia: "Te sakam", lugares: [
      ["MKD", "Macedônia do Norte", 41.56, 21.56]
  ] },
  { idioma: "Maltês", frase: "Inħobbok", pronuncia: "Inhobbok", lugares: [
      ["MLT", "Malta", 35.89, 14.43]
  ] },
  { idioma: "Albanês", frase: "Te dua", pronuncia: "Tê dúa", lugares: [
      ["ALB", "Albânia", 40.65, 20.11],
      ["KOS", "Kosovo", 42.59, 20.86]
  ] },
  { idioma: "Luxemburguês", frase: "Ech hunn dech gär", pronuncia: "Éch run déch guér", lugares: [
      ["LUX", "Luxemburgo", 49.73, 6.08]
  ] },
  { idioma: "Frísio", frase: "Ik hâld fan dy", pronuncia: "Ik ról fan dí", lugares: [
      ["NLD", "Frísia, Holanda", 53.1, 5.8]
  ] },
  { idioma: "Ídiche", frase: "איך האָב דיך ליב", pronuncia: "Ikh hob dikh lib", lugares: [
      ["ISR", "Tel Aviv, Israel", 32.1, 34.85]
  ] },
  { idioma: "Curdo", frase: "Ez hej te dikim", pronuncia: "Éz réj tê dikím", lugares: [
      ["IRQ", "Curdistão", 36.2, 44.0]
  ] },
  { idioma: "Pashto", frase: "Za la ta sara meena kawom", pronuncia: "Zâ la tâ sará mína kauóm", lugares: [
      ["AFG", "Afeganistão", 34.16, 66.5],
      ["PAK", "Peshawar, Paquistão", 34.0, 71.5]
  ] },
  { idioma: "Farsi", frase: "دوستت دارم", pronuncia: "Dooset daram", lugares: [
      ["IRN", "Irã", 32.17, 54.93],
      ["AFG", "Cabul, Afeganistão", 34.5, 69.2]
  ] },
  { idioma: "Sindi", frase: "مان توسان پيار ڪيان ٿو", pronuncia: "Maan tosaan pyaar kiyaan tho", lugares: [
      ["PAK", "Sindh, Paquistão", 25.4, 68.4]
  ] },
  { idioma: "Marathi", frase: "मी तुझ्यावर प्रेम करतो", pronuncia: "Mi tujhyavar prem karto", lugares: [
      ["IND", "Mumbai, Índia", 19.1, 72.9]
  ] },
  { idioma: "Punjabi", frase: "ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ", pronuncia: "Main tainu pyar karda han", lugares: [
      ["IND", "Punjab, Índia", 31.0, 75.4],
      ["PAK", "Lahore, Paquistão", 31.5, 74.35]
  ] },
  { idioma: "Gujarati", frase: "હું તને પ્રેમ કરું છું", pronuncia: "Hu tane prem karu chu", lugares: [
      ["IND", "Gujarat, Índia", 23.0, 72.6]
  ] },
  { idioma: "Canará", frase: "ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ", pronuncia: "Naanu ninnannu preethisuttene", lugares: [
      ["IND", "Bangalore, Índia", 13.0, 77.6]
  ] },
  { idioma: "Malayalam", frase: "ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു", pronuncia: "Njan ninne snehikkunnu", lugares: [
      ["IND", "Kerala, Índia", 9.9, 76.6]
  ] },
  { idioma: "Tâmil", frase: "நான் உன்னை நேசிக்கிறேன்", pronuncia: "Naan unnai nesikkiren", lugares: [
      ["IND", "Tamil Nadu, Índia", 12.0, 79.4],
      ["LKA", "Jaffna, Sri Lanka", 9.7, 80.1]
  ] },
  { idioma: "Telugu", frase: "నేను నిన్ను ప్రేమిస్తున్నాను", pronuncia: "Nenu ninnu premistunnanu", lugares: [
      ["IND", "Hyderabad, Índia", 17.4, 78.5]
  ] },
  { idioma: "Khmer", frase: "ខ្ញុំស្រឡាញ់អ្នក", pronuncia: "Khnhom srolanh neak", lugares: [
      ["KHM", "Camboja", 12.65, 104.5]
  ] },
  { idioma: "Laosiano", frase: "ຂ້ອຍຮັກເຈົ້າ", pronuncia: "Khoi hak jao", lugares: [
      ["LAO", "Laos", 19.43, 102.53]
  ] },
  { idioma: "Birmanês", frase: "ချစ်ပါတယ်", pronuncia: "Chit pa de", lugares: [
      ["MMR", "Mianmar", 21.57, 95.8]
  ] },
  { idioma: "Tibetano", frase: "Nga khye-rang-la ga-gi-du", pronuncia: "Ngá kiérãng lá gá gui du", lugares: [
      ["CHN", "Tibete", 29.65, 91.1]
  ] },
  { idioma: "Mongol", frase: "Би чамд хайртай", pronuncia: "Bi chamd khairtai", lugares: [
      ["MNG", "Mongólia", 46.0, 104.15]
  ] },
  { idioma: "Quirguiz", frase: "Мен сени сүйөм", pronuncia: "Men seni suyom", lugares: [
      ["KGZ", "Quirguistão", 41.67, 74.53]
  ] },
  { idioma: "Tadjique", frase: "Ман туро дӯст медорам", pronuncia: "Man turo dust medoram", lugares: [
      ["TJK", "Tadjiquistão", 38.2, 72.59]
  ] },
  { idioma: "Uzbeque", frase: "Men seni sevaman", pronuncia: "Mén séni seváman", lugares: [
      ["UZB", "Uzbequistão", 41.69, 64.01]
  ] },
  { idioma: "Javanês", frase: "Aku tresno sampeyan", pronuncia: "Áku trésno sampéian", lugares: [
      ["IDN", "Java, Indonésia", -7.6, 110.6]
  ] },
  { idioma: "Sundanês", frase: "Abdi bogoh ka anjeun", pronuncia: "Ábdi bógorr ka andjéun", lugares: [
      ["IDN", "Bandung, Indonésia", -7.0, 107.6]
  ] },
  { idioma: "Crioulo Haitiano", frase: "Mwen renmen ou", pronuncia: "Muén rénmen u", lugares: [
      ["HTI", "Haiti", 19.26, -72.22]
  ] },
  { idioma: "Navajo", frase: "Ayóó'áníínísh'ní", pronuncia: "Ayoo aniiniishni", lugares: [
      ["USA", "Nação Navajo, EUA", 36.1, -109.6]
  ] },
  { idioma: "Guarani", frase: "Rohayhu", pronuncia: "Rorrairrú", lugares: [
      ["PRY", "Assunção, Paraguai", -25.3, -57.6]
  ] },
  { idioma: "Quechua", frase: "Munayki", pronuncia: "Munáiki", lugares: [
      ["PER", "Cusco, Peru", -13.5, -72.0],
      ["BOL", "Cochabamba, Bolívia", -17.4, -66.2]
  ] },
  { idioma: "Maia", frase: "In yaakumech", pronuncia: "In iaakumétch", lugares: [
      ["MEX", "Iucatã, México", 20.6, -89.0]
  ] },
  { idioma: "Náuatle", frase: "Ni mits tlamatli", pronuncia: "Ni mits tlamátli", lugares: [
      ["MEX", "Cidade do México", 19.4, -99.1]
  ] },
  { idioma: "Totonaca", frase: "Tas lox", pronuncia: "Tás lóch", lugares: [
      ["MEX", "Veracruz, México", 20.5, -97.4]
  ] },
  { idioma: "Malgaxe", frase: "Tia anao aho", pronuncia: "Tí anáu áu", lugares: [
      ["MDG", "Madagascar", -18.63, 46.7]
  ] },
  { idioma: "Chichewa", frase: "Ndimakukonda", pronuncia: "Ndimakukônda", lugares: [
      ["MWI", "Malawi", -13.39, 33.61]
  ] },
  { idioma: "Sotho", frase: "Kea u rata", pronuncia: "Kéa u ráta", lugares: [
      ["LSO", "Lesoto", -29.48, 28.25]
  ] },
  { idioma: "Shona", frase: "Ndinokuda", pronuncia: "Ndinokúda", lugares: [
      ["ZWE", "Zimbábue", -18.91, 29.93]
  ] },

  /* --- Nível 8: As Línguas de Outros Países --- */
  { idioma: "Cantonês", frase: "我愛你", pronuncia: "Ngo oi nei", lugares: [
      ["HKG", "Hong Kong", 22.45, 114.1],
      ["MAC", "Macau", 22.13, 113.56]
  ] },
  { idioma: "Urdu", frase: "میں تم سے محبت کرتا ہوں", pronuncia: "Main tum se mohabbat karta hoon", lugares: [
      ["PAK", "Paquistão", 29.33, 68.55]
  ] },
  { idioma: "Sérvio", frase: "Волим те", pronuncia: "Volim te", lugares: [
      ["SRB", "Sérvia", 44.19, 20.79],
      ["MNE", "Montenegro", 42.8, 19.14]
  ] },
  { idioma: "Bielorrusso", frase: "Я цябе кахаю", pronuncia: "Ya tsyabe kakhayu", lugares: [
      ["BLR", "Bielorrússia", 53.82, 28.42]
  ] },
  { idioma: "Turcomeno", frase: "Men seni söýýärin", pronuncia: "Mén séni sóiiérin", lugares: [
      ["TKM", "Turcomenistão", 39.86, 58.68]
  ] },
  { idioma: "Feroês", frase: "Eg elski teg", pronuncia: "Ê élchi tê", lugares: [
      ["FRO", "Ilhas Faroé", 62.19, -7.06]
  ] },
  { idioma: "Groenlandês", frase: "Asavakkit", pronuncia: "Assavákkit", lugares: [
      ["GRL", "Groenlândia", 74.32, -39.34]
  ] },
  { idioma: "Papiamento", frase: "Mi ta stimabo", pronuncia: "Mi ta stimábo", lugares: [
      ["CUW", "Curaçao", 12.15, -68.92],
      ["ABW", "Aruba", 12.52, -69.97]
  ] },
  { idioma: "Hauçá", frase: "Ina son ki", pronuncia: "Ína són ki", lugares: [
      ["NGA", "Kano, Nigéria", 12.0, 8.5],
      ["NER", "Maradi, Níger", 13.5, 7.1]
  ] },
  { idioma: "Wolof", frase: "Dama la nob", pronuncia: "Dáma la nób", lugares: [
      ["SEN", "Senegal", 15.14, -14.78]
  ] },
  { idioma: "Lingala", frase: "Nalingi yo", pronuncia: "Nalíngui iô", lugares: [
      ["COD", "Kinshasa, Congo", -4.4, 15.4],
      ["COG", "Brazzaville, Congo", -4.2, 15.2]
  ] },
  { idioma: "Luganda", frase: "Nkwagala", pronuncia: "Nkuagála", lugares: [
      ["UGA", "Uganda", 1.97, 32.95]
  ] },
  { idioma: "Kinyarwanda", frase: "Ndagukunda", pronuncia: "Ndagukúnda", lugares: [
      ["RWA", "Ruanda", -1.9, 30.1]
  ] },
  { idioma: "Kirundi", frase: "Ndagukunda", pronuncia: "Ndagukúnda", lugares: [
      ["BDI", "Burundi", -3.33, 29.92]
  ] },
  { idioma: "Xhosa", frase: "Ndiyakuthanda", pronuncia: "Ndiiakutánda", lugares: [
      ["ZAF", "Cabo Oriental, África do Sul", -32.0, 27.5]
  ] },
  { idioma: "Setswana", frase: "Ke a go rata", pronuncia: "Kê a rrô ráta", lugares: [
      ["BWA", "Botsuana", -22.1, 24.18]
  ] },
  { idioma: "Siswati", frase: "Ngiyakutsandza", pronuncia: "Nguiiakutsándza", lugares: [
      ["SWZ", "Essuatíni", -26.53, 31.47]
  ] },
  { idioma: "Tétum", frase: "Hau hadomi ó", pronuncia: "Ráu radómi ó", lugares: [
      ["TLS", "Timor-Leste", -8.8, 125.85]
  ] },
  { idioma: "Tok Pisin", frase: "Mi laikim yu", pronuncia: "Mi láikim iú", lugares: [
      ["PNG", "Papua-Nova Guiné", -5.7, 143.91]
  ] },
  { idioma: "Bislama", frase: "Mi lavem yu", pronuncia: "Mi lávem iú", lugares: [
      ["VUT", "Vanuatu", -15.37, 166.91]
  ] },
  { idioma: "Fijiano", frase: "Au domoni iko", pronuncia: "Áu ndomóni íko", lugares: [
      ["FJI", "Fiji", -17.83, 177.98]
  ] }
];
