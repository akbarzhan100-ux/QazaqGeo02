const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
app = app.replace(
  "import { MapComponent } from './components/MapComponent';",
  "import { MapComponent } from './components/MapComponent';\nimport { t } from './data/translations';\nexport type Language = 'ru' | 'kz';"
);

// 2. Add state
app = app.replace(
  "const [currentView, setCurrentView] = useState<View>('home');",
  "const [currentLanguage, setCurrentLanguage] = useState<Language>('ru');\n  const [currentView, setCurrentView] = useState<View>('home');"
);

// 3. Header toggle
app = app.replace(
  /<div \n              onClick=\{\(\) => setCurrentView\('profile'\)\}/,
  `<button 
              onClick={() => setCurrentLanguage(currentLanguage === 'ru' ? 'kz' : 'ru')}
              className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors mr-4"
            >
              {currentLanguage === 'ru' ? 'KZ' : 'RU'}
            </button>
            <div 
              onClick={() => setCurrentView('profile')}`
);

// Mobile toggle
app = app.replace(
  /<button \n                  onClick=\{\(\) => \{ setCurrentView\('regions'\); setIsMenuOpen\(false\); \}\}/,
  `<button 
                  onClick={() => { setCurrentLanguage(currentLanguage === 'ru' ? 'kz' : 'ru'); setIsMenuOpen(false); }}
                  className="text-2xl font-bold text-left text-blue-600"
                >
                  {currentLanguage === 'ru' ? 'Қазақша' : 'Русский'}
                </button>
                <button 
                  onClick={() => { setCurrentView('regions'); setIsMenuOpen(false); }}`
);

// 4. Replace strings
const replacements = [
  ['QazaqGeo Learn', 't[currentLanguage].title', true], // only in some places, maybe better to leave title as is or use t[currentLanguage].title
  ['Исследуйте регионы Казахстана, изучайте историю и проверяйте свои знания в интерактивных квизах.', '{t[currentLanguage].subtitle}'],
  ['Начать исследование', '{t[currentLanguage].startExploring}'],
  ['Пройти квиз', '{t[currentLanguage].takeQuiz}'],
  ['Популярные направления', '{t[currentLanguage].popularDestinations}'],
  ['Самые посещаемые и интересные регионы нашей страны.', '{t[currentLanguage].popularDesc}'],
  ['Все регионы <ChevronRight size={18} />', '{t[currentLanguage].allRegions} <ChevronRight size={18} />'],
  ['Демография регионов', '{t[currentLanguage].demographics}'],
  ['Казахстан — страна с динамично растущим населением. На графике представлены 10 наиболее населенных регионов и городов страны. \n              Алматы и Туркестанская область лидируют по количеству жителей.', '{t[currentLanguage].demographicsDesc}'],
  ['чел.', '{t[currentLanguage].people}'],
  ["'Население'", "t[currentLanguage].population"],
  ['Проверьте свои знания', '{t[currentLanguage].testKnowledge}'],
  ['Выберите одну из тем и узнайте, насколько хорошо вы знаете Казахстан и мир.', '{t[currentLanguage].testKnowledgeDesc}'],
  ['вопросов', '{t[currentLanguage].questionsCount}'],
  ['Все квизы <ChevronRight size={18} />', '{t[currentLanguage].allQuizzes} <ChevronRight size={18} />'],
  ['Регионы Казахстана', '{t[currentLanguage].regionsTitle}'],
  ['Познакомьтесь с административно-территориальным устройством страны.', '{t[currentLanguage].regionsDesc}'],
  ['Поиск региона или города...', 't[currentLanguage].searchPlaceholder', true],
  ['Центр', '{t[currentLanguage].center}'],
  ['Площадь', '{t[currentLanguage].area}'],
  ['Подробнее', '{t[currentLanguage].moreDetails}'],
  ['К списку', '{t[currentLanguage].backToList}'],
  ['Выберите регион на карте', '{t[currentLanguage].selectRegionOnMap}'],
  ['Ничего не найдено по вашему запросу.', '{t[currentLanguage].nothingFound}'],
  ['Назад к списку', '{t[currentLanguage].backToRegions}'],
  ['О регионе', '{t[currentLanguage].aboutRegion}'],
  ['География', '{t[currentLanguage].geography}'],
  ['Координаты центра:', '{t[currentLanguage].geographyDesc.replace("{lat}", selectedRegion.coordinates[1].toString()).replace("{lng}", selectedRegion.coordinates[0].toString())}', true],
  ['Интересный факт', '{t[currentLanguage].interestingFact}'],
  ['Каждый регион Казахстана вносит свой неповторимый вклад в культурное и экономическое разнообразие страны, сохраняя при этом общие национальные традиции и ценности.', '{t[currentLanguage].interestingFactDesc}'],
  ['Исследователь', '{t[currentLanguage].explorer}'],
  ['Гостевой режим', '{t[currentLanguage].guestMode}'],
  ['Выйти', '{t[currentLanguage].logout}'],
  ['Войти через Google', '{t[currentLanguage].loginGoogle}'],
  ['Опыт', '{t[currentLanguage].experience}'],
  ['Квизы', '{t[currentLanguage].quizzes}'],
  ['Рекорды', '{t[currentLanguage].records}'],
  ['Серия', '{t[currentLanguage].streak}'],
  ['Ранг', '{t[currentLanguage].rank}'],
  ['Достижения', '{t[currentLanguage].achievements}'],
  ['Разблокировано', '{t[currentLanguage].unlocked}'],
  ['Интерактивные квизы', '{t[currentLanguage].interactiveQuizzes}'],
  ['Проверьте свои знания и узнайте новые факты о Казахстане.', '{t[currentLanguage].interactiveQuizzesDesc}'],
  ['Вопрос', '{t[currentLanguage].question}'],
  ['из', '{t[currentLanguage].of}'],
  ['Завершить', '{t[currentLanguage].finish}'],
  ['Далее', '{t[currentLanguage].next}'],
  ['Ответить', '{t[currentLanguage].answer}'],
  ['Правильно!', '{t[currentLanguage].correct}'],
  ['Неправильно', '{t[currentLanguage].incorrect}'],
  ['Правильный ответ:', '{t[currentLanguage].correctAnswerIs}'],
  ['Квиз завершен!', '{t[currentLanguage].quizCompleted}'],
  ['Ваш результат', '{t[currentLanguage].yourScore}'],
  ['Получено XP', '{t[currentLanguage].xpEarned}'],
  ['Идеально! +100 XP бонус', '{t[currentLanguage].perfect}'],
  ['К списку квизов', '{t[currentLanguage].backToQuizzes}'],
  ['Главная', '{t[currentLanguage].home}'],
  ['Профиль', '{t[currentLanguage].profile}'],
  ['Загрузка карты...', '{t[currentLanguage].loadingMap}'],
  ['Карта', '{t[currentLanguage].map}'],
  ['Регионы', '{t[currentLanguage].regionsTitle.split(" ")[0]}'], // "Регионы"
  ['Войти', '{t[currentLanguage].loginGoogle.split(" ")[0]}'], // "Войти"
];

for (const [ru, kz, isCode] of replacements) {
  if (isCode) {
    if (ru === 'QazaqGeo Learn') continue; // Skip title
    if (ru === 'Поиск региона или города...') {
      app = app.replace(/placeholder="Поиск региона или города\.\.\."/g, `placeholder={t[currentLanguage].searchPlaceholder}`);
    } else if (ru === 'Координаты центра:') {
      app = app.replace(/Координаты центра: \{selectedRegion\.coordinates\[1\]\}° N, \{selectedRegion\.coordinates\[0\]\}° E\. Регион обладает уникальным ландшафтом и климатическими особенностями, характерными для данной части Казахстана\./g, kz);
    }
  } else {
    // Replace exact strings in JSX
    const regex = new RegExp(ru.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g');
    app = app.replace(regex, kz);
  }
}

// Fix region and quiz data access
app = app.replace(/region\.name/g, 'region.name[currentLanguage]');
app = app.replace(/region\.capital/g, 'region.capital[currentLanguage]');
app = app.replace(/region\.description/g, 'region.description[currentLanguage]');
app = app.replace(/quiz\.title/g, 'quiz.title[currentLanguage]');
app = app.replace(/quiz\.description/g, 'quiz.description[currentLanguage]');
app = app.replace(/currentQuestion\.question/g, 'currentQuestion.question[currentLanguage]');
app = app.replace(/currentQuestion\.explanation/g, 'currentQuestion.explanation[currentLanguage]');
app = app.replace(/currentQuestion\.options\[/g, 'currentQuestion.options[currentLanguage][');
app = app.replace(/currentQuestion\.options\.map/g, 'currentQuestion.options[currentLanguage].map');

// Fix achievements
app = app.replace(/title: 'Первый шаг', description: 'Пройдите свой первый квиз'/g, "title: t[currentLanguage].achievementsList.first_quiz.title, description: t[currentLanguage].achievementsList.first_quiz.desc");
app = app.replace(/title: 'Отличник', description: 'Ответьте правильно на все вопросы в квизе'/g, "title: t[currentLanguage].achievementsList.perfect_score.title, description: t[currentLanguage].achievementsList.perfect_score.desc");
app = app.replace(/title: 'Исследователь', description: 'Достигните 5 уровня'/g, "title: t[currentLanguage].achievementsList.level_5.title, description: t[currentLanguage].achievementsList.level_5.desc");
app = app.replace(/title: 'Знаток регионов', description: 'Пройдите квиз по географии без ошибок'/g, "title: t[currentLanguage].achievementsList.all_regions.title, description: t[currentLanguage].achievementsList.all_regions.desc");
app = app.replace(/title: 'В ударе', description: 'Пройдите 3 квиза за один день'/g, "title: t[currentLanguage].achievementsList.streak_3.title, description: t[currentLanguage].achievementsList.streak_3.desc");

// Fix chartData
app = app.replace(/name: r\.name\.replace\(' область', ''\)\.replace\(' \(город\)', ''\)/g, "name: r.name[currentLanguage].replace(' область', '').replace(' (город)', '').replace(' облысы', '').replace(' (қала)', '')");
app = app.replace(/fullName: r\.name/g, "fullName: r.name[currentLanguage]");

// Fix fuzzy matching in handleMapRegionClick
app = app.replace(/r\.name\.toLowerCase\(\)/g, "r.name['ru'].toLowerCase()"); // Just use ru for map matching since geojson is in ru/en

// Fix "Уровень"
app = app.replace(/'Уровень'/g, "t[currentLanguage].rank");

// Fix "Подтвердить выбор"
app = app.replace(/>\s*Подтвердить выбор\s*</g, ">{currentLanguage === 'ru' ? 'Подтвердить выбор' : 'Таңдауды растау'}<");

// Fix "Следующий вопрос"
app = app.replace(/'Следующий вопрос'/g, "t[currentLanguage].next");

// Fix "О проекте"
app = app.replace(/>\s*О проекте\s*</g, ">{currentLanguage === 'ru' ? 'О проекте' : 'Жоба туралы'}<");
app = app.replace(/>\s*Навигация\s*</g, ">{currentLanguage === 'ru' ? 'Навигация' : 'Навигация'}<");
app = app.replace(/>\s*О нас\s*</g, ">{currentLanguage === 'ru' ? 'О нас' : 'Біз туралы'}<");
app = app.replace(/>\s*Контакты\s*</g, ">{currentLanguage === 'ru' ? 'Контакты' : 'Байланыстар'}<");
app = app.replace(/>\s*Политика конфиденциальности\s*</g, ">{currentLanguage === 'ru' ? 'Политика конфиденциальности' : 'Құпиялылық саясаты'}<");
app = app.replace(/Образовательная платформа для изучения географии, истории и культуры Казахстана в интерактивном формате\./g, "{currentLanguage === 'ru' ? 'Образовательная платформа для изучения географии, истории и культуры Казахстана в интерактивном формате.' : 'Қазақстанның географиясын, тарихын және мәдениетін интерактивті форматта үйренуге арналған білім беру платформасы.'}");
app = app.replace(/Все права защищены\./g, "{currentLanguage === 'ru' ? 'Все права защищены.' : 'Барлық құқықтар қорғалған.'}");
app = app.replace(/Сделано с любовью к Казахстану/g, "{currentLanguage === 'ru' ? 'Сделано с любовью к Казахстану' : 'Қазақстанға деген сүйіспеншілікпен жасалған'}");

fs.writeFileSync('src/App.tsx', app);
console.log('Done');
