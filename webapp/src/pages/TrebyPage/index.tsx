import React, { useState, useEffect, useCallback } from 'react'; // Added useEffect, useCallback
import './TrebyPage.css';
import crossZdravie from '../../assets/cross_zdravие.svg';
import crossUpokoi from '../../assets/cross_upokoi.svg';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Frontend interfaces matching backend Prisma models
interface TrebaFormField {
  id: number;
  fieldName: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'NUMBER';
  label: string;
  options?: { value: string; label: string }[] | null;
  placeholder?: string | null;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  defaultValue?: string | null;
  validationRegex?: string | null;
  validationMessage?: string | null;
}

interface TrebaPricingRule {
  id: number;
  name: string; // Name of the treba (e.g., 'о здравии')
  periodValue: string;
  description?: string | null;
  price: number;
  priceType: 'PER_NAME' | 'PER_TEN_NAMES' | 'FIXED';
  currency: string;
  isActive: boolean;
}

const TrebyPage = () => {
  const [type, setType] = useState('о здравии');
  const [names, setNames] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [trebaId, setTrebaId] = useState<number | null>(null);
  const [period, setPeriod] = useState('Разовое');
  const [email, setEmail] = useState('');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formFields, setFormFields] = useState<TrebaFormField[]>([]);
  const [pricingRules, setPricingRules] = useState<TrebaPricingRule[]>([]);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, any>>({});
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [currentCurrency, setCurrentCurrency] = useState<string>('RUB');

  // Fetch form fields and pricing rules
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fieldsRes, rulesRes] = await Promise.all([
          fetch('/api/treba-form-fields'),
          fetch('/api/treba-pricing-rules')
        ]);
        if (!fieldsRes.ok) throw new Error('Ошибка загрузки полей формы');
        if (!rulesRes.ok) throw new Error('Ошибка загрузки правил ценообразования');
        
        const fieldsData = await fieldsRes.json();
        const rulesData = await rulesRes.json();

        setFormFields(fieldsData.filter((field: TrebaFormField) => field.isActive));
        setPricingRules(rulesData.filter((rule: TrebaPricingRule) => rule.isActive));
        
        // Initialize dynamicFieldsData with defaultValues
        const initialDynamicData: Record<string, any> = {};
        fieldsData.filter((field: TrebaFormField) => field.isActive && field.defaultValue).forEach((field: TrebaFormField) => {
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

  // Calculate price
  const calculatePrice = useCallback(() => {
    const namesArray = names.split('\n').filter(name => name.trim() !== '');
    const namesCount = namesArray.length;

    const rule = pricingRules.find(r => r.name === type && r.periodValue === period);

    if (rule) {
      let price = 0;
      if (rule.priceType === 'PER_NAME') {
        price = namesCount * rule.price;
      } else if (rule.priceType === 'PER_TEN_NAMES') {
        price = Math.ceil(namesCount / 10) * rule.price;
      } else { // FIXED
        price = rule.price;
      }
      setCalculatedPrice(price);
      setCurrentCurrency(rule.currency);
    } else {
      setCalculatedPrice(0); // Default to 0 if no rule found
      setCurrentCurrency('RUB');
      // console.warn(`No pricing rule found for type: ${type}, period: ${period}`);
    }
  }, [names, type, period, pricingRules]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  const handleDynamicFieldChange = (fieldName: string, value: any) => {
    setDynamicFieldsData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/treby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, names, period, email, dynamicFieldsData, customDate: period === 'custom' && customDate ? customDate : undefined })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Ошибка отправки формы' }));
        throw new Error(errorData.error || errorData.message || 'Ошибка отправки формы');
      }
      const data = await res.json();
      setSuccess(true);
      setNames('');
      setEmail(''); 
      // Reset dynamic fields to default or clear
      const initialDynamicData: Record<string, any> = {};
      formFields.forEach(field => {
        if (field.defaultValue) {
          initialDynamicData[field.fieldName] = field.defaultValue;
        } else {
          // For fields without default, decide clear strategy (e.g., empty string, false for checkbox)
          if (field.fieldType === 'CHECKBOX') initialDynamicData[field.fieldName] = false;
          else initialDynamicData[field.fieldName] = ''; 
        }
      });
      setDynamicFieldsData(initialDynamicData);
      setTrebaId(data.id);
      setPaymentUrl(null); // Reset payment URL
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для оплаты (заглушка)
  const handlePay = async () => {
    if (!trebaId) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/treby/${trebaId}/pay`, { method: 'POST' });
      if (!res.ok) throw new Error('Ошибка создания платежа');
      const data = await res.json();
      setPaymentUrl(data.url);
    } catch (err: any) {
      setError(err.message || 'Ошибка оплаты');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="treby-page-container paper-bg">
      <div className="treby-page paper-sheet paper-shadow">
        <h1 className="treby-title handwritten">Подать записку</h1>

        {/* Paper-like алерт загрузки */}
        {isLoading && !formFields.length && !pricingRules.length && (
          <div className="treby-alert paper-alert paper-alert-loading">
            <span className="paper-spinner" /> Загрузка данных формы...
          </div>
        )}
        {/* Paper-like алерт ошибки */}
        {error && !success && <div className="treby-alert paper-alert paper-alert-error handwritten">{error}</div>}

        <div className="treby-form-section">
          <div className="treby-form-left">
            <form onSubmit={handleSubmit} className="treby-form">
              {/* Шаг 1: Тип требы */}
              <div className="form-step">
                <div className="form-step-title handwritten">Шаг 1. Тип требы</div>
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
                    }}
                    className="form-control treby-select"
                    required
                  >
                    <option value="" disabled>Выберите тип требы</option>
                    {[...new Set(pricingRules.map(r => r.name))].map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Шаг 2: Период */}
              <div className="form-step">
                <div className="form-step-title handwritten">Шаг 2. Период</div>
                <div className="form-group period-group">
                  <label htmlFor="period" className="treby-label">Период</label>
                  <select
                    id="period"
                    value={period}
                    onChange={e => {
                      setPeriod(e.target.value);
                      setError('');
                      setSuccess(false);
                      setPaymentUrl(null);
                      setCustomDate(null);
                      setShowDatePicker(false);
                    }}
                    className="form-control treby-select"
                    required
                    disabled={!type}
                  >
                    <option value="" disabled>Выберите период</option>
                    {pricingRules.filter(r => r.name === type).map(r => (
                      <option key={r.periodValue} value={r.periodValue}>{r.periodValue}</option>
                    ))}
                    <option value="custom">Другая дата</option>
                  </select>
                  {period === 'custom' && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary paper-btn"
                      onClick={() => setShowDatePicker(v => !v)}
                    >
                      {customDate ? `Дата: ${customDate.toLocaleDateString()}` : 'Выбрать дату'}
                    </button>
                  )}
                </div>
                {period === 'custom' && showDatePicker && (
                  <div className="datepicker-paper">
                    <DatePicker
                      selected={customDate}
                      onChange={date => { setCustomDate(date); setShowDatePicker(false); }}
                      dateFormat="dd.MM.yyyy"
                      placeholderText="Выберите дату"
                      className="form-control treby-input"
                      minDate={new Date()}
                      inline
                    />
                  </div>
                )}
              </div>

              {/* Шаг 3: Динамические поля */}
              {formFields.sort((a, b) => a.order - b.order).map(field => {
                if (!field.isActive) return null;
                const fieldId = `dynamic-field-${field.fieldName}`;
                switch (field.fieldType) {
                  case 'TEXT':
                  case 'NUMBER': // Treat number as text for input type, validation can be added
                  case 'TEXTAREA':
                    return (
                      <div className="form-group" key={field.id}>
                        <label htmlFor={fieldId} className="treby-label">{field.label}{field.isRequired && '*'}</label>
                        {field.fieldType === 'TEXTAREA' ? (
                          <textarea
                            id={fieldId}
                            className="form-control treby-textarea"
                            value={dynamicFieldsData[field.fieldName] || ''}
                            onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                            placeholder={field.placeholder || ''}
                            required={field.isRequired}
                            rows={3} // Default rows for dynamic textarea
                          />
                        ) : (
                          <input
                            id={fieldId}
                            type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                            className="form-control treby-input"
                            value={dynamicFieldsData[field.fieldName] || ''}
                            onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                            placeholder={field.placeholder || ''}
                            required={field.isRequired}
                          />
                        )}
                      </div>
                    );
                  case 'SELECT':
                    return (
                      <div className="form-group" key={field.id}>
                        <label htmlFor={fieldId} className="treby-label">{field.label}{field.isRequired && '*'}</label>
                        <select 
                          id={fieldId} 
                          className="form-control treby-select"
                          value={dynamicFieldsData[field.fieldName] || ''}
                          onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                          required={field.isRequired}
                        >
                          <option value="">{field.placeholder || 'Выберите...'}</option>
                          {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    );
                  case 'RADIO':
                    return (
                      <div className="form-group" key={field.id}>
                        <label className="treby-label">{field.label}{field.isRequired && '*'}</label>
                        <div className="radio-group">
                          {field.options?.map(opt => (
                            <label key={opt.value}>
                              <input 
                                type="radio" 
                                name={field.fieldName} 
                                value={opt.value} 
                                checked={dynamicFieldsData[field.fieldName] === opt.value}
                                onChange={e => handleDynamicFieldChange(field.fieldName, e.target.value)}
                                required={field.isRequired && !field.options?.some(o => dynamicFieldsData[field.fieldName] === o.value)} // Complex required logic for radio
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                    case 'CHECKBOX':
                      return (
                        <div className="form-group" key={field.id}>
                          <label className="treby-label">
                            <input 
                              type="checkbox" 
                              id={fieldId}
                              checked={!!dynamicFieldsData[field.fieldName]}
                              onChange={e => handleDynamicFieldChange(field.fieldName, e.target.checked)}
                              // required={field.isRequired} // Required for checkbox might need specific handling
                            />
                            {field.label} {field.isRequired && '*'}
                          </label>
                        </div>
                      );
                  default:
                    return <p key={field.id}>Unsupported field type: {field.fieldType}</p>;
                }
              })}

              {/* Шаг 4: Имена */}
              <div className="form-step">
                <div className="form-step-title handwritten">Шаг 3. Имена</div>
                <div className="form-group">
                  <label htmlFor="names" className="treby-label">Имена (каждое с новой строки)</label>
                  <div className={`names-input-wrapper paper-names ${type === 'о здравии' ? 'zdravie-style' : 'upokoi-style'}`}> 
                    <div className="cross-icon">
                      <img src={type === 'о здравии' ? crossZdravie : crossUpokoi} alt="cross" />
                    </div>
                    <textarea
                      id="names"
                      className="form-control treby-textarea handwritten"
                      value={names}
                      onChange={e => { setNames(e.target.value); setError(''); setSuccess(false); setPaymentUrl(null); }}
                      rows={10}
                      placeholder="Каждое имя на новой строке, в родительном падеже (Иоанна, Марии...)"
                      required
                    />
                  </div>
                  <div className="field-hint handwritten">Пример: Иоанна\nМарии\nАлександра</div>
                </div>
              </div>

              {/* Email */}
              <div className="form-step">
                <div className="form-step-title handwritten">Шаг 4. Контакты</div>
                <div className="form-group">
                  <label htmlFor="email" className="treby-label">Электронная почта</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control treby-input"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="Для получения уведомлений"
                    required
                  />
                  <div className="field-hint handwritten">Мы не рассылаем спам. Почта нужна только для уведомлений.</div>
                </div>
              </div>

              {/* Итоговая сумма */}
              <div className="form-step">
                <div className="form-step-title handwritten">Шаг 5. Пожертвование</div>
                <div className="form-group calculated-price-section">
                  <h3 className="treby-label">Сумма пожертвования:</h3>
                  <p className="calculated-price handwritten">{calculatedPrice.toFixed(2)} {currentCurrency}</p>
                </div>
              </div>

              <button className="btn btn-primary treby-submit-btn paper-btn handwritten" type="submit" disabled={isLoading || (success && !paymentUrl)}>
                {isLoading ? 'Отправка...' : (success && !paymentUrl) ? 'Заявка отправлена' : 'Пожертвовать и перейти к оплате'}
              </button>

              {/* Paper-like алерт успеха */}
              {success && (
                <div className="treby-alert paper-alert paper-alert-success handwritten">
                  Ваша записка отправлена! ID заявки: {trebaId}.<br />
                  {paymentUrl ? (
                    <div className="mt-2">
                      <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary paper-btn">
                        Оплатить ({calculatedPrice.toFixed(2)} {currentCurrency})
                      </a>
                    </div>
                  ) : (
                    <button className="btn btn-success mt-2 paper-btn" onClick={handlePay} disabled={isLoading || !trebaId}>
                      Сформировать ссылку на оплату
                    </button>
                  )}
                </div>
              )}
              {/* Paper-like алерт ошибки */}
              {error && !success && <div className="treby-alert paper-alert paper-alert-error handwritten">{error}</div>}
            </form>
          </div>

          <div className="treby-instructions-right paper-sheet paper-shadow">
            <div className="instruction-block">
              <h3 className="instruction-title handwritten">Как правильно заполнить</h3>
              <p>Имена пишутся в родительном падеже (Олега, Владимира, Наталии, Елены) без пробелов и знаков препинания.</p>
              <p>Пометка пишется в поле справа: младенца, воина, иерея, и т.д.</p>
            </div>
            <div className="instruction-block">
              <h3 className="instruction-title handwritten">Рекомендуемое пожертвование за 1 имя</h3>
              <ul>
                <li>Молебен, панихида, разовое - 5 ₽</li>
                <li>Проскомидия (40 дней) - 500 ₽</li>
                <li>Проскомидия (1 год) - 2000 ₽</li>
                <li>Неусыпаемая Псалтирь (1 год) - 2000 ₽</li>
              </ul>
              <p>Пожертвование добровольное. Сумму можно изменить.</p>
            </div>
            <div className="instruction-block">
              <h3 className="instruction-title handwritten">Как совершается поминовение</h3>
              <p>Информация о совершении поминовения...</p>
            </div>
            <div className="instruction-block">
              <p>При возникновении вопросов пишите нам на <a href="mailto:rites@example.com">rites@example.com</a></p>
              <p>Не нашли то, что Вас интересует? Найдите ответ в разделе <a href="/faq">Ответы на частые вопросы</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrebyPage;
