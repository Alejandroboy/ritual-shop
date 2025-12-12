export default function ConsentPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:py-12">
        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Согласие на обработку персональных данных
          </h1>
        </header>

        <article className="mt-6 rounded-2xl bg-white p-5 sm:p-6 lg:p-8 shadow-sm ring-1 ring-neutral-200 space-y-4 sm:space-y-5">
          <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
            Настоящим выражаю свое согласие на автоматизированную и
            неавтоматизированную обработку моих персональных данных, переданных
            мною лично Оператору посредством заполнения форм на сайте{' '}
            <a
              href="https://www.oval66.ru/"
              className="underline decoration-dotted underline-offset-2"
            >
              https://www.oval66.ru/
            </a>{' '}
            в телекоммуникационной сети Интернет (далее — Сайт), в соответствии
            со следующим перечнем:
          </p>

          <ul className="list-disc space-y-1 pl-6 text-sm sm:text-base leading-relaxed text-neutral-800">
            <li>Имя;</li>
            <li>Телефон;</li>
            <li>Email.</li>
          </ul>

          <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
            Оператор может обрабатывать мои персональные данные в следующих
            целях:
          </p>

          <ul className="list-disc space-y-1 pl-6 text-sm sm:text-base leading-relaxed text-neutral-800">
            <li>
              повышения моей осведомленности о продуктах и услугах Оператора;
            </li>
            <li>заключения со мной договоров и их исполнения;</li>
            <li>информирования меня о новостях и предложениях Оператора;</li>
            <li>идентификации меня на Сайте;</li>
            <li>
              обеспечение соблюдения законов и иных нормативных правовых актов в
              области персональных данных.
            </li>
          </ul>

          <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
            Обработка Оператором моих персональных данных (на бумажных
            носителях, в информационных системах персональных данных и без
            использования средств автоматизации, а также смешанным способом)
            должна осуществляться в соответствии с требованиями Федерального
            закона от 27.07.2006 г. №152-ФЗ «О персональных данных», Политики в
            отношении обработки персональных данных ИП Селезневой Екатерины
            Александровны.
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
            Оператор вправе осуществлять обработку моих персональных данных
            следующими способами: сбор, запись, систематизация, накопление,
            хранение, уточнение (обновление, изменение), использование, передача
            (распространение, предоставление, доступ), обезличивание,
            блокирование, уничтожение.
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
            Настоящее согласие вступает в силу с момента передачи моих
            персональных данных Оператору посредством заполнения форм на Сайте и
            действует до дня отзыва в письменной форме.
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
            Настоящее согласие может быть отозвано письменным заявлением на
            e-mail ИП Селезневой Екатерины Александровны{' '}
            <a
              href="mailto:uralskiitsentrfoto.pamyatniki@yandex.ru"
              className="underline decoration-dotted underline-offset-2"
            >
              uralskiitsentrfoto.pamyatniki@yandex.ru
            </a>{' '}
            либо письменным уведомлением по адресу: ИП Селезнева Екатерина
            Александровна, 620135, Свердловская область, г. Екатеринбург, ул.
            Старых Большевиков 82, корпус 2, оф. 2.
          </p>
        </article>
      </div>
    </main>
  );
}
