export default function OrderRulesPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:py-12">
        {/* Заголовок страницы */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Правила оформления заказа
          </h1>
          <p className="mt-2 text-sm text-neutral-500">18 ноября 2015 г.</p>
        </header>

        {/* Карточка с правилами */}
        <article className="mt-6 rounded-2xl bg-white p-5 sm:p-6 lg:p-8 shadow-sm ring-1 ring-neutral-200">
          {/* Блок: Качество изображения */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Качество изображения
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              Оформляя заказ фото на памятник (фотоовал, табличка, портрет),
              обращайте внимание на качество фотоснимка. Лучше всего, если
              фотография сделана в фотостудии либо цифровой камерой высокого
              разрешения. Если изображение меньше 1,5–2&nbsp;см, то при
              увеличении потеря резкости неизбежна. Помните, что качество
              готовой продукции напрямую зависит от качества предоставляемой
              вами фотографии!
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              <span className="font-semibold">Требования к фото:</span> если вы
              сканируете фотографию самостоятельно, то на сканере нужно
              выставить разрешение не менее{' '}
              <span className="font-medium">600 dpi</span> (для маленьких фото —
              не менее <span className="font-medium">1200 dpi</span>). Формат
              фото —<span className="font-medium"> JPEG</span>. Если фото уже
              цифровое, сжимать его менее{' '}
              <span className="font-medium">5 МБ</span> не нужно.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              При предоставлении фотографии низкого качества (очень мелкое лицо
              на фото, фотографии с «мыльницы»), а также фото на рельефной
              (фактурной) бумаге — заказ фото на памятник принимается{' '}
              <span className="font-semibold">без претензий</span>.
            </p>
          </section>

          {/* Разделитель */}
          <div className="my-6 h-px bg-neutral-200" />

          {/* Блок: Ретушь и дополнительные услуги */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Ретушь и дополнительные услуги
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              Обратите внимание, что услуги ретуши оплачиваются дополнительно
              (наши менеджеры свяжутся с вами и уточнят все условия при
              оформлении заказа).
            </p>

            <ul className="space-y-2 text-sm sm:text-base leading-relaxed text-neutral-800">
              <li>
                • Фотографии с дефектами (трещины, заломы, пятна и т.п.)
                подлежат ретушированию. Стоимость ретуши —{' '}
                <span className="font-medium">от 100&nbsp;р.</span> в
                зависимости от сложности выполнения.
              </li>
              <li>
                • Замена одежды на фото —{' '}
                <span className="font-medium">50&nbsp;р.</span>
              </li>
              <li>
                • Раскрашивание (оцветнение) чёрно-белой фотографии —{' '}
                <span className="font-medium">500&nbsp;р.</span>
              </li>
              <li>
                • По вашему желанию мы можем сделать отверстия для крепления
                портрета из керамогранита. Стоимость сверления одного отверстия
                (6&nbsp;мм) — <span className="font-medium">150&nbsp;р.</span>
              </li>
            </ul>
          </section>

          {/* Разделитель */}
          <div className="my-6 h-px bg-neutral-200" />

          {/* Блок: Сроки изготовления */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Сроки изготовления
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              В информации к заказу указан срок изготовления изделия, включающий
              все технологические этапы. Например, для овалов и портретов на
              памятники — <span className="font-medium">7 рабочих дней</span>.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              <span className="font-semibold">Обратите внимание:</span> если вы
              желаете посмотреть макет и при оформлении заказа выбираете
              «предварительное согласование», то срок изготовления отсчитывается
              с того момента, как макет согласован и одобрен вами.
            </p>
          </section>

          {/* Разделитель */}
          <div className="my-6 h-px bg-neutral-200" />

          {/* Блок: Технологические особенности */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Технологические особенности
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              Мелкие точки и окалины могут появиться в результате обжига
              изделия, они не являются браком и не влияют на долговечность и
              качество изображения.
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              В силу специфики производства цветной фотокерамики допускается
              незначительное различие цветов на оригинальном фото и на готовом
              изделии, так как цветовой охват керамических красок меньше охвата
              органических красителей.
            </p>
          </section>

          {/* Разделитель */}
          <div className="my-6 h-px bg-neutral-200" />

          {/* Блок: Дефекты */}
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
              Дефекты
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-neutral-800">
              Фото на памятник (овалы, таблички, портреты), имеющие механические
              повреждения (неправильная установка на памятник или крест,
              несоблюдение условий эксплуатации), обмену и возврату{' '}
              <span className="font-semibold">не подлежат</span>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
