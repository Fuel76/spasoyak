import React, { useState, useEffect, useMemo } from 'react';
import './TrebyPage.css';
import '../../styles/system-pages.css'; // Импорт общих стилей

// Предполагаемые обновления для типа TrebaFormField
interface TrebaFormField {
  id: number;
  fieldName: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'NUMBER' | 'DATE'; // Добавлен DATE
  label: string;
  options?: { value: string; label: string; }[] | string[]; // Скорректирован тип options
  placeholder?: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  defaultValue?: any;
  associatedTreba?: string; // Добавлено
  rows?: number; // Добавлено
  hint?: string; // Добавлено
  associatedPeriod?: string[]; // Для связи с периодами
}

interface TrebaPricingRule {
  id: number;
  name: string;
  periodValue: string;
  description?: string;
  price: number;
  priceType: 'PER_NAME' | 'PER_TEN_NAMES' | 'FIXED';
  currency: string;
  isActive: boolean;
}

const TrebyPage: React.FC = () => {
  const [type, setType] = useState('');
  const [names, setNames] = useState('');
  const [email, setEmail] = useState('');
  const [period, setPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<TrebaFormField[]>([]);
  const [pricingRules, setPricingRules] = useState<TrebaPricingRule[]>([]);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, any>>({});
  // const [customDate, setCustomDate] = useState<Date | null>(null); // Удалено
  // const [showDatePicker, setShowDatePicker] = useState(false); // Удалено

  const API_URL = 'http://localhost:3000/api';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fieldsRes, rulesRes] = await Promise.all([
          fetch(`${API_URL}/treby-form-fields`),
          fetch(`${API_URL}/treby-pricing-rules`)
        ]);
        if (!fieldsRes.ok) throw new Error('Ошибка загрузки полей формы');
        if (!rulesRes.ok) throw new Error('Ошибка загрузки правил ценообразования');
        
        const fieldsData = await fieldsRes.json();
        const rulesData = await rulesRes.json();

        setFormFields(fieldsData.filter((field: TrebaFormField) => field.isActive));
        setPricingRules(rulesData.filter((rule: TrebaPricingRule) => rule.isActive));
        
        const initialDynamicData: Record<string, any> = {};
        fieldsData
          .filter((field: TrebaFormField) => field.isActive && field.defaultValue)
          .forEach((field: TrebaFormField) => {
            initialDynamicData[field.fieldName] = field.defaultValue;
          });
        setDynamicFieldsData(initialDynamicData);

      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных для формы');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFieldsData(prev => ({ ...prev, [fieldName]: value }));
  };
  
  const activeDynamicFields = useMemo(() => {
    return formFields.filter(field => 
      field.isActive && 
      (!field.associatedTreba || field.associatedTreba === type) &&
      (!field.associatedPeriod || field.associatedPeriod.includes(period))
    );
  }, [formFields, type, period]);

  const activeDynamicFieldsCount = activeDynamicFields.length;


  const calculatedPrice = useMemo(() => {
    if (!type || !period) return 0;
    const rule = pricingRules.find(r => r.name === type && r.periodValue === period);
    if (!rule) return 0;

    const namesCount = names.split('\\n').filter(name => name.trim() !== '').length;
    let price = 0;

    if (rule.priceType === 'PER_NAME') {
      price = namesCount * rule.price;
    } else if (rule.priceType === 'PER_TEN_NAMES') {
      price = Math.ceil(namesCount / 10) * rule.price;
    } else { // FIXED
      price = rule.price;
    }
    return price;
  }, [type, period, names, pricingRules]);

  const currentCurrency = useMemo(() => {
    if (!type || !period) return 'RUB';
    const rule = pricingRules.find(r => r.name === type && r.periodValue === period);
    return rule?.currency || 'RUB';
  }, [type, period, pricingRules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setPaymentUrl(null);

    if (calculatedPrice <= 0 && names.split('\\n').filter(name => name.trim() !== '').length > 0) {
        // Если цена 0, но имена есть, возможно, это бесплатная треба или ошибка в правилах
        // Можно добавить обработку или предупреждение
    }

    try {
      const res = await fetch(`${API_URL}/treby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          names, 
          email, 
          period, 
          calculatedPrice, 
          currency: currentCurrency,
          dynamicFieldsData,
          // customDate: customDate ? customDate.toISOString().split('T')[0] : null, // Удалено или заменить на dynamicFieldsData если есть поле даты
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ошибка отправки записки');
      }
      const data = await res.json();
      setSuccess(true);
      // Очистка формы после успешной отправки, кроме email
      // setType(''); 
      // setNames('');
      // setPeriod('');
      // setDynamicFieldsData({});


      // Попытка сразу создать платеж, если цена > 0
      if (calculatedPrice > 0) {
        const paymentRes = await fetch(`${API_URL}/treby/${data.id}/pay`, { method: 'POST' });
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          setPaymentUrl(paymentData.url);
        } else {
          // Ошибка создания платежа не должна блокировать сообщение об успехе подачи требы
          console.warn('Не удалось автоматически создать платеж, но треба зарегистрирована.');
        }
      }

    } catch (err: any) {
      setError(err.message || 'Ошибка отправки');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Эффект для установки периода, если для выбранного типа требы только один вариант периода
  useEffect(() => {
    if (type) {
      const applicableRules = pricingRules.filter(r => r.name === type);
      if (applicableRules.length === 1) {
        setPeriod(applicableRules[0].periodValue);
      } else if (applicableRules.length > 1 && !applicableRules.find(r => r.periodValue === period)) {
        // Если текущий период невалиден для нового типа требы, сбрасываем его
        // или устанавливаем первый доступный
         setPeriod(''); // или applicableRules[0].periodValue
      }
    }
  }, [type, pricingRules, period]);


  return (
    <div className="system-page-container treby-page"> 
      <div className="system-page-content treby-page"> 
        <h1 className="system-page-title treby-title handwritten">Подать записку</h1>

        {isLoading && !formFields.length && !pricingRules.length && (
          <div className="system-alert system-alert-info treby-alert">
            Загрузка данных формы...
          </div>
        )}
        {error && !success && <div className="system-alert system-alert-error treby-alert">{error}</div>}
        
        {success && paymentUrl && (
          <div className="system-alert system-alert-success treby-alert">
            Записка успешно отправлена! <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="system-link">Перейти к оплате</a>
          </div>
        )}
        {success && !paymentUrl && (
          <div className="system-alert system-alert-success treby-alert">
            Записка успешно отправлена! Ожидайте подтверждения.
          </div>
        )}

        {(!success || paymentUrl) && (
          <div className="treby-form-section">
            <div className="treby-form-left">
              <form onSubmit={handleSubmit} className="treby-form">
                <div className="form-step">
                  <div className="form-step-title handwritten">Шаг 1. Выберите требу</div>
                  <div className="form-group">
                    <label htmlFor="type" className="treby-label">Тип требы</label>
                    <select
                      id="type"
                      value={type}
                      onChange={e => {
                        setType(e.target.value);
                        setError('');
                        setSuccess(false);
                        setPaymentUrl(null);
                        setPeriod('');
                        const initialDynamicData: Record<string, any> = {};
                        formFields.filter(f => f.isActive && f.defaultValue).forEach(f => {
                          initialDynamicData[f.fieldName] = f.defaultValue;
                        });
                        setDynamicFieldsData(initialDynamicData);
                      }}
                      className="form-control treby-select system-form-select"
                      required
                    >
                      <option value="" disabled>Выберите тип требы</option>
                      {[...new Set(pricingRules.map(r => r.name))].map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {type && pricingRules.filter(r => r.name === type).length > 1 && (
                  <div className="form-step">
                    <div className="form-step-title handwritten">Шаг 2. Срок поминовения</div>
                    <div className="form-group">
                      <label className="treby-label">Как часто поминовать</label>
                      <div className="radio-group">
                        {pricingRules.filter(r => r.name === type).map(rule => (
                          <label key={rule.periodValue} className="handwritten">
                            <input
                              type="radio"
                              name="period"
                              value={rule.periodValue}
                              checked={period === rule.periodValue}
                              onChange={e => setPeriod(e.target.value)}
                              required
                            />
                            <span>{rule.periodValue} (+{rule.price} {rule.currency} {rule.priceType === 'PER_NAME' ? 'за имя' : rule.priceType === 'PER_TEN_NAMES' ? 'за 10 имен' : ''})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {/* Логика установки периода перенесена в useEffect */}

                <div className="form-step">
                  <div className="form-step-title handwritten">Шаг {type && pricingRules.filter(r => r.name === type).length > 1 ? 3 : 2}. Впишите имена</div>
                  <div className="form-group names-input-wrapper">
                    <label htmlFor="names" className="treby-label">Имена (каждое с новой строки, в родительном падеже)</label>
                    <textarea
                      id="names"
                      value={names}
                      onChange={e => setNames(e.target.value)}
                      className="form-control treby-textarea system-form-textarea"
                      placeholder="Например:\\nО здравии болящего воина Иоанна\\nО упокоении новопреставленной Марии..."
                      rows={8}
                      required
                    />
                    <div className="field-hint handwritten">Пишите полные православные имена.</div>
                  </div>
                </div>
                
                {activeDynamicFields.map((field, index) => (
                  <div className="form-step" key={field.id}>
                     <div className="form-step-title handwritten">Шаг {type && pricingRules.filter(r => r.name === type).length > 1 ? 4 + index : 3 + index}. {field.label}</div>
                    <div className="form-group">
                      <label htmlFor={field.fieldName} className="treby-label">{field.label}</label>
                      {field.fieldType === 'TEXT' && (
                        <input
                          type="text"
                          id={field.fieldName}
                          name={field.fieldName}
                          value={dynamicFieldsData[field.fieldName] || ''}
                          onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="form-control treby-input system-form-input"
                          required={field.isRequired}
                        />
                      )}
                      {field.fieldType === 'TEXTAREA' && (
                        <textarea
                          id={field.fieldName}
                          name={field.fieldName}
                          value={dynamicFieldsData[field.fieldName] || ''}
                          onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="form-control treby-textarea system-form-textarea"
                          rows={field.rows || 4}
                          required={field.isRequired}
                        />
                      )}
                      {field.fieldType === 'SELECT' && field.options && (
                        <select
                          id={field.fieldName}
                          name={field.fieldName}
                          value={dynamicFieldsData[field.fieldName] || ''}
                          onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                          className="form-control treby-select system-form-select"
                          required={field.isRequired}
                        >
                          <option value="" disabled>{field.placeholder || 'Выберите...'}</option>
                          {(field.options as any[]).map(option => ( // Приведение к any[] для обхода ошибки типа
                            typeof option === 'string' 
                            ? <option key={option} value={option}>{option}</option>
                            : <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                      {field.fieldType === 'DATE' && ( // Исправлено для типа DATE
                        <input
                          type="date"
                          id={field.fieldName}
                          name={field.fieldName}
                          value={dynamicFieldsData[field.fieldName] || ''}
                          onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                          className="form-control treby-input system-form-input"
                          required={field.isRequired}
                        />
                      )}
                      {field.fieldType === 'NUMBER' && (
                        <input
                          type="number"
                          id={field.fieldName}
                          name={field.fieldName}
                          value={dynamicFieldsData[field.fieldName] || ''}
                          onChange={e => handleDynamicFieldChange(field.fieldName, e.target.valueAsNumber || e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="form-control treby-input system-form-input"
                          required={field.isRequired}
                        />
                      )}
                      {field.fieldType === 'CHECKBOX' && (
                        <div className="checkbox-group">
                           <label className="handwritten">
                            <input
                              type="checkbox"
                              id={field.fieldName}
                              name={field.fieldName}
                              checked={!!dynamicFieldsData[field.fieldName]}
                              onChange={e => handleDynamicFieldChange(field.fieldName, e.target.checked)}
                            />
                            <span>{field.placeholder || field.label}</span>
                          </label>
                        </div>
                      )}
                      {field.hint && <div className="field-hint handwritten">{field.hint}</div>}
                    </div>
                  </div>
                ))}

                <div className="form-step">
                  <div className="form-step-title handwritten">Шаг {type && pricingRules.filter(r => r.name === type).length > 1 ? 4 + activeDynamicFieldsCount : 3 + activeDynamicFieldsCount}. Ваша почта</div>
                  <div className="form-group">
                    <label htmlFor="email" className="treby-label">Email (для уведомлений)</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="form-control treby-input system-form-input"
                      placeholder="Для получения уведомлений о статусе требы"
                      required
                    />
                    <div className="field-hint handwritten">Мы не рассылаем спам. Почта нужна только для уведомлений о статусе вашей требы.</div>
                  </div>
                </div>

                <div className="form-step">
                  <div className="form-step-title handwritten">Шаг {type && pricingRules.filter(r => r.name === type).length > 1 ? 5 + activeDynamicFieldsCount : 4 + activeDynamicFieldsCount}. Пожертвование</div>
                  <div className="form-group calculated-price-section">
                    <h3 className="treby-label">Сумма пожертвования:</h3>
                    <p className="calculated-price handwritten">{calculatedPrice.toFixed(2)} {currentCurrency}</p>
                  </div>
                </div>

                <button className="btn btn-primary treby-submit-btn system-btn system-btn-primary handwritten" type="submit" disabled={isLoading || (success && !paymentUrl)}>
                  {isLoading ? 'Отправка...' : (success && !paymentUrl) ? 'Отправлено!' : 'Подать записку и перейти к пожертвованию'}
                </button>
              </form>
            </div>

            <div className="treby-instructions-right">
              <div className="instruction-block">
                <h3 className="instruction-title handwritten">Как правильно подавать записки</h3>
                <p>В записках пишутся только имена крещеных людей православного вероисповедания.</p>
                <ul>
                  <li className="handwritten">Пишите имена полностью, в родительном падеже (например, <i>Иоанна, Марии, Сергия</i>).</li>
                  <li className="handwritten">Перед именами священнослужителей указывайте их сан (например, <i>иерея Петра, монахини Евфросинии</i>).</li>
                  <li className="handwritten">Ребенок до 7 лет называется младенцем (<i>младенца Кирилла</i>), от 7 до 14 лет – отроком/отроковицей (<i>отрока Алексия, отроковицы Анны</i>).</li>
                  <li className="handwritten">Можно добавлять слова: <i>воина, болящего, путешествующего, заключенного</i>.</li>
                  <li className="handwritten">В заупокойных записках усопший в течение 40 дней по кончине именуется новопреставленным (<i>новопреставленного Виктора</i>). Можно добавлять: <i>приснопамятного (в день смерти или именин усопшего), убиенного</i>.</li>
                </ul>
              </div>
              <div className="instruction-block">
                <h3 className="instruction-title handwritten">О здравии</h3>
                <p>Подаются записки о живых людях. Молитва о здравии включает в себя просьбы о телесном здоровье, духовном спасении и помощи Божией в земных делах.</p>
                {/* <img src={crossZdravie} alt="Крест о здравии" style={{ width: '80px', margin: '10px auto', display: 'block' }} /> */}
              </div>
              <div className="instruction-block">
                <h3 className="instruction-title handwritten">О упокоении</h3>
                <p>Подаются записки об усопших. Церковь молится о прощении грехов умерших и даровании им Царствия Небесного.</p>
                {/* <img src={crossUpokoi} alt="Крест о упокоении" style={{ width: '80px', margin: '10px auto', display: 'block' }} /> */}
              </div>
               <div className="instruction-block">
                <h3 className="instruction-title handwritten">Виды треб</h3>
                <ul>
                  {pricingRules.reduce((acc, rule) => {
                    if (!acc.find(item => item.name === rule.name)) {
                      acc.push({name: rule.name, description: rule.description});
                    }
                    return acc;
                  }, [] as {name:string, description?:string}[])
                  .map(item => (
                    <li key={item.name} className="handwritten"><strong>{item.name}:</strong> {item.description || 'Поминовение на богослужении.'}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrebyPage;
