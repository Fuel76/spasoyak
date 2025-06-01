import React from 'react';
import './AboutPage.css';

const brotherhood = [
  {
    name: 'Игумен Сергий (Губин)',
    role: 'Наместник монастыря',
    description: 'Руководит духовной и административной жизнью обители, несёт послушание настоятеля с 2022 года. Отличается вниманием к богослужению, заботой о братии и паломниках.'
  },
  {
    name: 'Игумен Леонтий',
    role: 'Казначей',
    description: 'Отвечает за хозяйственные вопросы, помогает в организации богослужений и монастырских мероприятий.'
  },
  {
    name: 'Иеродиакон Иаков',
    role: 'Казначей',
    description: 'Управляет финансовыми делами монастыря, следит за порядком в хозяйстве.'
  },
  
  // Можно добавить других насельников по мере необходимости
];

const AboutPage: React.FC = () => {
  return (
    <div className="about-page paper-bg">
      <div className="about-container paper-sheet paper-shadow">
        {/* Основной блок */}
        <section className="about-header paper-section">
          <h1 className="about-title paper-title handwritten">Спасо-Яковлевский Димитриев монастырь</h1>
          <p className="about-subtitle handwritten">Древняя святыня Ростова Великого</p>
        </section>

        {/* Основные данные */}
        <section className="about-main-info paper-section">
          <div className="about-text-block">
            <h2 className="paper-title">Кратко о монастыре</h2>
            <ul className="main-info-list">
              <li><b>Основан:</b> XIV век, святитель Иаков Ростовский</li>
              <li><b>Адрес:</b> Ярославская обл., г. Ростов, ул. Энгельса, 44</li>
              <li><b>Наместник:</b> игумен Сергий (Губин)</li>
              <li><b>Телефон канцелярии:</b> +7 (48536) 6-35-44</li>
              <li><b>Режим работы:</b> ежедневно 7:00–19:00</li>
            </ul>
            <div className="about-btns">
              <a href="/monastery-history" className="paper-btn">История монастыря</a>
            </div>
          </div>
          <div className="about-image-block paper-names">
            <img src="/src/assets/Расписание.svg" alt="Монастырь" style={{width:'100%',borderRadius:'18px',boxShadow:'0 2px 12px #e5d8c7'}} />
          </div>
        </section>

        {/* История (кратко) */}
        <section className="about-history-short paper-section">
          <h2 className="paper-title">История</h2>
          <p>
            Монастырь основан в XIV веке святителем Иаковом Ростовским. В XVIII веке к нему был присоединён Димитриевский монастырь, после чего обитель получила двойное наименование. Здесь покоятся мощи святителя Димитрия Ростовского. Подробнее — <a href="/about/history" className="paper-link">читайте на отдельной странице</a>.
          </p>
        </section>

        {/* Настоятель и братия */}
        <section className="about-brotherhood paper-section">
          <h2 className="paper-title">Настоятель и братия</h2>
          <div className="brotherhood-list">
            {brotherhood.map((b, i) => (
              <div className="brother-card paper-sheet" key={i}>
                <div className="brother-name handwritten">{b.name}</div>
                <div className="brother-role">{b.role}</div>
                <div className="brother-desc">{b.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Святыни и храмы */}
        <section className="about-shrines paper-section">
          <h2 className="paper-title">Святыни и храмы</h2>
          <div className="shrines-grid">
            <div className="shrine-card paper-sheet">
              <h4>Собор Зачатия Праведной Анны</h4>
              <p>Главный храм монастыря, здесь находится рака с мощами святителя Димитрия Ростовского.</p>
            </div>
            <div className="shrine-card paper-sheet">
              <h4>Церковь святителя Иакова</h4>
              <p>Древнейший храм обители, построен над гробом основателя — святителя Иакова Ростовского.</p>
            </div>
            <div className="shrine-card paper-sheet">
              <h4>Димитриевский храм</h4>
              <p>Храм в честь святителя Димитрия Ростовского, здесь совершаются ежедневные богослужения.</p>
            </div>
            <div className="shrine-card paper-sheet">
              <h4>Колокольня</h4>
              <p>Высокая колокольня XVIII века с уникальным набором колоколов.</p>
            </div>
          </div>
        </section>

        {/* Паломничество и контакты */}
        <section className="about-pilgrimage paper-section">
          <h2 className="paper-title">Паломничество и контакты</h2>
          <div className="pilgrimage-info">
            <div className="pilgrimage-text">
              <ul className="main-info-list">
                <li><b>Богослужения:</b> ежедневно — утреня 7:00, литургия 8:00, вечерня 17:00</li>
                <li><b>Экскурсии:</b> по предварительной договорённости</li>
                <li><b>Паломнические группы:</b> принимаются по записи</li>
              </ul>
              <div className="services-info">
                <b>Духовные услуги:</b>
                <ul>
                  <li>Молебны и панихиды</li>
                  <li>Исповедь и причастие</li>
                  <li>Духовные беседы</li>
                  <li>Венчание и крещение (по договорённости)</li>
                </ul>
              </div>
            </div>
            <div className="contact-info">
              <b>Адрес:</b> Ярославская область, г. Ростов, ул. Энгельса, 44<br/>
              <b>Телефон:</b> +7 (48536) 6-35-44<br/>
              <b>Email:</b> <a href="mailto:monastery@yandex.ru" className="paper-link">monastery@yandex.ru</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
