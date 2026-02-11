import { GroupCard } from '../components/group-card';

interface Product {
  id: string;
  title: string;
  price: number;
}

export default function Home() {
  const ovalsAndTables = [
    { name: 'Вертикальные овалы', group: 'vertikalnye-ovaly' },
    { name: 'Горизонтальные овалы ', group: 'gorizontalnye-ovaly' },
    { name: 'Вертикальные таблички ', group: 'vertikalnye-tablichki' },
    { name: 'Горизонтальные таблички ', group: 'gorizontalnye-tablichki' },
    {
      name: 'Овалы и таблички полная затяжка',
      group: 'tablichki-polnaya-zatyazka',
    },
    { name: 'Фигурные таблички', group: 'figurnye-tablichki' },
  ];
  const portraits = [
    {
      name: 'Портреты белый керамогранит',
      group: 'portrety-belyi-keramogranite',
    },
    { name: 'Ростовая фотокерамика', group: 'rostovaya-photokeramika' },
    { name: 'Портреты на стекле', group: 'portrety-na-stekle' },
    {
      name: 'Портреты черный керамогранит',
      group: 'portrety-chernyi-keramogranit',
    },
    { name: 'Гравировка на камне', group: 'gravirovka-na-kamne' },
  ];
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-[15px]">Ritual Shop</h1>
      <div className="mb-[15px]">
        <h2 className="mb-[15px]">Овалы и таблички</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ovalsAndTables.map((item) => {
            return (
              <GroupCard key={item.group} name={item.name} group={item.group} />
            );
          })}
        </div>
      </div>
      <div>
        <h2 className="mb-[15px]">Портреты на памятники</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {portraits.map((item) => {
            return (
              <GroupCard key={item.group} name={item.name} group={item.group} />
            );
          })}
        </div>
      </div>
    </main>
  );
}
